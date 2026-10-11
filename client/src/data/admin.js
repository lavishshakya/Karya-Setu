// Admin console mock data (Member 5).
import { ago, lastMonths } from '@/lib/utils'
import { workers } from './workers'

export const platformStats = {
  workers: 12480,
  employers: 1864,
  activeJobs: 3216,
  placementsMonth: 2140,
  openDisputes: 47,
  fraudAlerts: 18,
  verificationQueue: 38,
  avgDailyWage: 712,
}

const months12 = lastMonths(12)

export const registrationTrend = months12.map((month, i) => ({
  month,
  workers: [620, 710, 690, 820, 940, 1010, 980, 1120, 1260, 1190, 1340, 1480][i],
  employers: [88, 96, 91, 110, 124, 131, 128, 142, 156, 149, 168, 181][i],
}))

export const hiringTrend = months12.map((month, i) => ({
  month,
  posted: [1420, 1510, 1480, 1690, 1820, 1960, 1890, 2110, 2340, 2280, 2520, 2710][i],
  hired: [980, 1060, 1010, 1190, 1310, 1420, 1380, 1560, 1720, 1690, 1890, 2140][i],
}))

export const wageTrends = months12.map((month, i) => ({
  month,
  Electrician: [780, 784, 790, 795, 801, 808, 812, 820, 826, 834, 841, 850][i],
  Mason: [690, 694, 700, 703, 709, 712, 718, 724, 731, 735, 742, 750][i],
  Plumber: [720, 722, 728, 733, 736, 741, 747, 752, 756, 761, 768, 774][i],
  Helper: [430, 432, 436, 438, 441, 446, 448, 452, 455, 459, 463, 468][i],
}))

export const jobsByCategory = [
  { category: 'Mason', jobs: 812 },
  { category: 'Helper', jobs: 694 },
  { category: 'Electrician', jobs: 402 },
  { category: 'Farm worker', jobs: 377 },
  { category: 'Plumber', jobs: 301 },
  { category: 'Painter', jobs: 268 },
  { category: 'Carpenter', jobs: 241 },
  { category: 'Other', jobs: 321 },
]

export const districts = [
  { district: 'Jaipur', workers: 4820, jobs: 1320, placements: 920, placementRate: 78, share: 0.38 },
  { district: 'Jodhpur', workers: 1980, jobs: 512, placements: 341, placementRate: 71, share: 0.15 },
  { district: 'Udaipur', workers: 1460, jobs: 398, placements: 262, placementRate: 69, share: 0.12 },
  { district: 'Kota', workers: 1210, jobs: 301, placements: 198, placementRate: 66, share: 0.09 },
  { district: 'Ajmer', workers: 1040, jobs: 270, placements: 171, placementRate: 64, share: 0.08 },
  { district: 'Alwar', workers: 890, jobs: 220, placements: 132, placementRate: 61, share: 0.07 },
  { district: 'Sikar', workers: 610, jobs: 118, placements: 71, placementRate: 55, share: 0.06 },
  { district: 'Bikaner', workers: 470, jobs: 77, placements: 45, placementRate: 52, share: 0.05 },
]

export const supplyDemand = [
  { skill: 'Mason', workers: 2140, jobs: 812 },
  { skill: 'Helper', workers: 3920, jobs: 694 },
  { skill: 'Electrician', workers: 610, jobs: 402 },
  { skill: 'Plumber', workers: 540, jobs: 301 },
  { skill: 'Tile fitter', workers: 380, jobs: 412 },
  { skill: 'Welder', workers: 290, jobs: 236 },
]

export const topEmployers = [
  { name: 'Shree Balaji Builders', jobs: 64, hires: 212, rating: 4.4, onTime: 81 },
  { name: 'Sharma Constructions', jobs: 41, hires: 168, rating: 4.6, onTime: 97 },
  { name: 'GreenLeaf Agro Farms', jobs: 22, hires: 154, rating: 4.3, onTime: 92 },
  { name: 'Apex Logistics', jobs: 37, hires: 131, rating: 4.1, onTime: 88 },
  { name: 'Pink City Interiors', jobs: 29, hires: 77, rating: 4.7, onTime: 95 },
]

/** Dispute pipeline — status meanings map to the reserved status palette. */
export const disputeSummary = [
  { status: 'Resolved', count: 312, tone: 'good' },
  { status: 'In review', count: 29, tone: 'warning' },
  { status: 'Open', count: 12, tone: 'serious' },
  { status: 'Escalated', count: 6, tone: 'critical' },
]

