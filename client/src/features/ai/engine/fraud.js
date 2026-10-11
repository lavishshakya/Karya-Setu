// Fraudulent-job detection v1 — explainable red-flag rules. Each hit adds risk and a
// human-readable reason; replace with a trained classifier later (same return shape).
import { SKILL_BASE_WAGE } from './wage'

const RED_FLAGS = [
  ['registration fee', 30, 'Asks workers to pay a registration fee'],
  ['security deposit', 30, 'Asks for a security deposit'],
  ['processing fee', 30, 'Asks for a processing fee'],
  ['pay to apply', 30, 'Asks workers to pay to apply'],
  ['whatsapp only', 12, 'Contact only over WhatsApp'],
  ['dubai', 10, 'Overseas job promise'],
  ['abroad', 10, 'Overseas job promise'],
]

export function assessJob(job) {
  const text = `${job.title} ${job.description ?? ''}`.toLowerCase()
  const reasons = []
  let risk = 4

  for (const [term, weight, reason] of RED_FLAGS) {
    if (text.includes(term) && !reasons.includes(reason)) {
      risk += weight
      reasons.push(reason)
    }
  }
  const base = SKILL_BASE_WAGE[job.category]
  if (base && job.wage > base * 1.8) {
    risk += 25
    reasons.push(`Wage is ${(job.wage / base).toFixed(1)}× the regional average`)
  }
  if (job.employer && !job.employer.verified) {
    risk += 14
    reasons.push('Employer not verified yet')
  }
  if ((job.description ?? '').trim().length < 50) {
    risk += 8
    reasons.push('Very short job description')
  }

  risk = Math.min(98, risk)
  return { risk, level: risk >= 60 ? 'high' : risk >= 25 ? 'medium' : 'low', reasons }
}
