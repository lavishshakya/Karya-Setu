// Setu AI v1 — keyword intent matcher with bilingual (EN/HI) replies built from live data.
// To move to an LLM or NLU service, replace `getBotReply` with an API call that returns
// the same { text, actions } shape; the widget doesn't need to change.
import { jobs } from '@/data/jobs'
import { workerProfile, workers } from '@/data/workers'
import { employerPayroll } from '@/data/lifecycle'
import { platformStats } from '@/data/admin'
import { panchayatStats } from '@/data/panchayat'
import { recommendJobs } from './recommend'
import { predictWage } from './wage'
import { formatINR } from '@/lib/utils'

// Earlier intents win ties, so specific problems ("payment late") beat generic words ("work").
const INTENTS = [
  ['complaint', ['complaint', 'shikayat', 'शिकायत', 'fraud', 'cheat', 'dhokha', 'धोखा', 'harass', 'unsafe', 'abuse']],
  [
    'payment',
    ['payment', 'paid', 'not received', 'paisa', 'paise', 'पैसा', 'पैसे', 'भुगतान', 'payroll', 'salary late', 'bakaya'],
  ],
  [
    'wage',
    [
      'wage',
      'salary',
      'rate',
      'majdoori',
      'mazdoori',
      'मज़दूरी',
      'मजदूरी',
      'kitna',
      'कितना',
      'कितनी',
      'how much',
      'fair',
    ],
  ],
  ['attendance', ['attendance', 'check in', 'check-in', 'hazri', 'haziri', 'हाज़िरी', 'हाजिरी']],
  [
    'scheme',
    ['scheme', 'yojana', 'योजना', 'योजनाएं', 'pension', 'insurance', 'e-shram', 'eshram', 'ayushman', 'बीमा', 'पेंशन'],
  ],
  ['fraud', ['fraud alert', 'risk', 'suspicious', 'duplicate', 'fake']],
  ['dispute', ['dispute', 'sla', 'vivad', 'विवाद']],
  ['resume', ['resume', 'cv', 'biodata', 'बायोडाटा', 'रिज़्यूमे']],
  ['training', ['training', 'course', 'learn', 'seekh', 'सीख', 'प्रशिक्षण', 'skill gap', 'certificate']],
  ['id', ['id card', 'qr', 'worker id', 'पहचान']],
  ['hire', ['hire', 'post a job', 'post job', 'workers near', 'labour', 'candidate', 'श्रमिक चाहिए']],
  [
    'jobs',
    [
      'job',
      'jobs',
      'work',
      'kaam',
      'काम',
      'naukri',
      'नौकरी',
      'mason',
      'mistri',
      'मिस्त्री',
      'electrician',
      'plumber',
      'near',
      'nearby',
      'पास',
    ],
  ],
  ['greet', ['hello', 'hi', 'namaste', 'नमस्ते', 'hey', 'namaskar']],
]

function detectIntent(message) {
  const text = message.toLowerCase()
  let best = null
  let bestHits = 0
  for (const [intent, words] of INTENTS) {
    const hits = words.filter((w) => text.includes(w)).length
    if (hits > bestHits) {
      best = intent
      bestHits = hits
    }
  }
  return best
}

const hasDevanagari = (s) => /[ऀ-ॿ]/.test(s)

export const SUGGESTIONS = {
  worker: {
    en: ['Find mason jobs near me', 'What wage should I ask for?', 'My payment is late', 'Which schemes can I get?'],
    hi: [
      'पास में मिस्त्री का काम',
      'मुझे कितनी मज़दूरी मांगनी चाहिए?',
      'मेरा भुगतान नहीं आया',
      'मुझे कौन सी योजनाएं मिलेंगी?',
    ],
  },
  employer: {
    en: ['Find workers near my site', 'Fair wage for a mason?', 'Payroll due this week', 'How do I post a job?'],
    hi: ['मेरी साइट के पास श्रमिक', 'मिस्त्री की सही मज़दूरी?', 'इस हफ़्ते का भुगतान', 'काम कैसे पोस्ट करें?'],
  },
  admin: {
    en: ['Show high-risk fraud alerts', 'Disputes close to SLA', 'Platform numbers this month'],
    hi: ['ज़्यादा जोखिम वाले अलर्ट', 'SLA के क़रीब विवाद', 'इस महीने के आंकड़े'],
  },
  panchayat: {
    en: ['Workers without work for 30 days', 'Schemes for my workers', 'Upcoming camps'],
    hi: ['30 दिन से बेरोज़गार श्रमिक', 'श्रमिकों के लिए योजनाएं', 'आने वाले कैंप'],
  },
}

