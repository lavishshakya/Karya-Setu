import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  Ban,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Download,
  Eye,
  HardHat,
  RotateCcw,
  Search,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { EmptyState, PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import { Meter } from '@/components/ui/Progress'
import Tabs from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { adminUsers, districts } from '@/data/admin'
import { cn, formatDate, toggleInSet } from '@/lib/utils'

const PAGE_SIZE = 8

const riskTone = (risk) => (risk >= 70 ? 'danger' : risk >= 30 ? 'warning' : 'success')

export default function Users() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [users, setUsers] = useState(adminUsers)
  const [tab, setTab] = useState('all')
  const [district, setDistrict] = useState('all')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(() => new Set())
  const [viewing, setViewing] = useState(null)

  const byTab = {
    all: () => true,
    worker: (u) => u.role === 'worker',
    employer: (u) => u.role === 'employer',
    pending: (u) => u.status === 'pending',
    flagged: (u) => u.status === 'flagged' || u.status === 'suspended',
  }
  const filtered = users
    .filter(byTab[tab])
    .filter((u) => district === 'all' || u.district === district)
    .filter((u) => `${u.name} ${u.id} ${u.detail}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.risk - a.risk)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages - 1)
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)
  const allOnPage = rows.length > 0 && rows.every((u) => selected.has(u.id))

  const setStatus = (ids, status, label) => {
    setUsers((list) => list.map((u) => (ids.includes(u.id) ? { ...u, status } : u)))
    setSelected(new Set())
    toast({
      tone: status === 'suspended' ? 'info' : 'success',
      title: `${ids.length} user${ids.length > 1 ? 's' : ''} ${label}`,
    })
  }

  const toggleAll = () =>
    setSelected((s) => {
      const next = new Set(s)
      rows.forEach((u) => (allOnPage ? next.delete(u.id) : next.add(u.id)))
      return next
    })

  const exportCsv = () => {
    const header = 'id,name,role,district,status,risk,joined'
    const lines = filtered.map((u) =>
      [u.id, `"${u.name}"`, u.role, u.district, u.status, u.risk, u.joined.slice(0, 10)].join(','),
    )
    const url = URL.createObjectURL(new Blob([[header, ...lines].join('\n')], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'karya-setu-users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Workers and employers across the platform. Verify documents, review risk and take action."
        actions={
          <Button variant="outline" icon={Download} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs
          value={tab}
          onChange={(v) => {
            setTab(v)
            setPage(0)
          }}
          tabs={[
            { value: 'all', label: 'All', count: users.length },
            { value: 'worker', label: 'Workers', count: users.filter(byTab.worker).length },
            { value: 'employer', label: 'Employers', count: users.filter(byTab.employer).length },
            { value: 'pending', label: 'Pending', count: users.filter(byTab.pending).length },
            { value: 'flagged', label: 'Flagged', count: users.filter(byTab.flagged).length },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="sm:w-72">
            <Input
              icon={Search}
              value={query}
              onChange={(e) => {
                setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })
                setPage(0)
              }}
              placeholder="Name, ID or detail"
              aria-label="Search users"
            />
          </div>
          <div className="sm:w-44">
            <Select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="District">
              <option value="all">All districts</option>
              {districts.map((d) => (
                <option key={d.district}>{d.district}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-brand-900 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-100 dark:ring-brand-500/25"
          >
            <p className="text-sm font-bold">{selected.size} selected</p>
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant="success"
                icon={UserCheck}
                onClick={() => setStatus([...selected], 'verified', 'verified')}
              >
                Verify
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={Ban}
                onClick={() => setStatus([...selected], 'suspended', 'suspended')}
              >
                Suspend
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={Search} title="No users match" description="Try another tab, district or search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base min-w-[860px]">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      checked={allOnPage}
                      onChange={toggleAll}
                      className="size-4 accent-brand-600"
                      aria-label="Select all on this page"
                    />
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>District</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>AI risk</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className={cn(selected.has(u.id) && 'bg-brand-50/60 dark:bg-brand-500/5')}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => setSelected((s) => toggleInSet(s, u.id))}
                        className="size-4 accent-brand-600"
                        aria-label={`Select ${u.name}`}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={34} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{u.name}</p>
                          <p className="truncate text-xs text-muted">{u.detail}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge
                        tone={u.role === 'worker' ? 'brand' : 'saffron'}
                        icon={u.role === 'worker' ? HardHat : Building2}
                      >
                        {u.role === 'worker' ? 'Worker' : 'Employer'}
                      </Badge>
                    </td>
                    <td className="text-ink-2">{u.district}</td>
                    <td className="text-ink-2 tabular">{formatDate(u.joined)}</td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>
                      <div className="flex w-28 items-center gap-2">
                        <Meter value={u.risk} tone={riskTone(u.risk)} height={6} label={`Risk ${u.risk}`} />
                        <span className="text-xs font-bold text-ink tabular">{u.risk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`View ${u.name}`}
                          onClick={() => setViewing(u)}
                        >
                          <Eye size={16} />
                        </Button>
                        {u.status === 'pending' && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Verify ${u.name}`}
                            onClick={() => setStatus([u.id], 'verified', 'verified')}
                          >
                            <UserCheck size={16} />
                          </Button>
                        )}
                        {u.status === 'suspended' ? (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Reinstate ${u.name}`}
                            onClick={() => setStatus([u.id], 'verified', 'reinstated')}
                          >
                            <RotateCcw size={16} />
                          </Button>
                        ) : (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Suspend ${u.name}`}
                            onClick={() => setStatus([u.id], 'suspended', 'suspended')}
                          >
                            <Ban size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
          <p className="text-muted">
            {filtered.length
              ? `${current * PAGE_SIZE + 1}–${Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of ${filtered.length}`
              : '0 results'}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Previous page"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="px-2 font-semibold text-ink">
              {current + 1} / {pages}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Next page"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        side="right"
        title={viewing?.name}
        description={viewing && `${viewing.id} · ${viewing.role} · ${viewing.district}`}
        footer={
          viewing && (
            <>
              <Button
                variant="danger-soft"
                icon={Ban}
                onClick={() => {
                  setStatus([viewing.id], 'suspended', 'suspended')
                  setViewing(null)
                }}
              >
                Suspend
              </Button>
              <Button
                variant="success"
                icon={CircleCheck}
                onClick={() => {
                  setStatus([viewing.id], 'verified', 'verified')
                  setViewing(null)
                }}
              >
                Mark verified
              </Button>
            </>
          )
        }
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={viewing.name} size={64} />
              <div>
                <StatusBadge status={viewing.status} size="md" />
                <p className="mt-1.5 text-sm text-ink-2">{viewing.detail}</p>
                <p className="text-xs text-muted">Joined {formatDate(viewing.joined)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-line p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <ShieldAlert
                  size={16}
                  className={
                    viewing.risk >= 70 ? 'text-rose-600' : viewing.risk >= 30 ? 'text-amber-600' : 'text-emerald-600'
                  }
                />
                AI risk score {viewing.risk}/100
              </p>
              <Meter value={viewing.risk} tone={riskTone(viewing.risk)} className="mt-3" label="Risk" />
              <p className="mt-2 text-xs text-muted">
                Based on document checks, duplicate signals, complaint history and payment behaviour.
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              {[
                ['Phone OTP', true],
                [viewing.role === 'worker' ? 'Aadhaar e-KYC' : 'GSTIN / Udyam', viewing.status === 'verified'],
                ['Duplicate check', viewing.risk < 70],
                ['No open complaints', viewing.risk < 30],
              ].map(([label, ok]) => (
                <li key={label} className="flex items-center justify-between rounded-xl bg-surface-2 px-3.5 py-2.5">
                  <span className="text-ink-2">{label}</span>
                  {ok ? (
                    <Badge tone="success" icon={CircleCheck}>
                      Passed
                    </Badge>
                  ) : (
                    <Badge tone="warning" icon={ShieldAlert}>
                      Review
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </>
  )
}
