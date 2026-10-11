import { Mic, MicOff } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'
import { useSpeechRecognition } from './useSpeechRecognition'

/** Mic button that dictates into a search box (hi-IN / en-IN follows the UI language). */
export default function VoiceSearchButton({ onTranscript, className, size = 40 }) {
  const { lang } = useLang()
  const toast = useToast()
  const { supported, listening, start, stop } = useSpeechRecognition({
    lang: lang === 'hi' ? 'hi-IN' : 'en-IN',
    onResult: (text) => onTranscript(text),
  })

  const onClick = () => {
    if (listening) return stop()
    if (!supported || !start()) {
      toast({
        tone: 'info',
        title: 'Voice search needs Chrome or Edge',
        description: 'Your browser does not support speech recognition.',
      })
      return
    }
    toast({
      tone: 'ai',
      title: lang === 'hi' ? 'बोलिए… हम सुन रहे हैं' : 'Listening… speak now',
      description: lang === 'hi' ? 'जैसे: “पास में मिस्त्री का काम”' : 'Try: “mason jobs near me”',
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={listening ? 'Stop voice search' : 'Search by voice'}
      title={listening ? 'Stop' : 'Search by voice'}
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full transition',
        listening
          ? 'bg-rose-500 text-white'
          : 'bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {listening && <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/50" />}
      {listening ? <MicOff size={size * 0.45} className="relative" /> : <Mic size={size * 0.45} />}
    </button>
  )
}
