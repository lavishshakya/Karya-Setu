import { useCallback, useEffect, useRef, useState } from 'react'

const Recognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined

/**
 * Browser speech-to-text (Web Speech API — Chrome, Edge, Android). Works for hi-IN and en-IN.
 * onResult(transcript, isFinal) fires as the user speaks.
 */
export function useSpeechRecognition({ lang = 'en-IN', onResult } = {}) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  })

  useEffect(() => () => recognitionRef.current?.abort(), [])

  const start = useCallback(() => {
    if (!Recognition) return false
    recognitionRef.current?.abort()
    const recognition = new Recognition()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
      onResultRef.current?.(transcript, event.results[event.results.length - 1].isFinal)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
    return true
  }, [lang])

  const stop = useCallback(() => recognitionRef.current?.stop(), [])

  return { supported: Boolean(Recognition), listening, start, stop }
}
