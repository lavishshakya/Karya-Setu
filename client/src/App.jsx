import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Providers from '@/app/Providers'
import RequireRole from '@/app/RequireRole'
import AuthLayout from '@/components/layout/AuthLayout'
import { PageLoader } from '@/components/ui/Misc'
import Landing from '@/features/landing/Landing'
import NotFound from '@/features/NotFound'

// Every portal page is code-split, so the landing page stays light.
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'))
const Login = lazy(() => import('@/features/auth/Login'))
const Register = lazy(() => import('@/features/auth/Register'))
const VerifyWorker = lazy(() => import('@/features/worker/VerifyWorker'))

// Member 1 · Worker portal
const WorkerDashboard = lazy(() => import('@/features/worker/Dashboard'))
const FindJobs = lazy(() => import('@/features/worker/FindJobs'))
const Applications = lazy(() => import('@/features/worker/Applications'))
const Profile = lazy(() => import('@/features/worker/Profile'))
const WorkerId = lazy(() => import('@/features/worker/WorkerId'))
const ResumeBuilder = lazy(() => import('@/features/worker/ResumeBuilder'))
const Training = lazy(() => import('@/features/worker/Training'))

// Member 2 · Employer portal
const EmployerDashboard = lazy(() => import('@/features/employer/Dashboard'))
const PostJob = lazy(() => import('@/features/employer/PostJob'))
const MyJobs = lazy(() => import('@/features/employer/MyJobs'))
const Candidates = lazy(() => import('@/features/employer/Candidates'))
const Nearby = lazy(() => import('@/features/employer/Nearby'))
const Team = lazy(() => import('@/features/employer/Team'))
const Company = lazy(() => import('@/features/employer/Company'))

// Member 3 · Employment lifecycle (shared by workers and employers)
const Attendance = lazy(() => import('@/features/lifecycle/Attendance'))
const Payments = lazy(() => import('@/features/lifecycle/Payments'))
const Messages = lazy(() => import('@/features/lifecycle/Messages'))
const Complaints = lazy(() => import('@/features/lifecycle/Complaints'))

// Member 4 · AI tools
const WagePredictor = lazy(() => import('@/features/ai/WagePredictor'))

// Member 5 · Admin & Panchayat
const AdminDashboard = lazy(() => import('@/features/admin/Dashboard'))
const Users = lazy(() => import('@/features/admin/Users'))
const Fraud = lazy(() => import('@/features/admin/Fraud'))
const Disputes = lazy(() => import('@/features/admin/Disputes'))
const Analytics = lazy(() => import('@/features/admin/Analytics'))
const PanchayatDashboard = lazy(() => import('@/features/panchayat/Dashboard'))
const VillageWorkers = lazy(() => import('@/features/panchayat/Workers'))
const Schemes = lazy(() => import('@/features/panchayat/Schemes'))

/** A portal: role guard + dashboard shell. `key` remounts the shell when the role changes. */
const portal = (role) => (
  <RequireRole role={role}>
    <DashboardLayout key={role} />
  </RequireRole>
)

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/verify/:workerId" element={<VerifyWorker />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route path="/worker" element={portal('worker')}>
              <Route index element={<WorkerDashboard />} />
              <Route path="jobs" element={<FindJobs />} />
              <Route path="applications" element={<Applications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="id" element={<WorkerId />} />
              <Route path="resume" element={<ResumeBuilder />} />
              <Route path="training" element={<Training />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="payments" element={<Payments />} />
              <Route path="messages" element={<Messages />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="wages" element={<WagePredictor />} />
            </Route>

            <Route path="/employer" element={portal('employer')}>
              <Route index element={<EmployerDashboard />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="jobs/:jobId/edit" element={<PostJob />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="nearby" element={<Nearby />} />
              <Route path="team" element={<Team />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="payments" element={<Payments />} />
              <Route path="messages" element={<Messages />} />
              <Route path="company" element={<Company />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="wages" element={<WagePredictor />} />
            </Route>

            <Route path="/admin" element={portal('admin')}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="fraud" element={<Fraud />} />
              <Route path="disputes" element={<Disputes />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="/panchayat" element={portal('panchayat')}>
              <Route index element={<PanchayatDashboard />} />
              <Route path="workers" element={<VillageWorkers />} />
              <Route path="schemes" element={<Schemes />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Providers>
  )
}
