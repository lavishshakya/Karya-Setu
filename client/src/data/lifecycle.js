// Employment-lifecycle mock data (Member 3): attendance, payments, chat, complaints, notifications.
import { ago, lastMonths } from '@/lib/utils'

// Deterministic pseudo-random in [0, 1) so calendars don't reshuffle on every render.
function seeded(n) {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/** One entry per day of the given month. status: present | half | absent | off | today | upcoming */
export function buildMonthAttendance(year, month) {
  const now = new Date()
  const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1)
    const key = date.getTime()
    let status
    if (key > todayKey) status = 'upcoming'
    else if (key === todayKey) status = 'today'
    else if (date.getDay() === 0) status = 'off'
    else {
      const r = seeded(year * 400 + month * 31 + i)
      status = r < 0.07 ? 'absent' : r < 0.17 ? 'half' : 'present'
    }
    const overtime = status === 'present' && seeded(i + month) > 0.75 ? 2 : 0
    return {
      day: i + 1,
      date,
      status,
      hours: status === 'present' ? 8 + overtime : status === 'half' ? 4 : 0,
      overtime,
    }
  })
}

export const workHistory = [
  {
    id: 'wh-1',
    employer: 'Sharma Constructions',
    role: 'Mason',
    site: 'Sanganer boundary wall',
    from: ago({ days: 5 }),
    to: null,
    days: 4,
    rating: null,
  },
  {
    id: 'wh-2',
    employer: 'Sharma Constructions',
    role: 'Senior mason',
    site: 'Malviya Nagar Residency',
    from: '2026-04-06',
    to: '2026-09-27',
    days: 128,
    rating: 4.9,
  },
  {
    id: 'wh-3',
    employer: 'Pink City Interiors',
    role: 'Tile fitter',
    site: 'C-Scheme showroom',
    from: '2026-02-02',
    to: '2026-03-21',
    days: 38,
    rating: 4.6,
  },
  {
    id: 'wh-4',
    employer: 'Shree Balaji Builders',
    role: 'Mason',
    site: 'Jagatpura towers',
    from: '2021-01-11',
    to: '2024-03-30',
    days: 610,
    rating: 4.7,
  },
]

const months6 = lastMonths(7).slice(0, 6)

export const workerMonthlyEarnings = months6.map((month, i) => ({
  month,
  earned: [15400, 16200, 17850, 19600, 18450, 21300][i],
  days: [20, 21, 23, 24, 23, 25][i],
}))

export const workerPayments = [
  {
    id: 'PAY-24117',
    period: '06 – 11 Oct',
    employer: 'Sharma Constructions',
    days: 4,
    rate: 780,
    deductions: 0,
    status: 'pending',
    paidOn: null,
    method: 'UPI',
  },
  {
    id: 'PAY-24091',
    period: '29 Sep – 05 Oct',
    employer: 'Sharma Constructions',
    days: 6,
    rate: 800,
    deductions: 0,
    status: 'paid',
    paidOn: ago({ days: 5 }),
    method: 'UPI',
  },
  {
    id: 'PAY-24052',
    period: '22 – 28 Sep',
    employer: 'Sharma Constructions',
    days: 6,
    rate: 800,
    deductions: 300,
    status: 'paid',
    paidOn: ago({ days: 12 }),
    method: 'UPI',
  },
  {
    id: 'PAY-23988',
    period: '15 – 21 Sep',
    employer: 'Shree Balaji Builders',
    days: 6,
    rate: 820,
    deductions: 0,
    status: 'disputed',
    paidOn: null,
    method: 'Bank',
  },
  {
    id: 'PAY-23950',
    period: '08 – 14 Sep',
    employer: 'Sharma Constructions',
    days: 5.5,
    rate: 800,
    deductions: 0,
    status: 'paid',
    paidOn: ago({ days: 26 }),
    method: 'UPI',
  },
  {
    id: 'PAY-23911',
    period: '01 – 07 Sep',
    employer: 'Sharma Constructions',
    days: 6,
    rate: 800,
    deductions: 500,
    status: 'paid',
    paidOn: ago({ days: 33 }),
    method: 'Cash',
  },
  {
    id: 'PAY-23874',
    period: '25 – 31 Aug',
    employer: 'Sharma Constructions',
    days: 6,
    rate: 800,
    deductions: 0,
    status: 'paid',
    paidOn: ago({ days: 40 }),
    method: 'UPI',
  },
].map((p) => ({ ...p, gross: Math.round(p.days * p.rate), net: Math.round(p.days * p.rate) - p.deductions }))

