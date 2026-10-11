// Wage prediction v1 — transparent rule-based model (skill × region × experience).
// Swap `predictWage` for an ML endpoint (e.g. POST /ai/wage) once enough wage data exists;
// keep the same return shape so the UI doesn't change.

/** Illustrative median daily wage (₹) per skill in Rajasthan. */
export const SKILL_BASE_WAGE = {
  Mason: 700,
  Carpenter: 760,
  Electrician: 820,
  Plumber: 780,
  Painter: 650,
  Welder: 800,
  'Tile fitter': 740,
  Helper: 460,
  'Farm worker': 420,
  Driver: 700,
  Cook: 600,
  Housekeeping: 480,
  'Security guard': 520,
  Tailor: 560,
  Loader: 500,
}

/** Demand / cost-of-living multiplier per district. */
export const DISTRICT_FACTOR = {
  Jaipur: 1.05,
  Jodhpur: 1.0,
  Udaipur: 1.03,
  Kota: 0.98,
  Ajmer: 0.96,
  Alwar: 1.04,
  Sikar: 0.92,
  Bikaner: 0.94,
  Tonk: 0.88,
  Dausa: 0.9,
}

const WORK_TYPE_FACTOR = { daily: 1, monthly: 0.93, contract: 1.07 }
const round10 = (n) => Math.round(n / 10) * 10

export function predictWage({ skill, district, experience = 0, certified = false, workType = 'daily' }) {
  const base = SKILL_BASE_WAGE[skill] ?? 550
  const region = DISTRICT_FACTOR[district] ?? 1
  const exp = 1 + Math.min(experience, 15) * 0.012
  const cert = certified ? 1.06 : 1
  const type = WORK_TYPE_FACTOR[workType] ?? 1

  const daily = round10(base * region * exp * cert * type)
  const spread = 0.13 - Math.min(experience, 10) * 0.005
  const pct = (f) => Math.round((f - 1) * 100)

  return {
    daily,
    min: round10(daily * (1 - spread)),
    max: round10(daily * (1 + spread)),
    monthly: daily * 26,
    confidence: Math.min(
      94,
      70 + Math.min(experience, 10) * 1.5 + (certified ? 6 : 0) + (DISTRICT_FACTOR[district] ? 6 : 0),
    ),
    factors: [
      { label: `${district} demand`, pct: pct(region) },
      { label: `${experience} yrs experience`, pct: pct(exp) },
      { label: 'Skill certificate', pct: pct(cert) },
      { label: `${workType[0].toUpperCase()}${workType.slice(1)} engagement`, pct: pct(type) },
    ],
    base,
  }
}

/** Predicted daily wage for 0…maxYears of experience (for the experience curve). */
export function wageCurve(input, maxYears = 20) {
  return Array.from({ length: maxYears + 1 }, (_, years) => ({
    years,
    wage: predictWage({ ...input, experience: years }).daily,
  }))
}

/** Same profile priced in every district (for the regional comparison). */
export function wageByDistrict(input) {
  return Object.keys(DISTRICT_FACTOR)
    .map((district) => ({ district, wage: predictWage({ ...input, district }).daily }))
    .sort((a, b) => b.wage - a.wage)
}