const extraUsers = [
  {
    id: 'e-2001',
    name: 'Sharma Constructions',
    role: 'employer',
    district: 'Jaipur',
    joined: '2025-06-02',
    status: 'verified',
    risk: 6,
    detail: 'GSTIN 08ABCDE1234F1Z5',
  },
  {
    id: 'e-2002',
    name: 'Shree Balaji Builders',
    role: 'employer',
    district: 'Jaipur',
    joined: '2025-05-19',
    status: 'verified',
    risk: 22,
    detail: '3 payment complaints',
  },
  {
    id: 'e-2009',
    name: 'Global Manpower Solutions',
    role: 'employer',
    district: 'Jaipur',
    joined: ago({ days: 2 }),
    status: 'flagged',
    risk: 94,
    detail: 'Fee-for-job reports',
  },
  {
    id: 'e-2010',
    name: 'SafeHands Security',
    role: 'employer',
    district: 'Jaipur',
    joined: ago({ days: 9 }),
    status: 'pending',
    risk: 31,
    detail: 'Udyam certificate uploaded',
  },
  {
    id: 'e-2011',
    name: 'Marwar Textiles',
    role: 'employer',
    district: 'Jodhpur',
    joined: ago({ days: 1 }),
    status: 'pending',
    risk: 12,
    detail: 'GST verification queued',
  },
  {
    id: 'e-2012',
    name: 'Quick Jobs Placement',
    role: 'employer',
    district: 'Ajmer',
    joined: '2026-07-30',
    status: 'suspended',
    risk: 88,
    detail: 'Collected fees from applicants',
  },
  {
    id: 'w-1101',
    name: 'Suresh Kumar Bairwa',
    role: 'worker',
    district: 'Jaipur',
    joined: ago({ days: 3 }),
    status: 'flagged',
    risk: 81,
    detail: 'Possible duplicate of KS-RJ-2026-007731',
  },
  {
    id: 'w-1102',
    name: 'Mukesh Saini',
    role: 'worker',
    district: 'Sikar',
    joined: '2026-09-02',
    status: 'flagged',
    risk: 73,
    detail: 'Certificate failed registry check',
  },
]

export const adminUsers = [
  ...workers.map((w) => ({
    id: w.id,
    name: w.name,
    role: 'worker',
    district: w.district,
    joined: w.joined,
    status: w.verified ? 'verified' : 'pending',
    risk: w.verified ? 4 + (w.reviews % 9) : 18,
    detail: `${w.primarySkill} · ${w.experience} yrs`,
  })),
  ...extraUsers,
]

/** AI fraud-detection queue (Member 4 model output, reviewed here by Member 5). */
export const fraudAlerts = [
  {
    id: 'FA-301',
    type: 'job',
    title: 'Masons needed for Dubai project, ₹2,200/day',
    entity: 'Global Manpower Solutions',
    risk: 94,
    status: 'open',
    detectedAt: ago({ minutes: 12 }),
    reasons: [
      'Asks for ₹5,000 registration fee',
      'Wage 3× district average',
      'Employer not verified',
      'WhatsApp-only contact',
    ],
  },
  {
    id: 'FA-298',
    type: 'duplicate',
    title: 'Duplicate worker profile',
    entity: 'Suresh Kumar Bairwa ↔ Suresh Bairwa',
    risk: 81,
    status: 'open',
    detectedAt: ago({ hours: 3 }),
    reasons: ['Same phone number', 'Face match 92%', 'Same bank account'],
    compare: {
      left: {
        name: 'Suresh Bairwa',
        id: 'KS-RJ-2026-007731',
        phone: '+91 97845 •••20',
        bank: 'SBI ••4471',
        dob: '14 Feb 2003',
        village: 'Sanganer',
        joined: '19 Jun 2026',
      },
      right: {
        name: 'Suresh Kumar Bairwa',
        id: 'KS-RJ-2026-011902',
        phone: '+91 97845 •••20',
        bank: 'SBI ••4471',
        dob: '14 Feb 2003',
        village: 'Sanganer',
        joined: '3 days ago',
      },
    },
  },
  {
    id: 'FA-295',
    type: 'certificate',
    title: 'Electrician certificate looks altered',
    entity: 'Mukesh Saini',
    risk: 73,
    status: 'investigating',
    detectedAt: ago({ hours: 9 }),
    reasons: ['Number not found in Skill India registry', 'OCR found mixed fonts', 'Issue date before batch start'],
  },
  {
    id: 'FA-290',
    type: 'payment',
    title: 'Advance-for-job complaints',
    entity: 'Quick Jobs Placement',
    risk: 88,
    status: 'actioned',
    detectedAt: ago({ days: 1 }),
    reasons: ['3 complaints in 7 days', 'UPI collections from applicants', 'Jobs deleted after payment'],
  },
  {
    id: 'FA-284',
    type: 'job',
    title: 'Data entry from home, earn ₹40,000/month',
    entity: 'StarLink Services',
    risk: 67,
    status: 'open',
    detectedAt: ago({ days: 1, hours: 6 }),
    reasons: ['Pay unrealistic for skill level', 'No physical address', 'Copy-pasted description'],
  },
  {
    id: 'FA-279',
    type: 'duplicate',
    title: 'Similar employer names',
    entity: 'Sri Balaji Builder & Co. ↔ Shree Balaji Builders',
    risk: 34,
    status: 'dismissed',
    detectedAt: ago({ days: 2 }),
    reasons: ['Similar name', 'Different GSTIN', 'Different address'],
  },
]