export const payrollCycle = { label: '06 – 12 Oct', due: 'Due tomorrow' }

/** Demo employer's payroll for the current weekly cycle. status: pending | processing | paid */
export const employerPayroll = [
  { workerId: 'w-1001', days: 5, rate: 780, advance: 0, status: 'pending' },
  { workerId: 'w-1014', days: 6, rate: 800, advance: 500, status: 'pending' },
  { workerId: 'w-1011', days: 6, rate: 820, advance: 0, status: 'paid' },
  { workerId: 'w-1013', days: 4.5, rate: 760, advance: 0, status: 'pending' },
  { workerId: 'w-1007', days: 6, rate: 760, advance: 1000, status: 'paid' },
  { workerId: 'w-1009', days: 3, rate: 480, advance: 0, status: 'pending' },
  { workerId: 'w-1016', days: 6, rate: 470, advance: 0, status: 'processing' },
  { workerId: 'w-1015', days: 5, rate: 520, advance: 0, status: 'pending' },
]

export const employerMonthlySpend = months6.map((month, i) => ({
  month,
  spend: [312000, 356000, 289000, 418000, 476000, 509000][i],
  workers: [24, 27, 22, 31, 34, 36][i],
}))

const conversationsByRole = {
  worker: [
    {
      id: 'cv-1',
      name: 'Anil Sharma',
      subtitle: 'Sharma Constructions',
      online: true,
      unread: 0,
      verified: true,
      messages: [
        {
          id: 1,
          from: 'them',
          text: 'Ramesh ji, kal subah 8 baje Sanganer site pe pahunch jaana.',
          at: ago({ hours: 3, minutes: 12 }),
        },
        {
          id: 2,
          from: 'me',
          text: 'Ji sir, main 7:45 tak pahunch jaunga. Cement aa gaya hai?',
          at: ago({ hours: 3, minutes: 5 }),
        },
        {
          id: 3,
          from: 'them',
          text: 'Haan, 40 bags aa gaye hain. A helper will join you from tomorrow.',
          at: ago({ hours: 3 }),
        },
        {
          id: 4,
          from: 'them',
          text: "I'll send this week's payment on UPI by tomorrow evening.",
          at: ago({ hours: 2, minutes: 58 }),
        },
        { id: 5, from: 'me', text: 'Dhanyavaad sir 🙏', at: ago({ hours: 2, minutes: 40 }), read: true },
      ],
    },
    {
      id: 'cv-2',
      name: 'Neha Kapoor',
      subtitle: 'Pink City Interiors · HR',
      online: false,
      unread: 2,
      verified: true,
      messages: [
        {
          id: 1,
          from: 'me',
          text: 'Namaste, I have applied for the tile fitter job in Vaishali Nagar.',
          at: ago({ hours: 5 }),
        },
        { id: 2, from: 'them', text: 'Thanks Ramesh! We liked your profile.', at: ago({ hours: 1, minutes: 10 }) },
        {
          id: 3,
          from: 'them',
          text: 'Can you share photos of bathroom tiling you have done before?',
          at: ago({ hours: 1, minutes: 9 }),
        },
      ],
    },
    {
      id: 'cv-3',
      name: 'Rajesh Gurjar',
      subtitle: 'Mason · Vaishali Nagar',
      online: true,
      unread: 1,
      verified: true,
      messages: [
        {
          id: 1,
          from: 'them',
          text: 'Bhai, Jagatpura mein bar bending ka kaam aaya hai. Apply kar de.',
          at: ago({ days: 1, hours: 2 }),
        },
      ],
    },
    {
      id: 'cv-4',
      name: 'Karya Setu Support',
      subtitle: 'Official',
      online: true,
      unread: 0,
      verified: true,
      messages: [
        {
          id: 1,
          from: 'them',
          text: 'Your skill certificate (Assistant Mason, NSQF L3) has been verified. ✅',
          at: ago({ days: 3 }),
        },
        { id: 2, from: 'me', text: 'Thank you!', at: ago({ days: 3 }), read: true },
      ],
    },
  ],
  employer: [
    {
      id: 'cv-1',
      name: 'Ramesh Kumar',
      subtitle: 'Mason · Sanganer site',
      online: true,
      unread: 1,
      verified: true,
      messages: [
        {
          id: 1,
          from: 'me',
          text: 'Ramesh ji, kal subah 8 baje Sanganer site pe pahunch jaana.',
          at: ago({ hours: 3, minutes: 12 }),
        },
        {
          id: 2,
          from: 'them',
          text: 'Ji sir, main 7:45 tak pahunch jaunga. Cement aa gaya hai?',
          at: ago({ hours: 3, minutes: 5 }),
        },
        {
          id: 3,
          from: 'me',
          text: 'Haan, 40 bags aa gaye hain. A helper will join you from tomorrow.',
          at: ago({ hours: 3 }),
          read: true,
        },
        {
          id: 4,
          from: 'them',
          text: 'Boundary wall is about 60% done. Will finish the east side by Saturday.',
          at: ago({ minutes: 25 }),
        },
      ],
    },
    {
      id: 'cv-2',
      name: 'Vikram Singh',
      subtitle: 'Welder · applied to Bar bender',
      online: false,
      unread: 2,
      verified: true,
      messages: [
        {
          id: 1,
          from: 'them',
          text: 'Sir, I have 8 years of fabrication and bar bending experience.',
          at: ago({ hours: 6 }),
        },
        { id: 2, from: 'them', text: 'Can I visit the Jagatpura site tomorrow for a trial?', at: ago({ hours: 6 }) },
      ],
    },
    {
      id: 'cv-3',
      name: 'Rajesh Gurjar',
      subtitle: 'Mason · shortlisted',
      online: true,
      unread: 0,
      verified: true,
      messages: [
        { id: 1, from: 'me', text: 'Can you join from Monday at Malviya Nagar?', at: ago({ days: 1 }) },
        { id: 2, from: 'them', text: 'Yes sir, I will be there at 8.', at: ago({ days: 1 }) },
      ],
    },
    {
      id: 'cv-4',
      name: 'Karya Setu Support',
      subtitle: 'Official',
      online: true,
      unread: 0,
      verified: true,
      messages: [
        {
          id: 1,
          from: 'them',
          text: 'Your GST verification is complete. Your jobs now show the Verified badge.',
          at: ago({ days: 4 }),
        },
      ],
    },
  ],
}

