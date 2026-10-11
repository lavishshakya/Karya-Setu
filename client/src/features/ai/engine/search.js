// Turns typed or spoken queries (English, Hindi or Hinglish) into search tokens, so
// "मुझे पास में मिस्त्री का काम चाहिए" finds mason jobs.

const HINDI_TO_ENGLISH = {
  राजमिस्त्री: 'mason',
  मिस्त्री: 'mason',
  mistri: 'mason',
  raj: 'mason',
  बढ़ई: 'carpenter',
  बढई: 'carpenter',
  कारपेंटर: 'carpenter',
  बिजली: 'electrician',
  इलेक्ट्रीशियन: 'electrician',
  बिजलीवाला: 'electrician',
  प्लंबर: 'plumber',
  नल: 'plumber',
  पेंटर: 'painter',
  पुताई: 'painter',
  रंग: 'painter',
  वेल्डर: 'welder',
  वेल्डिंग: 'welder',
  टाइल: 'tile',
  हेल्पर: 'helper',
  मज़दूर: 'helper',
  मजदूर: 'helper',
  बेलदार: 'helper',
  खेत: 'farm',
  खेती: 'farm',
  किसान: 'farm',
  ड्राइवर: 'driver',
  गाड़ी: 'driver',
  रसोइया: 'cook',
  खाना: 'cook',
  कुक: 'cook',
  गार्ड: 'security',
  चौकीदार: 'security',
  दर्जी: 'tailor',
  सिलाई: 'tailor',
  जयपुर: 'jaipur',
  सांगानेर: 'sanganer',
  मानसरोवर: 'mansarovar',
  जगतपुरा: 'jagatpura',
}

const STOPWORDS = new Set([
  'मुझे',
  'पास',
  'में',
  'का',
  'की',
  'के',
  'काम',
  'चाहिए',
  'है',
  'कोई',
  'नौकरी',
  'आसपास',
  'यहाँ',
  'यहां',
  'job',
  'jobs',
  'work',
  'near',
  'me',
  'nearby',
  'find',
  'for',
  'a',
  'an',
  'the',
  'in',
  'i',
  'want',
  'need',
  'show',
  'kaam',
  'chahiye',
  'mujhe',
  'paas',
  'mein',
  'ka',
])

export function queryTokens(query) {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => HINDI_TO_ENGLISH[word] ?? word)
    .filter((word) => !STOPWORDS.has(word))
}

/** True when every meaningful token appears in the haystack (empty queries match everything). */
export function matchesQuery(haystack, tokens) {
  const text = haystack.toLowerCase()
  return tokens.every((token) => text.includes(token))
}