export function getGreeting(user, lang) {
  const first = user.name.split(' ')[0]
  return lang === 'hi'
    ? {
        text: `नमस्ते ${first} जी! मैं सेतु AI हूँ। काम, मज़दूरी, भुगतान, हाज़िरी या सरकारी योजनाओं के बारे में कुछ भी पूछिए। आप बोलकर भी पूछ सकते हैं 🎙️`,
      }
    : {
        text: `Namaste ${first}! I'm Setu AI. Ask me about jobs, wages, payments, attendance or government schemes. You can also tap the mic and speak 🎙️`,
      }
}

export function getBotReply(message, { role, lang: uiLang }) {
  const hi = uiLang === 'hi' || hasDevanagari(message)
  const L = (en, hiText) => (hi ? hiText : en)
  const base = `/${role}`
  const intent = detectIntent(message)

  switch (intent) {
    case 'greet':
      return { text: L('Namaste! How can I help you today?', 'नमस्ते! बताइए, आज मैं आपकी क्या मदद करूँ?') }

    case 'jobs': {
      if (role !== 'worker') break
      const [top, ...rest] = recommendJobs(workerProfile, jobs)
      const strong = rest.filter((r) => r.score >= 70).length
      return {
        text: L(
          `Your best match: “${top.job.title}” in ${top.job.area}, ₹${top.job.wage}/day, ${top.distance.toFixed(1)} km away (${top.score}% match). I found ${strong} more strong matches for your skills nearby.`,
          `आपके लिए सबसे अच्छा काम: ${top.job.area} में “${top.job.title}”, ₹${top.job.wage}/दिन, ${top.distance.toFixed(1)} किमी दूर (${top.score}% मेल)। आपके हुनर से मिलते ${strong} और अच्छे काम भी पास में हैं।`,
        ),
        actions: [{ label: L('See all matches', 'सभी काम देखें'), to: '/worker/jobs' }],
      }
    }

    case 'hire': {
      if (role !== 'employer') break
      const available = workers.filter((w) => w.available && w.verified).length
      return {
        text: L(
          `${available} verified workers are available near your sites. Post a job and I will rank applicants by skill, distance and rating.`,
          `आपकी साइटों के पास ${available} सत्यापित श्रमिक उपलब्ध हैं। काम पोस्ट करें, मैं आवेदकों को हुनर, दूरी और रेटिंग के आधार पर क्रम दूँगा।`,
        ),
        actions: [
          { label: L('Post a job', 'काम पोस्ट करें'), to: '/employer/post-job' },
          { label: L('Nearby workers', 'आसपास के श्रमिक'), to: '/employer/nearby' },
        ],
      }
    }

    case 'wage': {
      if (role !== 'worker' && role !== 'employer') break
      const p = predictWage({
        skill: 'Mason',
        district: 'Jaipur',
        experience: role === 'worker' ? workerProfile.experience : 5,
        certified: true,
      })
      return {
        text: L(
          `A fair rate for a certified mason in Jaipur${role === 'worker' ? ` with ${workerProfile.experience} years of experience` : ''} is about ₹${p.daily}/day (range ₹${p.min}–₹${p.max}).`,
          `जयपुर में प्रमाणित मिस्त्री${role === 'worker' ? ` (${workerProfile.experience} साल अनुभव)` : ''} के लिए सही मज़दूरी लगभग ₹${p.daily}/दिन है (₹${p.min}–₹${p.max})।`,
        ),
        actions: [{ label: L('Open wage predictor', 'मज़दूरी अनुमान खोलें'), to: `${base}/wages` }],
      }
    }

    case 'payment':
      if (role === 'worker') {
        return {
          text: L(
            `₹4,800 from Sharma Constructions was paid 5 days ago. ${formatINR(3120)} for this week is pending. One payment of ${formatINR(4920)} is under dispute and a facilitator is following up.`,
            `शर्मा कंस्ट्रक्शन्स से ₹4,800 का भुगतान 5 दिन पहले हुआ। इस हफ़्ते के ${formatINR(3120)} बाकी हैं। ${formatINR(4920)} का एक भुगतान विवाद में है, जिसकी जाँच चल रही है।`,
          ),
          actions: [
            { label: L('View payments', 'भुगतान देखें'), to: '/worker/payments' },
            { label: L('Raise a complaint', 'शिकायत दर्ज करें'), to: '/worker/complaints' },
          ],
        }
      }
      if (role === 'employer') {
        const pending = employerPayroll.filter((p) => p.status === 'pending')
        const due = formatINR(pending.reduce((sum, p) => sum + Math.round(p.days * p.rate) - p.advance, 0))
        return {
          text: L(
            `This week's payroll is due tomorrow: ${due} is pending for ${pending.length} workers.`,
            `इस हफ़्ते का भुगतान कल देय है: ${pending.length} श्रमिकों के ${due} बाकी हैं।`,
          ),
          actions: [{ label: L('Open payroll', 'पेरोल खोलें'), to: '/employer/payments' }],
        }
      }
      break

    case 'attendance':
      if (role !== 'worker' && role !== 'employer') break
      return {
        text: L(
          role === 'worker'
            ? 'Tap “Check in” on the Attendance page when you reach the site. Your GPS location is matched to the site automatically and builds your verified work history.'
            : '6 of 8 team members have checked in today. Suresh Bairwa is absent and Manoj Verma is on leave.',
          role === 'worker'
            ? 'साइट पर पहुँचकर हाज़िरी पेज पर “चेक इन” दबाएँ। आपकी GPS लोकेशन साइट से अपने आप मिलाई जाती है।'
            : 'आज टीम के 8 में से 6 सदस्यों ने चेक इन किया है। सुरेश बैरवा अनुपस्थित हैं और मनोज वर्मा छुट्टी पर हैं।',
        ),
        actions: [{ label: L('Open attendance', 'हाज़िरी खोलें'), to: `${base}/attendance` }],
      }

    case 'scheme':
      if (role === 'panchayat') {
        return {
          text: L(
            `${panchayatStats.seeking} workers are seeking work. Many are eligible for e-Shram, PMSBY and MGNREGA but not yet enrolled.`,
            `${panchayatStats.seeking} श्रमिक काम की तलाश में हैं। कई e-Shram, PMSBY और मनरेगा के पात्र हैं, पर अभी तक जुड़े नहीं हैं।`,
          ),
          actions: [{ label: L('Open schemes', 'योजनाएं खोलें'), to: '/panchayat/schemes' }],
        }
      }
      return {
        text: L(
          'Based on your age and work you may be eligible for e-Shram, PM-SYM (₹3,000/month pension after 60), PMSBY accident cover and the construction workers welfare board. Your panchayat or nearest CSC can help you enrol.',
          'आपकी उम्र और काम के आधार पर आप e-Shram, PM-SYM (60 के बाद ₹3,000 मासिक पेंशन), PMSBY दुर्घटना बीमा और निर्माण श्रमिक कल्याण बोर्ड के पात्र हो सकते हैं। पंचायत या नज़दीकी CSC पर पंजीकरण कराएँ।',
        ),
      }

    case 'complaint':
      if (role !== 'worker' && role !== 'employer') break
      return {
        text: L(
          "I'm sorry you're facing this. File a complaint with details and any photos; a labour facilitator reviews it within 72 hours and you can track every step.",
          'आपको परेशानी हुई, इसका खेद है। विवरण और फ़ोटो के साथ शिकायत दर्ज करें; 72 घंटे में श्रम सहायक इसकी जाँच करेंगे और आप हर कदम देख पाएंगे।',
        ),
        actions: [{ label: L('File a complaint', 'शिकायत दर्ज करें'), to: `${base}/complaints` }],
      }

    case 'resume':
      if (role !== 'worker') break
      return {
        text: L(
          'I can turn your profile into a professional resume and download it as a PDF in one tap.',
          'मैं आपकी प्रोफ़ाइल से एक टैप में अच्छा रिज़्यूमे बनाकर PDF डाउनलोड कर सकता हूँ।',
        ),
        actions: [{ label: L('Build my resume', 'रिज़्यूमे बनाएं'), to: '/worker/resume' }],
      }

    case 'training':
      if (role !== 'worker') break
      return {
        text: L(
          'Tile fitting is the most in-demand skill near you. The free PMKVY course “Advanced tiling & finishing” could raise your daily wage by about 12%.',
          'आपके इलाके में टाइल फिटिंग की सबसे ज़्यादा माँग है। मुफ़्त PMKVY कोर्स “एडवांस्ड टाइलिंग” से आपकी मज़दूरी लगभग 12% बढ़ सकती है।',
        ),
        actions: [{ label: L('See training', 'प्रशिक्षण देखें'), to: '/worker/training' }],
      }

    case 'id':
      if (role !== 'worker') break
      return {
        text: L(
          'Your QR Worker ID lets any employer verify your identity, skills and ratings instantly.',
          'आपका QR श्रमिक पहचान पत्र किसी भी नियोक्ता को आपकी पहचान, हुनर और रेटिंग तुरंत दिखाता है।',
        ),
        actions: [{ label: L('Open Worker ID', 'पहचान पत्र खोलें'), to: '/worker/id' }],
      }

    case 'fraud':
      if (role !== 'admin') break
      return {
        text: L(
          `There are ${platformStats.fraudAlerts} open fraud alerts. Three are high risk, including a fee-for-job posting by Global Manpower Solutions.`,
          `${platformStats.fraudAlerts} धोखाधड़ी अलर्ट खुले हैं। 3 ज़्यादा जोखिम वाले हैं, जिनमें ग्लोबल मैनपावर सॉल्यूशंस का फ़ीस माँगने वाला काम शामिल है।`,
        ),
        actions: [{ label: L('Review alerts', 'अलर्ट देखें'), to: '/admin/fraud' }],
      }

    case 'dispute':
      if (role !== 'admin') break
      return {
        text: L(
          'KS-C-1042 has breached its 72-hour SLA and KS-C-1048 has 22 hours left.',
          'KS-C-1042 की 72 घंटे की SLA पार हो गई है और KS-C-1048 के 22 घंटे बचे हैं।',
        ),
        actions: [{ label: L('Open disputes', 'विवाद खोलें'), to: '/admin/disputes' }],
      }

    default:
      break
  }

  if (role === 'admin') {
    return {
      text: L(
        `This month: ${platformStats.placementsMonth.toLocaleString('en-IN')} placements, ${platformStats.activeJobs.toLocaleString('en-IN')} active jobs and ${platformStats.openDisputes} open disputes.`,
        `इस महीने: ${platformStats.placementsMonth.toLocaleString('en-IN')} नियुक्तियाँ, ${platformStats.activeJobs.toLocaleString('en-IN')} सक्रिय काम और ${platformStats.openDisputes} खुले विवाद।`,
      ),
      actions: [{ label: L('Open analytics', 'विश्लेषण खोलें'), to: '/admin/analytics' }],
    }
  }
  if (role === 'panchayat') {
    return {
      text: L(
        '12 workers have had no work for 30+ days. An e-Shram camp and a Rozgar Mela are coming up this month.',
        '12 श्रमिकों को 30+ दिनों से काम नहीं मिला है। इस महीने e-Shram कैंप और रोज़गार मेला होने वाले हैं।',
      ),
      actions: [{ label: L('View workers', 'श्रमिक देखें'), to: '/panchayat/workers' }],
    }
  }
  return {
    text: L(
      "I'm still learning! Try asking about jobs, wages, payments, attendance, schemes or complaints.",
      'मैं अभी सीख रहा हूँ! काम, मज़दूरी, भुगतान, हाज़िरी, योजनाओं या शिकायत के बारे में पूछिए।',
    ),
  }
}