/** Complaints escalated to the admin desk. */
export const disputes = [
  {
    id: 'KS-C-1042',
    title: 'Payment pending for 6 days of work',
    category: 'Payment not received',
    complainant: 'Ramesh Kumar',
    complainantRole: 'worker',
    against: 'Shree Balaji Builders',
    amount: 4920,
    priority: 'high',
    status: 'in-review',
    openedAt: ago({ days: 4 }),
    sla: 'SLA breached',
    notes: 'Employer claims payment was made in cash. Worker disputes; asks for bank proof.',
  },
  {
    id: 'KS-C-1051',
    title: 'Worker absent after taking advance',
    category: 'Worker no-show',
    complainant: 'Sharma Constructions',
    complainantRole: 'employer',
    against: 'Suresh Bairwa',
    amount: 1000,
    priority: 'medium',
    status: 'open',
    openedAt: ago({ days: 1 }),
    sla: '47h left',
    notes: 'Linked to duplicate-profile alert FA-298.',
  },
  {
    id: 'KS-C-1048',
    title: 'Paid ₹600/day instead of agreed ₹700',
    category: 'Wage lower than agreed',
    complainant: 'Sunita Devi',
    complainantRole: 'worker',
    against: 'Pink City Interiors',
    amount: 1400,
    priority: 'medium',
    status: 'in-review',
    openedAt: ago({ days: 2 }),
    sla: '22h left',
    notes: 'Job post shows ₹700/day. Employer asked for 24h to respond.',
  },
  {
    id: 'KS-C-1039',
    title: 'No drinking water or shade at warehouse',
    category: 'Unsafe working conditions',
    complainant: '14 workers (group)',
    complainantRole: 'worker',
    against: 'Apex Logistics',
    amount: null,
    priority: 'high',
    status: 'escalated',
    openedAt: ago({ days: 6 }),
    sla: 'With labour dept.',
    notes: 'Escalated to the district labour office for inspection.',
  },
  {
    id: 'KS-C-1036',
    title: 'Verbal abuse by site supervisor',
    category: 'Harassment or abuse',
    complainant: 'Kavita Sharma',
    complainantRole: 'worker',
    against: 'Royal Caterers',
    amount: null,
    priority: 'critical',
    status: 'escalated',
    openedAt: ago({ days: 7 }),
    sla: 'With ICC',
    notes: 'Referred to the employer’s internal committee; follow-up in 3 days.',
  },
  {
    id: 'KS-C-1029',
    title: 'Overtime not paid for 2 weeks',
    category: 'Payment not received',
    complainant: 'Arjun Meena',
    complainantRole: 'worker',
    against: 'Shree Balaji Builders',
    amount: 2600,
    priority: 'medium',
    status: 'resolved',
    openedAt: ago({ days: 12 }),
    sla: 'Closed',
    notes: 'Employer paid ₹2,600 via UPI on day 3.',
  },
]

export const activityFeed = [
  {
    id: 1,
    type: 'fraud',
    text: 'AI flagged a fee-for-job posting by Global Manpower Solutions',
    at: ago({ minutes: 12 }),
  },
  { id: 2, type: 'verify', text: 'Pink City Interiors completed GST verification', at: ago({ minutes: 48 }) },
  { id: 3, type: 'hire', text: '126 workers hired across Jaipur today', at: ago({ hours: 2 }) },
  { id: 4, type: 'dispute', text: 'KS-C-1029 resolved: ₹2,600 overtime paid', at: ago({ hours: 5 }) },
  { id: 5, type: 'user', text: '412 new worker registrations this week', at: ago({ hours: 8 }) },
]
