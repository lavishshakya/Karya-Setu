import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Bot, Mic, SendHorizontal, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'
import { SUGGESTIONS, getBotReply, getGreeting } from './engine/chatbot'
import { useSpeechRecognition } from './useSpeechRecognition'

const ChatbotContext = createContext({ isOpen: false, open: () => {}, close: () => {} })

export function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const value = useMemo(() => ({ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }), [isOpen])
  return <ChatbotContext value={value}>{children}</ChatbotContext>
}

export function useChatbot() {
  return useContext(ChatbotContext)
}

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

/** Floating "Setu AI" assistant (Member 4) available on every dashboard page. */
export default function ChatbotWidget() {
  const { isOpen, open, close } = useChatbot()
  const { user } = useAuth()
  const { lang } = useLang()
  const toast = useToast()
  const [messages, setMessages] = useState([{ id: 0, from: 'bot', greeting: true }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef(null)
  const timers = useRef([])

  const speech = useSpeechRecognition({ lang: lang === 'hi' ? 'hi-IN' : 'en-IN', onResult: (text) => setInput(text) })

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, isOpen])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const send = (raw) => {
    const text = raw.trim()
    if (!text || typing) return
    setMessages((list) => [...list, { id: Date.now(), from: 'me', text }])
    setInput('')
    setTyping(true)
    timers.current.push(
      setTimeout(
        () => {
          setMessages((list) => [
            ...list,
            { id: Date.now() + 1, from: 'bot', ...getBotReply(text, { role: user.role, lang }) },
          ])
          setTyping(false)
        },
        650 + Math.min(text.length * 8, 450),
      ),
    )
  }

  const toggleMic = () => {
    if (speech.listening) return speech.stop()
    if (!speech.start()) toast({ tone: 'info', title: 'Voice input needs Chrome or Edge' })
  }

  const suggestions = SUGGESTIONS[user.role]?.[lang] ?? []
  // The Messages page has its own composer where the FAB would sit; Setu AI stays in the sidebar there.
  const hideFab = useLocation().pathname.endsWith('/messages')

  return (
    <>
      <AnimatePresence>
        {!isOpen && !hideFab && (
          <motion.button
            key="fab"
            type="button"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={open}
            className="fixed right-4 bottom-24 z-40 grid size-14 place-items-center rounded-2xl bg-linear-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-600/30 lg:right-6 lg:bottom-6 print:hidden"
            aria-label="Open Setu AI assistant"
          >
            <span className="absolute inset-0 animate-ping-slow rounded-2xl bg-violet-500/40" />
            <Sparkles size={24} className="relative" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="panel"
            aria-label="Setu AI assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed inset-x-2 top-16 bottom-2 z-[60] flex origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-pop sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:max-h-[calc(100dvh-6rem)] sm:w-[400px] print:hidden"
          >
            <header className="relative flex items-center gap-3 overflow-hidden bg-linear-to-r from-violet-600 to-fuchsia-500 px-4 py-3.5 text-white">
              <Sparkles className="absolute -top-3 right-16 size-20 text-white/10" />
              <span className="grid size-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <Bot size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Setu AI</p>
                <p className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  {lang === 'hi' ? 'हिंदी और अंग्रेज़ी में जवाब' : 'Replies in Hindi & English'}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 hover:bg-white/15"
                aria-label="Close assistant"
              >
                <X size={20} />
              </button>
            </header>

            <div ref={listRef} className="flex-1 scrollbar-thin space-y-3 overflow-y-auto bg-bg/60 px-4 py-4">
              {messages.map((m) => {
                const content = m.greeting ? getGreeting(user, lang) : m
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}
                  >
                    <div className="max-w-[85%] space-y-2">
                      <div
                        className={cn(
                          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                          m.from === 'me'
                            ? 'rounded-br-md bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950'
                            : 'rounded-bl-md border border-line bg-surface text-ink',
                        )}
                      >
                        {content.text}
                      </div>
                      {content.actions?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {content.actions.map((a) => (
                            <Link
                              key={a.to}
                              to={a.to}
                              onClick={() => window.innerWidth < 640 && close()}
                              className="inline-flex h-8 items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"
                            >
                              {a.label}
                              <ArrowRight size={13} />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
              {typing && <TypingDots />}
            </div>

            {messages.length <= 3 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line px-4 py-2.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="h-8 shrink-0 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-ink-2 transition hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t border-line bg-surface p-3"
            >
              <button
                type="button"
                onClick={toggleMic}
                aria-label={speech.listening ? 'Stop listening' : 'Speak your question'}
                className={cn(
                  'relative grid size-10 shrink-0 place-items-center rounded-full transition',
                  speech.listening
                    ? 'bg-rose-500 text-white'
                    : 'bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300',
                )}
              >
                {speech.listening && <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/50" />}
                <Mic size={18} className="relative" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'hi' ? 'अपना सवाल लिखें…' : 'Ask anything…'}
                className="control h-10 flex-1 rounded-full bg-surface-2"
                aria-label="Message Setu AI"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-violet-600 to-fuchsia-500 text-white transition disabled:opacity-40"
                aria-label="Send"
              >
                <SendHorizontal size={18} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  )
}
