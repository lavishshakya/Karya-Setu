import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  BadgeCheck,
  CheckCheck,
  Mic,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  SendHorizontal,
  ShieldCheck,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/Misc'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useToast } from '@/context/ToastContext'
import { conversationsFor } from '@/data/lifecycle'
import { useSpeechRecognition } from '@/features/ai/useSpeechRecognition'
import { cn, formatDate, formatTime, timeAgo } from '@/lib/utils'

// Simulated replies until the Socket.io channel (Member 3) is wired in.
const AUTO_REPLIES = {
  worker: [
    'Theek hai 👍',
    'Noted. I will check and get back to you.',
    'Please come to the site office at 9 AM tomorrow.',
  ],
  employer: ['Ji sir 🙏', 'OK sir, I will be there on time.', 'Thank you! Kal milte hain.'],
}

function dayLabel(date) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return formatDate(d, { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function Messages() {
  const { user } = useAuth()
  const { lang } = useLang()
  const toast = useToast()
  const [conversations, setConversations] = useState(() => conversationsFor(user.role))
  const [activeId, setActiveId] = useState(conversations[0]?.id)
  const [mobileView, setMobileView] = useState('list')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [typingId, setTypingId] = useState(null)
  const scrollRef = useRef(null)
  const fileRef = useRef(null)
  const timers = useRef([])
  const speech = useSpeechRecognition({ lang: lang === 'hi' ? 'hi-IN' : 'en-IN', onResult: (text) => setDraft(text) })

  const active = conversations.find((c) => c.id === activeId)
  const visible = conversations.filter((c) => `${c.name} ${c.subtitle}`.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages.length, typingId, activeId])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const open = (id) => {
    setActiveId(id)
    setMobileView('chat')
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  const append = (id, message) =>
    setConversations((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [...c.messages, { id: Date.now() + Math.random(), at: new Date().toISOString(), ...message }],
            }
          : c,
      ),
    )

  const send = (text) => {
    const clean = text.trim()
    if (!clean || !active) return
    const convoId = active.id
    append(convoId, { from: 'me', text: clean })
    setDraft('')
    if (active.subtitle === 'Official') return
    const replies = AUTO_REPLIES[user.role] ?? AUTO_REPLIES.worker
    timers.current.push(setTimeout(() => setTypingId(convoId), 700))
    timers.current.push(
      setTimeout(() => {
        setTypingId(null)
        append(convoId, { from: 'them', text: replies[Math.floor(Math.random() * replies.length)] })
      }, 2200),
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">Messages</h1>
          <p className="text-sm text-ink-2">
            Chat directly. Phone numbers stay private until you choose to share them.
          </p>
        </div>
      </div>

      <Card className="flex h-[calc(100dvh-15rem)] min-h-[480px] overflow-hidden lg:h-[calc(100dvh-13rem)]">
        <aside
          className={cn(
            'w-full flex-col border-r border-line lg:flex lg:w-[340px]',
            mobileView === 'list' ? 'flex' : 'hidden',
          )}
        >
          <div className="border-b border-line p-3">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="control h-10 rounded-full bg-surface-2 pl-9"
                aria-label="Search conversations"
              />
            </div>
          </div>
          <ul className="flex-1 scrollbar-thin overflow-y-auto p-2">
            {visible.map((c) => {
              const last = c.messages[c.messages.length - 1]
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => open(c.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition',
                      c.id === activeId ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-surface-2',
                    )}
                  >
                    <Avatar name={c.name} size={46} online={c.online} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="flex min-w-0 items-center gap-1 font-bold text-ink">
                          <span className="truncate">{c.name}</span>
                          {c.verified && <BadgeCheck size={14} className="shrink-0 text-brand-500" />}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted">{timeAgo(last.at, lang)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('truncate text-sm', c.unread ? 'font-semibold text-ink' : 'text-muted')}>
                          {typingId === c.id ? (
                            <span className="text-brand-600">typing…</span>
                          ) : (
                            `${last.from === 'me' ? 'You: ' : ''}${last.text}`
                          )}
                        </p>
                        {c.unread > 0 && (
                          <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-saffron-500 px-1.5 text-[11px] font-bold text-white">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <section className={cn('min-w-0 flex-1 flex-col lg:flex', mobileView === 'chat' ? 'flex' : 'hidden')}>
          {!active ? (
            <EmptyState icon={MessageSquare} title="No conversation selected" className="m-auto" />
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-line px-3 py-3 sm:px-4">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="rounded-lg p-1.5 text-ink-2 hover:bg-surface-2 lg:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={20} />
                </button>
                <Avatar name={active.name} size={40} online={active.online} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 font-bold text-ink">
                    <span className="truncate">{active.name}</span>
                    {active.verified && <BadgeCheck size={15} className="shrink-0 text-brand-500" />}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {typingId === active.id ? (
                      <span className="font-semibold text-brand-600">typing…</span>
                    ) : (
                      `${active.subtitle} · ${active.online ? 'online' : 'last seen recently'}`
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      tone: 'info',
                      title: `Calling ${active.name}…`,
                      description: 'Connected through a masked number to protect both of you.',
                    })
                  }
                  className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200"
                  aria-label={`Call ${active.name}`}
                >
                  <Phone size={18} />
                </button>
              </header>

              <div
                ref={scrollRef}
                className="flex-1 scrollbar-thin space-y-2 overflow-y-auto bg-bg/50 bg-dots px-3 py-4 sm:px-5"
              >
                <p className="mx-auto mb-3 flex w-fit items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[11px] text-muted ring-1 ring-line">
                  <ShieldCheck size={12} /> Messages are private between you and {active.name.split(' ')[0]}
                </p>
                {active.messages.map((m, i) => {
                  const label = dayLabel(m.at)
                  const showDay = i === 0 || label !== dayLabel(active.messages[i - 1].at)
                  const mine = m.from === 'me'
                  return (
                    <Fragment key={m.id}>
                      {showDay && <p className="py-2 text-center text-[11px] font-semibold text-muted">{label}</p>}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm',
                            mine
                              ? 'rounded-br-md bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950'
                              : 'rounded-bl-md border border-line bg-surface text-ink',
                          )}
                        >
                          {m.text}
                          <span
                            className={cn(
                              'mt-0.5 flex items-center justify-end gap-1 text-[10px]',
                              mine ? 'text-white/75 dark:text-brand-950/70' : 'text-muted',
                            )}
                          >
                            {formatTime(m.at)}
                            {mine && <CheckCheck size={13} aria-label="Read" />}
                          </span>
                        </div>
                      </motion.div>
                    </Fragment>
                  )
                })}
                <AnimatePresence>
                  {typingId === active.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex w-fit gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="size-1.5 rounded-full bg-muted"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send(draft)
                }}
                className="flex items-center gap-2 border-t border-line p-3"
              >
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
                  aria-label="Attach a file"
                >
                  <Paperclip size={19} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) send(`📎 ${file.name}`)
                    e.target.value = ''
                  }}
                />
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={lang === 'hi' ? 'संदेश लिखें…' : 'Type a message…'}
                  className="control h-11 flex-1 rounded-full bg-surface-2"
                  aria-label="Message"
                />
                <button
                  type="button"
                  onClick={() =>
                    speech.listening
                      ? speech.stop()
                      : speech.start() || toast({ tone: 'info', title: 'Voice typing needs Chrome or Edge' })
                  }
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full transition',
                    speech.listening ? 'bg-rose-500 text-white' : 'text-muted hover:bg-surface-2 hover:text-ink',
                  )}
                  aria-label={speech.listening ? 'Stop voice typing' : 'Voice typing'}
                >
                  <Mic size={19} />
                </button>
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40 dark:bg-brand-500 dark:text-brand-950"
                  aria-label="Send"
                >
                  <SendHorizontal size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      </Card>
    </div>
  )
}
