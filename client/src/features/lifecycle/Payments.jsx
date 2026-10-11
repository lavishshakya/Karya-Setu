import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  Banknote,
  CircleCheck,
  Clock,
  Download,
  FileText,
  IndianRupee,
  Smartphone,
  TriangleAlert,
  Users,
  Wallet,
} from 'lucide-react'
import ChartCard, { ChartTooltip } from '@/components/charts/ChartCard'
import { SERIES, barCursor, barProps, gridProps, xAxisProps, yAxisProps } from '@/components/charts/chartTheme'
import Avatar from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import StatTile from '@/components/ui/StatTile'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import {
  employerMonthlySpend,
  employerPayroll,
  payrollCycle,
  workerMonthlyEarnings,
  workerPayments,
} from '@/data/lifecycle'
import { workerById } from '@/data/workers'
import { cn, formatDate, formatINR, formatINRCompact, toggleInSet } from '@/lib/utils'
import { downloadPayslip } from './payslipPdf'

function WorkerPayments() {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [slip, setSlip] = useState(null)

  const total = workerMonthlyEarnings.reduce((s, m) => s + m.earned, 0)
  const sumBy = (status) => workerPayments.filter((p) => p.status === status).reduce((s, p) => s + p.net, 0)
  const avgRate = Math.round(workerPayments.reduce((s, p) => s + p.rate, 0) / workerPayments.length)
  const disputed = workerPayments.find((p) => p.status === 'disputed')

  const download = async (p) => {
    await downloadPayslip(p, user.name)
    toast({ title: 'Payslip downloaded', description: p.id })
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Every wage you've earned, when it was paid and how. Download payslips for loans or scheme applications."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Earned · last 6 months"
          value={formatINR(total)}
          icon={IndianRupee}
          tone="success"
          trend={workerMonthlyEarnings.map((m) => m.earned)}
          footer="across 3 employers"
        />
        <StatTile
          label="Pending"
          value={formatINR(sumBy('pending'))}
          footer="due this week"
          icon={Clock}
          tone="saffron"
        />
        <StatTile
          label="Under dispute"
          value={formatINR(sumBy('disputed'))}
          footer="facilitator following up"
          icon={TriangleAlert}
          tone="rose"
        />
        <StatTile
          label="Average daily wage"
          value={formatINR(avgRate)}
          footer="last 7 payments"
          icon={Wallet}
          tone="brand"
        />
      </div>

      {disputed && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center dark:border-rose-500/25 dark:bg-rose-500/10">
          <TriangleAlert className="shrink-0 text-rose-600" />
          <p className="flex-1 text-sm text-rose-900 dark:text-rose-100">
            <b>
              {formatINR(disputed.net)} from {disputed.employer}
            </b>{' '}
            for {disputed.period} is unpaid. Complaint KS-C-1042 is being reviewed.
          </p>
          <Button size="sm" variant="danger-soft" onClick={() => navigate('/worker/complaints')}>
            Track complaint
          </Button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <ChartCard
          title="Monthly earnings"
          subtitle="₹ received per month"
          height={280}
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'days', label: 'Days', align: 'right' },
              { key: 'earned', label: 'Earned', align: 'right', format: formatINR },
            ],
            rows: workerMonthlyEarnings,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={workerMonthlyEarnings} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} tickFormatter={formatINRCompact} />
              <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} cursor={barCursor} />
              <Bar dataKey="earned" name="Earned" fill={SERIES[0]} {...barProps} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="overflow-hidden">
          <div className="p-5 pb-3">
            <CardHeader title="Salary records" subtitle="Tap a row for the payslip" />
          </div>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[640px]">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Employer</th>
                  <th className="text-right">Days × rate</th>
                  <th className="text-right">Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workerPayments.map((p) => (
                  <tr key={p.id} className="cursor-pointer" onClick={() => setSlip(p)}>
                    <td>
                      <p className="font-semibold text-ink">{p.period}</p>
                      <p className="text-xs text-muted">{p.id}</p>
                    </td>
                    <td className="text-ink-2">{p.employer}</td>
                    <td className="text-right text-ink-2 tabular">
                      {p.days} × {formatINR(p.rate)}
                    </td>
                    <td className="text-right font-bold text-ink tabular">{formatINR(p.net)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        open={Boolean(slip)}
        onClose={() => setSlip(null)}
        title="Payslip"
        description={slip && `${slip.id} · ${slip.period}`}
        icon={FileText}
        footer={
          slip && (
            <>
              {slip.status !== 'paid' && (
                <Button variant="outline" onClick={() => navigate('/worker/complaints')}>
                  Report a problem
                </Button>
              )}
              <Button icon={Download} onClick={() => download(slip)}>
                Download PDF
              </Button>
            </>
          )
        }
      >
        {slip && (
          <dl className="divide-y divide-line">
            {[
              ['Employer', slip.employer],
              ['Days worked', slip.days],
              ['Daily rate', formatINR(slip.rate)],
              ['Gross wages', formatINR(slip.gross)],
              ['Deductions / advance', formatINR(slip.deductions)],
              ['Payment method', slip.method],
              ['Paid on', slip.paidOn ? formatDate(slip.paidOn) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="font-semibold text-ink">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between py-3">
              <dt className="font-bold text-ink">Net amount</dt>
              <dd className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-ink">{formatINR(slip.net)}</span>
                <StatusBadge status={slip.status} />
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </>
  )
}

function EmployerPayments() {
  const toast = useToast()
  const [payroll, setPayroll] = useState(() =>
    employerPayroll.map((p) => ({
      ...p,
      gross: Math.round(p.days * p.rate),
      net: Math.round(p.days * p.rate) - p.advance,
    })),
  )
  const [selected, setSelected] = useState(
    () => new Set(employerPayroll.filter((p) => p.status === 'pending').map((p) => p.workerId)),
  )
  const [confirming, setConfirming] = useState(false)

  const total = payroll.reduce((s, p) => s + p.net, 0)
  const paid = payroll.filter((p) => p.status === 'paid').reduce((s, p) => s + p.net, 0)
  const pendingRows = payroll.filter((p) => p.status === 'pending')
  const selectedRows = payroll.filter((p) => selected.has(p.workerId) && p.status === 'pending')
  const selectedTotal = selectedRows.reduce((s, p) => s + p.net, 0)

  const toggle = (id) => setSelected((s) => toggleInSet(s, id))

  const pay = () => {
    const ids = new Set(selectedRows.map((p) => p.workerId))
    setPayroll((list) => list.map((p) => (ids.has(p.workerId) ? { ...p, status: 'paid' } : p)))
    setSelected(new Set())
    setConfirming(false)
    toast({
      title: `${formatINR(selectedTotal)} paid via UPI`,
      description: `${ids.size} workers notified by SMS with their payslip.`,
    })
  }

  return (
    <>
      <PageHeader
        title="Payroll"
        description={`Weekly cycle ${payrollCycle.label} · ${payrollCycle.due.toLowerCase()}. Wages are calculated from verified attendance.`}
        actions={
          <Button icon={Smartphone} disabled={!selectedRows.length} onClick={() => setConfirming(true)}>
            Pay {selectedRows.length ? formatINR(selectedTotal) : 'selected'}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="This cycle"
          value={formatINR(total)}
          footer={`${payroll.length} workers`}
          icon={Wallet}
          tone="brand"
        />
        <StatTile
          label="Paid"
          value={formatINR(paid)}
          footer={`${payroll.filter((p) => p.status === 'paid').length} workers`}
          icon={CircleCheck}
          tone="success"
        />
        <StatTile
          label="Pending"
          value={formatINR(pendingRows.reduce((s, p) => s + p.net, 0))}
          footer={`${pendingRows.length} workers`}
          icon={Clock}
          tone="saffron"
        />
        <StatTile label="On-time payment rate" value="97%" footer="last 12 weeks" icon={Banknote} tone="violet" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="p-5 pb-3">
            <CardHeader title="Workers this cycle" subtitle="Select pending rows and pay in one go" icon={Users} />
          </div>
          <div className="overflow-x-auto">
            <table className="table-base min-w-[700px]">
              <thead>
                <tr>
                  <th className="w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  <th>Worker</th>
                  <th className="text-right">Days</th>
                  <th className="text-right">Gross</th>
                  <th className="text-right">Advance</th>
                  <th className="text-right">Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p) => {
                  const w = workerById[p.workerId]
                  const payable = p.status === 'pending'
                  return (
                    <tr
                      key={p.workerId}
                      className={cn(selected.has(p.workerId) && payable && 'bg-brand-50/50 dark:bg-brand-500/5')}
                    >
                      <td>
                        <input
                          type="checkbox"
                          disabled={!payable}
                          checked={payable && selected.has(p.workerId)}
                          onChange={() => toggle(p.workerId)}
                          className="size-4 accent-brand-600 disabled:opacity-30"
                          aria-label={`Select ${w.name}`}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={w.name} size={32} />
                          <div>
                            <p className="font-semibold text-ink">{w.name}</p>
                            <p className="text-xs text-muted">{formatINR(p.rate)}/day</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-ink-2 tabular">{p.days}</td>
                      <td className="text-right text-ink-2 tabular">{formatINR(p.gross)}</td>
                      <td className="text-right text-ink-2 tabular">{p.advance ? `− ${formatINR(p.advance)}` : '—'}</td>
                      <td className="text-right font-bold text-ink tabular">{formatINR(p.net)}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <ChartCard
          title="Monthly wage spend"
          subtitle="Total wages paid"
          height={280}
          table={{
            columns: [
              { key: 'month', label: 'Month' },
              { key: 'workers', label: 'Workers', align: 'right' },
              { key: 'spend', label: 'Spend', align: 'right', format: formatINR },
            ],
            rows: employerMonthlySpend,
          }}
        >
          <ResponsiveContainer>
            <BarChart data={employerMonthlySpend} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis {...yAxisProps} tickFormatter={formatINRCompact} />
              <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} cursor={barCursor} />
              <Bar dataKey="spend" name="Wages paid" fill={SERIES[0]} {...barProps} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm UPI payout"
        description="Money goes straight to each worker's verified bank account."
        icon={Smartphone}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button icon={CircleCheck} onClick={pay}>
              Pay {formatINR(selectedTotal)}
            </Button>
          </>
        }
      >
        <ul className="space-y-2">
          {selectedRows.map((p) => (
            <li key={p.workerId} className="flex justify-between text-sm">
              <span className="text-ink-2">{workerById[p.workerId].name}</span>
              <span className="font-semibold text-ink tabular">{formatINR(p.net)}</span>
            </li>
          ))}
        </ul>
        <Field label="Pay from UPI ID" className="mt-5">
          <Input defaultValue="sharma.constructions@upi" />
        </Field>
      </Modal>
    </>
  )
}

export default function Payments() {
  const { user } = useAuth()
  return user.role === 'employer' ? <EmployerPayments /> : <WorkerPayments />
}
