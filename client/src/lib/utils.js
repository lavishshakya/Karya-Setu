import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge our custom shadow tokens so `className` overrides resolve cleanly.
const twMerge = extendTailwindMerge({ extend: { theme: { shadow: ['card', 'pop'] } } })

/** Join class names; later Tailwind classes override earlier conflicting ones. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })
const plain = new Intl.NumberFormat('en-IN')

/** ₹12,34,567 — Indian digit grouping. */
export const formatINR = (n) => inr.format(n)
/** 1.2K · 12.3L · 2.5Cr — Indian compact notation (lakh / crore). */
export const formatCompact = (n) => compact.format(n)
export const formatINRCompact = (n) => `₹${compact.format(n)}`
export const formatNumber = (n) => plain.format(n)

export function formatDate(date, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('en-IN', options).format(new Date(date))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(date))
}

const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function timeAgo(date, lang = 'en') {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { numeric: 'auto', style: 'short' })
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return lang === 'hi' ? 'अभी' : 'just now'
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function hashString(str = '') {
  let hash = 0
  for (const ch of str) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(hash)
}

/** Great-circle distance in km between two { lat, lng } points. */
export function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** New Set with `value` added, or removed if it was already there. */
export function toggleInSet(set, value) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

/** i18n key for a time-of-day greeting. */
export function greetingKey() {
  const hour = new Date().getHours()
  return hour < 12 ? 'greet.morning' : hour < 17 ? 'greet.afternoon' : 'greet.evening'
}

/** ISO timestamp relative to now — keeps mock data looking fresh. */
export function ago({ days = 0, hours = 0, minutes = 0 } = {}) {
  return new Date(Date.now() - ((days * 24 + hours) * 60 + minutes) * 60000).toISOString()
}

/** Labels for the last `count` months, oldest first: ['May', 'Jun', …]. */
export function lastMonths(count, options = { month: 'short' }) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
    return new Intl.DateTimeFormat('en-IN', options).format(d)
  })
}

export function downloadUrl(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
