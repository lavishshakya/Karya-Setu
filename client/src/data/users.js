// Demo accounts used by mock-mode login (any credentials work).
export const demoUsers = {
  worker: {
    id: 'w-1001',
    role: 'worker',
    name: 'Ramesh Kumar',
    phone: '+91 98290 41212',
    email: 'ramesh.kumar@example.in',
    district: 'Jaipur',
    skill: 'Mason',
    workerId: 'KS-RJ-2026-004512',
    verified: true,
  },
  employer: {
    id: 'e-2001',
    role: 'employer',
    name: 'Anil Sharma',
    company: 'Sharma Constructions',
    phone: '+91 94140 22871',
    email: 'anil@sharmaconstructions.example.in',
    district: 'Jaipur',
    verified: true,
  },
  admin: {
    id: 'a-1',
    role: 'admin',
    name: 'Priya Nair',
    title: 'Platform administrator',
    email: 'priya.nair@karyasetu.example.in',
  },
  panchayat: {
    id: 'p-1',
    role: 'panchayat',
    name: 'Mohan Lal Meena',
    title: 'Sarpanch',
    panchayat: 'Rampura Gram Panchayat',
    district: 'Jaipur',
  },
}
