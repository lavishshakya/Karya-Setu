import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { BadgeCheck, CircleCheck, CircleX, Landmark, Search, Send, Users } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge, { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select, Switch } from '@/components/ui/Field'
import { EmptyState, PageHeader } from '@/components/ui/Misc'
import Modal from '@/components/ui/Modal'
import Tabs from '@/components/ui/Tabs'
import { useToast } from '@/context/ToastContext'
import { eligibleSchemes, schemes, villageWorkers } from '@/data/panchayat'
import { cn } from '@/lib/utils'

const schemeName = (id) => schemes.find((s) => s.id === id)?.short ?? id

export default function VillageWorkers() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [workers, setWorkers] = useState(villageWorkers)
  const [status, setStatus] = useState('all')
  const [ward, setWard] = useState('all')
  const [noEShram, setNoEShram] = useState(false)
  const [checking, setChecking] = useState(null)

  const rows = workers
    .filter((w) => status === 'all' || w.status === status)
    .filter((w) => ward === 'all' || String(w.ward) === ward)
    .filter((w) => !noEShram || !w.eShram)
    .filter((w) => `${w.name} ${w.skill}`.toLowerCase().includes(query.toLowerCase()))

  const enrol = (worker, scheme) => {
    setWorkers((list) =>
      list.map((w) =>
        w.id === worker.id
          ? { ...w, schemes: [...w.schemes, scheme.id], eShram: w.eShram || scheme.id === 'eshram' }
          : w,
      ),
    )
    setChecking((c) => c && { ...c, schemes: [...c.schemes, scheme.id], eShram: c.eShram || scheme.id === 'eshram' })
    toast({ title: `${worker.name} enrolled in ${scheme.short}`, description: 'Application sent to the block office.' })
  }

  return (
    <>
      <PageHeader
        title="Village workers"
        description="Everyone registered from your panchayat, their work status and the welfare schemes they're part of."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Registered', workers.length, Users, 'text-brand-600'],
          ['Employed', workers.filter((w) => w.status === 'employed').length, CircleCheck, 'text-emerald-600'],
          ['Seeking work', workers.filter((w) => w.status === 'seeking').length, Search, 'text-amber-600'],
          ['No e-Shram card', workers.filter((w) => !w.eShram).length, CircleX, 'text-rose-600'],
        ].map(([label, value, Icon, color]) => (
          <Card key={label} className="flex items-center gap-3 p-4">
            <Icon size={22} className={color} />
            <div>
              <p className="text-2xl font-extrabold text-ink">{value}</p>
              <p className="text-xs font-semibold text-muted">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs
          value={status}
          onChange={setStatus}
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'employed', label: 'Employed' },
            { value: 'seeking', label: 'Seeking work' },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto">
          <Switch size="sm" checked={noEShram} onChange={setNoEShram} label="Only without e-Shram" />
          <div className="sm:w-36">
            <Select value={ward} onChange={(e) => setWard(e.target.value)} aria-label="Ward">
              <option value="all">All wards</option>
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i} value={String(i + 1)}>
                  Ward {i + 1}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-60">
            <Input
              icon={Search}
              value={query}
              onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
              placeholder="Name or skill"
              aria-label="Search workers"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={Users} title="No workers match these filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base min-w-[860px]">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Ward</th>
                  <th>Skill</th>
                  <th>Status</th>
                  <th>e-Shram</th>
                  <th>Schemes</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={w.name} size={34} />
                        <div>
                          <p className="font-semibold text-ink">{w.name}</p>
                          <p className="text-xs text-muted">
                            {w.gender}, {w.age} yrs
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-ink-2">{w.ward}</td>
                    <td className="text-ink-2">{w.skill}</td>
                    <td>
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={w.status} />
                        {w.daysIdle > 0 && (
                          <span
                            className={cn('text-xs font-semibold', w.daysIdle >= 30 ? 'text-rose-600' : 'text-muted')}
                          >
                            {w.daysIdle} days idle
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {w.eShram ? (
                        <Badge tone="success" icon={BadgeCheck}>
                          Registered
                        </Badge>
                      ) : (
                        <Badge tone="danger" icon={CircleX}>
                          Missing
                        </Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex max-w-56 flex-wrap gap-1">
                        {w.schemes.length ? (
                          w.schemes.map((id) => (
                            <span
                              key={id}
                              className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-2"
                            >
                              {schemeName(id)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted">None yet</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right">
                      <Button size="sm" variant="outline" icon={Landmark} onClick={() => setChecking(w)}>
                        Check schemes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(checking)}
        onClose={() => setChecking(null)}
        title={checking && `Schemes for ${checking.name}`}
        description={
          checking && `${checking.age} yrs · ${checking.skill} · ~₹${checking.income.toLocaleString('en-IN')}/month`
        }
        icon={Landmark}
      >
        {checking && (
          <ul className="space-y-2.5">
            {eligibleSchemes(checking).map((s) => {
              const enrolled = checking.schemes.includes(s.id)
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{s.short}</p>
                    <p className="truncate text-xs text-muted">{s.benefit}</p>
                  </div>
                  {enrolled ? (
                    <Badge tone="success" icon={CircleCheck}>
                      Enrolled
                    </Badge>
                  ) : (
                    <Button size="sm" icon={Send} onClick={() => enrol(checking, s)}>
                      Enrol
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Modal>
    </>
  )
}
