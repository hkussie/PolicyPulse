import type { Policy } from '@/types/policy'

const CARRIER_COLORS: Record<string, string> = {
  UHC: '#4fffb0',
  Principal: '#7eb8ff',
  TransAmerica: '#ffb347',
  Amwins: '#ff6b8a',
}

function carrierColor(c: string | null) {
  return c ? (CARRIER_COLORS[c] ?? 'var(--muted)') : 'var(--muted)'
}

function statusBadgeClass(s: string | null) {
  if (!s) return 'badge-active'
  const lower = s.toLowerCase()
  if (lower.includes('aor') || lower.includes('ga')) return 'badge-aor'
  if (lower.includes('new')) return 'badge-new'
  return 'badge-active'
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  const match = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return '—'
  const dt = new Date(Number(match[1]), Number(match[2]) - 1, 1)
  return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

type Col = { key: string; label: string }
const COLS: Col[] = [
  { key: 'groupName', label: 'Group Name' },
  { key: 'carrier', label: 'Carrier' },
  { key: 'policyStatus', label: 'Status' },
  { key: 'policyNumber', label: 'Policy #' },
  { key: 'renewalDate', label: 'Renewal' },
  { key: 'lives', label: 'Lives' },
  { key: 'agentName', label: 'Agent' },
  { key: 'agencyName', label: 'Agency' },
]

type Props = {
  policies: Policy[]
  selectedId: number | null
  sortCol: string
  sortDir: 1 | -1
  onSelect: (id: number) => void
  onSort: (col: string) => void
  loading: boolean
}

export default function PolicyTable({
  policies,
  selectedId,
  sortCol,
  sortDir,
  onSelect,
  onSort,
  loading,
}: Props) {
  return (
    <div className="table-pane">
      <table>
        <thead>
          <tr>
            {COLS.map((col) => (
              <th
                key={col.key}
                className={sortCol === col.key ? 'sorted' : ''}
                onClick={() => onSort(col.key)}
              >
                {col.label} {sortCol === col.key ? (sortDir === 1 ? '↑' : '↓') : '↕'}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="empty-row">
              <td colSpan={8}>Loading...</td>
            </tr>
          ) : policies.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={8}>No policies found</td>
            </tr>
          ) : (
            policies.map((p) => (
              <tr
                key={p.id}
                className={p.id === selectedId ? 'selected' : ''}
                onClick={() => onSelect(p.id)}
              >
                <td title={p.groupName ?? ''}>
                  {p.groupName}
                  {p.groupDba && (
                    <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>
                      {p.groupDba}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className="carrier-dot"
                    style={{ background: carrierColor(p.carrier) }}
                  />
                  {p.carrier ?? '—'}
                </td>
                <td>
                  {p.policyStatus ? (
                    <span className={`badge ${statusBadgeClass(p.policyStatus)}`}>
                      {p.policyStatus}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--muted)' }}>—</span>
                  )}
                </td>
                <td style={{ color: 'var(--muted)' }}>{p.policyNumber ?? '—'}</td>
                <td>{fmtDate(p.renewalDate)}</td>
                <td style={{ textAlign: 'right', paddingRight: 20 }}>
                  {p.lives?.toLocaleString() ?? 0}
                </td>
                <td>{p.agentName ?? <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                <td
                  style={{ color: 'var(--muted)' }}
                  title={p.agencyName ?? ''}
                >
                  {p.agencyName
                    ? p.agencyName.length > 28
                      ? p.agencyName.slice(0, 28) + '…'
                      : p.agencyName
                    : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