export const conversationsFor = (role) => conversationsByRole[role] ?? conversationsByRole.worker

export const COMPLAINT_CATEGORIES = [
  'Payment not received',
  'Wage lower than agreed',
  'Unsafe working conditions',
  'Harassment or abuse',
  'Fraudulent job posting',
  'Worker no-show',
  'Other',
]

const complaintsByRole = {
  worker: [
    {
      id: 'KS-C-1042',
      title: 'Payment pending for 6 days of work',
      category: 'Payment not received',
      against: 'Shree Balaji Builders',
      amount: 4920,
      status: 'in-review',
      priority: 'high',
      createdAt: ago({ days: 4 }),
      timeline: [
        { label: 'Complaint submitted', at: ago({ days: 4 }), done: true },
        { label: 'Assigned to labour facilitator', at: ago({ days: 3 }), done: true },
        { label: 'Employer response awaited', at: null, done: false },
        { label: 'Resolved', at: null, done: false },
      ],
    },
    {
      id: 'KS-C-0987',
      title: 'No helmets or harness on site',
      category: 'Unsafe working conditions',
      against: 'Local contractor, Sanganer',
      amount: null,
      status: 'resolved',
      priority: 'medium',
      createdAt: ago({ days: 23 }),
      resolution: 'Employer issued safety gear to all 14 workers; site re-inspected by the panchayat.',
      timeline: [
        { label: 'Complaint submitted', at: ago({ days: 23 }), done: true },
        { label: 'Site inspection', at: ago({ days: 21 }), done: true },
        { label: 'Corrective action', at: ago({ days: 19 }), done: true },
        { label: 'Resolved', at: ago({ days: 18 }), done: true },
      ],
    },
  ],
  employer: [
    {
      id: 'KS-C-1051',
      title: 'Worker absent after taking advance',
      category: 'Worker no-show',
      against: 'Suresh Bairwa (KS-RJ-2026-007731)',
      amount: 1000,
      status: 'open',
      priority: 'medium',
      createdAt: ago({ days: 1 }),
      timeline: [
        { label: 'Complaint submitted', at: ago({ days: 1 }), done: true },
        { label: 'Under review', at: null, done: false },
        { label: 'Resolved', at: null, done: false },
      ],
    },
  ],
}

