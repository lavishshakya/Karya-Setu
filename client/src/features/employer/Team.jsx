import { useState } from 'react'
import {
  Building2,
  CalendarCheck,
  HardHat,
  MessageSquare,
  QrCode,
  Search,
  UserMinus,
  UserPlus,
  Wallet,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import { Meter } from '@/components/ui/Progress'
import StatTile from '@/components/ui/StatTile'
import { useToast } from '@/context/ToastContext'
import { sites, team as initialTeam } from '@/data/jobs'
import { workerById, workers } from '@/data/workers'
import { formatINR } from '@/lib/utils'

export default function Team() {
  const toast = useToast()
  const [team, setTeam] = useState(initialTeam)
  const [adding, setAdding] = useState(false)
  const [lookup, setLookup] = useState('')
  const [removing, setRemoving] = useState(null)

  const onSite = team.filter((m) => m.today === 'present' || m.today === 'half').length
  const weeklyCost = team.reduce((sum, m) => sum + m.wage * 6, 0)
  const candidates = workers.filter(
    (w) =>
      !team.some((m) => m.workerId === w.id) &&
      `${w.name} ${w.primarySkill} ${w.id}`.toLowerCase().includes(lookup.toLowerCase()),
  )

  const reassign = (workerId, siteId) => {
    setTeam((list) => list.map((m) => (m.workerId === workerId ? { ...m, siteId } : m)))
    toast({
      title: `${workerById[workerId].name} moved`,
      description: `Now at ${sites.find((s) => s.id === siteId).name}`,
    })
  }

  return (
    <>
      <PageHeader
        eyebrow="Contractor dashboard"
        title="My team"
        description="Assign workers to sites, see who's on duty and keep wages in check, all in one place."
        actions={
          <Button icon={UserPlus} onClick={() => setAdding(true)}>
            Add worker
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Team size" value={team.length} footer="across 3 sites" icon={HardHat} tone="brand" />
        <StatTile
          label="On duty today"
          value={`${onSite} / ${team.length}`}
          footer={`${Math.round((onSite / team.length) * 100)}% attendance`}
          icon={CalendarCheck}
          tone="success"
        />
        <StatTile
          label="Active sites"
          value={sites.length}
          footer="1 behind schedule"
          icon={Building2}
          tone="saffron"
        />
        <StatTile
          label="Weekly wage bill"
          value={formatINR(weeklyCost)}
          footer="at 6 days per worker"
          icon={Wallet}
          tone="violet"
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {sites.map((site) => {
          const crew = team.filter((m) => m.siteId === site.id)
          return (
            <Card key={site.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{site.name}</p>
                  <p className="text-sm text-muted">
                    {site.type} · {site.area}
                  </p>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-saffron-50 text-saffron-600 dark:bg-saffron-500/10 dark:text-saffron-300">
                  <Building2 size={19} />
                </span>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-muted">Work completed</span>
                  <span className="font-bold text-ink">{site.progress}%</span>
                </div>
                <Meter value={site.progress} tone="saffron" label={`${site.name} progress`} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {crew.map((m) => (
                    <Avatar
                      key={m.workerId}
                      name={workerById[m.workerId].name}
                      size={30}
                      className="rounded-full ring-2 ring-surface"
                    />
                  ))}
                </div>
                <span className="text-sm text-ink-2">
                  <b className="text-ink">{crew.filter((m) => m.today === 'present' || m.today === 'half').length}</b>/
                  {crew.length} on site
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 pb-3">
          <CardHeader
            title="Team roster"
            subtitle="Change a site from the dropdown; workers get an SMS with the new address"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="table-base min-w-[820px]">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Role</th>
                <th>Site</th>
                <th className="text-right">Wage</th>
                <th>Today</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((m) => {
                const w = workerById[m.workerId]
                return (
                  <tr key={m.workerId}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={w.name} size={36} verified={w.verified} />
                        <div>
                          <p className="font-semibold text-ink">{w.name}</p>
                          <p className="text-xs text-muted">
                            ★ {w.rating} · {w.experience} yrs
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-ink-2">{m.role}</td>
                    <td>
                      <select
                        value={m.siteId}
                        onChange={(e) => reassign(m.workerId, e.target.value)}
                        className="control h-9 w-60"
                        aria-label={`Site for ${w.name}`}
                      >
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-right font-semibold text-ink tabular">{formatINR(m.wage)}/day</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={m.today} />
                        {m.checkIn && <span className="text-xs text-muted">{m.checkIn}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" aria-label={`Message ${w.name}`} to="/employer/messages">
                          <MessageSquare size={16} />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Remove ${w.name}`}
                          onClick={() => setRemoving(m)}
                        >
                          <UserMinus size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a worker to your team"
        description="Search by name, skill or Worker ID, or scan their QR card."
        icon={UserPlus}
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              icon={Search}
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              placeholder="e.g. Sunita or KS-RJ-2026-…"
              aria-label="Find worker"
            />
          </div>
          <Button
            variant="outline"
            icon={QrCode}
            onClick={() =>
              toast({ tone: 'info', title: 'QR scanner', description: 'Camera scanning arrives with the mobile app.' })
            }
          >
            Scan
          </Button>
        </div>
        <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {candidates.map((w) => (
            <li key={w.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <Avatar name={w.name} size={38} verified={w.verified} online={w.available} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{w.name}</p>
                <p className="text-xs text-muted">
                  {w.primarySkill} · {w.area} · {formatINR(w.expectedWage)}/day
                </p>
              </div>
              <Button
                size="sm"
                icon={UserPlus}
                onClick={() => {
                  setTeam((list) => [
                    ...list,
                    {
                      workerId: w.id,
                      siteId: 's-1',
                      role: w.primarySkill,
                      wage: w.expectedWage,
                      today: 'leave',
                      checkIn: null,
                    },
                  ])
                  toast({ title: `${w.name} added to your team`, description: 'Assigned to Malviya Nagar Residency.' })
                }}
              >
                Add
              </Button>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Remove from team?"
        description={removing && workerById[removing.workerId].name}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setTeam((list) => list.filter((m) => m.workerId !== removing.workerId))
                toast({ title: 'Removed from team', description: 'Pending wages stay in payroll until paid.' })
                setRemoving(null)
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-2">
          Their attendance and payment history stay on record. Make sure all dues are cleared.
        </p>
      </Modal>
    </>
  )
}
