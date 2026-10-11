import {
  Building2,
  CalendarCheck,
  ChartColumn,
  CirclePlus,
  ClipboardList,
  FileText,
  Gavel,
  GraduationCap,
  HardHat,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  QrCode,
  Search,
  ShieldAlert,
  TriangleAlert,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  Briefcase,
} from 'lucide-react'

// Sidebar groups per role. `label` values are i18n keys; `mobile` lists the four
// destinations pinned to the phone bottom bar (the fifth slot opens the full menu).
const item = (to, label, icon, extra = {}) => ({ to, label, icon, ...extra })

export const navigation = {
  worker: {
    groups: [
      { label: 'nav.overview', items: [item('/worker', 'nav.dashboard', LayoutDashboard, { end: true })] },
      {
        label: 'nav.jobs',
        items: [
          item('/worker/jobs', 'nav.findJobs', Search),
          item('/worker/applications', 'nav.applications', ClipboardList),
        ],
      },
      {
        label: 'nav.profile',
        items: [
          item('/worker/profile', 'nav.myProfile', UserRound),
          item('/worker/id', 'nav.workerId', QrCode),
          item('/worker/resume', 'nav.resume', FileText, { ai: true }),
          item('/worker/training', 'nav.training', GraduationCap),
        ],
      },
      {
        label: 'nav.workPay',
        items: [
          item('/worker/attendance', 'nav.attendance', CalendarCheck),
          item('/worker/payments', 'nav.payments', Wallet),
          item('/worker/messages', 'nav.messages', MessageSquare, { badge: 3 }),
          item('/worker/complaints', 'nav.complaints', TriangleAlert),
        ],
      },
      { label: 'nav.aiTools', items: [item('/worker/wages', 'nav.wages', IndianRupee, { ai: true })] },
    ],
    mobile: ['/worker', '/worker/jobs', '/worker/attendance', '/worker/payments'],
  },
  employer: {
    groups: [
      { label: 'nav.overview', items: [item('/employer', 'nav.dashboard', LayoutDashboard, { end: true })] },
      {
        label: 'nav.hiring',
        items: [
          item('/employer/post-job', 'nav.postJob', CirclePlus),
          item('/employer/jobs', 'nav.myJobs', Briefcase),
          item('/employer/candidates', 'nav.candidates', Users, { badge: 4 }),
          item('/employer/nearby', 'nav.nearby', MapPin),
        ],
      },
      {
        label: 'nav.workforce',
        items: [
          item('/employer/team', 'nav.team', HardHat),
          item('/employer/attendance', 'nav.attendance', CalendarCheck),
          item('/employer/payments', 'nav.payments', Wallet),
          item('/employer/messages', 'nav.messages', MessageSquare, { badge: 3 }),
        ],
      },
      {
        label: 'nav.account',
        items: [
          item('/employer/company', 'nav.company', Building2),
          item('/employer/complaints', 'nav.complaints', TriangleAlert),
        ],
      },
      { label: 'nav.aiTools', items: [item('/employer/wages', 'nav.wages', IndianRupee, { ai: true })] },
    ],
    mobile: ['/employer', '/employer/post-job', '/employer/candidates', '/employer/team'],
  },
  admin: {
    groups: [
      { label: 'nav.overview', items: [item('/admin', 'nav.dashboard', LayoutDashboard, { end: true })] },
      {
        label: 'nav.platform',
        items: [
          item('/admin/users', 'nav.users', UsersRound),
          item('/admin/fraud', 'nav.fraud', ShieldAlert, { badge: 3, ai: true }),
          item('/admin/disputes', 'nav.disputes', Gavel),
        ],
      },
      { label: 'nav.insights', items: [item('/admin/analytics', 'nav.analytics', ChartColumn)] },
    ],
    mobile: ['/admin', '/admin/users', '/admin/fraud', '/admin/disputes'],
  },
  panchayat: {
    groups: [
      { label: 'nav.overview', items: [item('/panchayat', 'nav.dashboard', LayoutDashboard, { end: true })] },
      {
        label: 'nav.community',
        items: [
          item('/panchayat/workers', 'nav.villageWorkers', Users),
          item('/panchayat/schemes', 'nav.schemes', Landmark),
        ],
      },
    ],
    mobile: ['/panchayat', '/panchayat/workers', '/panchayat/schemes'],
  },
}

/** Where the top-bar search sends each role. */
export const searchTargets = {
  worker: '/worker/jobs',
  employer: '/employer/candidates',
  admin: '/admin/users',
  panchayat: '/panchayat/workers',
}

/** Profile link in the user menu. */
export const profileTargets = {
  worker: '/worker/profile',
  employer: '/employer/company',
}

export const allItems = (role) => navigation[role].groups.flatMap((g) => g.items)