export const complaintsFor = (role) => complaintsByRole[role] ?? []

const notificationsByRole = {
  worker: [
    {
      id: 1,
      type: 'job',
      title: 'New 94% match: Tile fitter in Vaishali Nagar',
      at: ago({ minutes: 20 }),
      unread: true,
    },
    {
      id: 2,
      type: 'application',
      title: "You're shortlisted for “Mason for G+3 residential building”",
      at: ago({ hours: 3 }),
      unread: true,
    },
    { id: 3, type: 'payment', title: '₹4,800 received from Sharma Constructions', at: ago({ days: 5 }), unread: true },
    {
      id: 4,
      type: 'attendance',
      title: 'Reminder: check in at Sanganer site by 8:00 AM',
      at: ago({ days: 1 }),
      unread: false,
    },
    {
      id: 5,
      type: 'scheme',
      title: 'You may be eligible for the PM-SYM pension scheme',
      at: ago({ days: 2 }),
      unread: false,
    },
  ],
  employer: [
    {
      id: 1,
      type: 'application',
      title: '4 new applicants for “Mason for G+3 residential building”',
      at: ago({ minutes: 45 }),
      unread: true,
    },
    { id: 2, type: 'attendance', title: "Suresh Bairwa hasn't checked in today", at: ago({ hours: 2 }), unread: true },
    { id: 3, type: 'payment', title: 'Payroll for 06 – 12 Oct is due tomorrow', at: ago({ hours: 5 }), unread: false },
    { id: 4, type: 'system', title: 'GST verification approved', at: ago({ days: 4 }), unread: false },
  ],
  admin: [
    {
      id: 1,
      type: 'fraud',
      title: 'High-risk job flagged: “Masons needed for Dubai project”',
      at: ago({ minutes: 12 }),
      unread: true,
    },
    {
      id: 2,
      type: 'dispute',
      title: 'Dispute KS-C-1042 is close to its 72-hour SLA',
      at: ago({ hours: 1 }),
      unread: true,
    },
    {
      id: 3,
      type: 'user',
      title: '38 employer verifications are waiting for review',
      at: ago({ hours: 4 }),
      unread: false,
    },
  ],
  panchayat: [
    {
      id: 1,
      type: 'scheme',
      title: 'e-Shram registration camp scheduled for Saturday',
      at: ago({ hours: 2 }),
      unread: true,
    },
    { id: 2, type: 'user', title: '12 workers have had no work for 30+ days', at: ago({ days: 1 }), unread: true },
    { id: 3, type: 'system', title: 'Monthly employment report is ready', at: ago({ days: 3 }), unread: false },
  ],
}

export const notificationsFor = (role) => notificationsByRole[role] ?? []
