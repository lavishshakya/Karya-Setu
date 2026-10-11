// Job recommendation v1 — weighted rule-based scoring (skill fit, distance, pay, trust).
// Planned upgrade: learn the weights from apply/hire outcomes once there's enough data.
import { haversineKm } from '@/lib/utils'
import { assessJob } from './fraud'

export function scoreJob(worker, job) {
  const skillNames = new Set(worker.skills.map((s) => s.name))
  const matched = job.skills.filter((s) => skillNames.has(s))
  const skillFit = matched.length / job.skills.length
  const primary = job.category === worker.primarySkill || job.skills.includes(worker.primarySkill) ? 1 : 0
  const distance = haversineKm(worker.location, job.location)
  const near = Math.max(0, 1 - distance / 30)
  const pay = Math.min(1, job.wage / worker.expectedWage)
  const trust = job.employer.verified ? 1 : 0.2

  const score = Math.min(
    99,
    Math.round(100 * (0.35 * skillFit + 0.2 * primary + 0.2 * near + 0.15 * pay + 0.1 * trust)),
  )

  const reasons = []
  if (matched.length) reasons.push(`Matches your ${matched.join(' & ')} skill${matched.length > 1 ? 's' : ''}`)
  if (distance < 8) reasons.push(`Only ${distance.toFixed(1)} km away`)
  if (job.wage > worker.expectedWage) reasons.push(`₹${job.wage - worker.expectedWage} above your expected wage`)
  else if (job.wage === worker.expectedWage) reasons.push('Meets your expected wage')
  if (job.employer.verified) reasons.push('Verified employer')

  return { score, distance, reasons }
}

/** Open, non-full jobs ranked for a worker. High-risk (likely fraudulent) jobs are never recommended. */
export function recommendJobs(worker, jobs, limit) {
  const ranked = jobs
    .filter((job) => job.status === 'active' && job.hired < job.workersNeeded)
    .map((job) => ({ job, ...scoreJob(worker, job), fraud: assessJob(job) }))
    .filter((r) => r.fraud.level !== 'high')
    .sort((a, b) => b.score - a.score)
  return limit ? ranked.slice(0, limit) : ranked
}

/** Candidate fit for an employer's job: skill level, distance, rating, affordability, verification. */
export function scoreCandidate(job, worker) {
  const best = Math.max(0, ...worker.skills.filter((s) => job.skills.includes(s.name)).map((s) => s.level))
  const distance = haversineKm(worker.location, job.location)
  const near = Math.max(0, 1 - distance / 30)
  const rating = worker.rating / 5
  const affordable = Math.min(1, job.wage / worker.expectedWage)
  const trust = worker.verified ? 1 : 0.3
  const score = Math.round(100 * (0.4 * (best / 100) + 0.2 * near + 0.2 * rating + 0.1 * affordable + 0.1 * trust))
  return { score: Math.min(99, score), distance }
}
