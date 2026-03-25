import type { Policy } from '@/types/policy'

type Props = { policies: Policy[] }

export default function StatsBar({ policies }: Props) {
  const totalLives = policies.reduce((s, p) => s + (p.lives ?? 0), 0)
  const agents = new Set(policies.map((p) => p.agentName).filter(Boolean)).size
  const agencies = new Set(policies.map((p) => p.agencyName).filter(Boolean)).size
  const uhcCount = policies.filter((p) => p.carrier === 'UHC').length
  const otherCount = policies.filter((p) => p.carrier !== 'UHC').length

  return (
    <div className="stats-bar">
      <div className="stat-cell">
        <span className="stat-label">Total Policies</span>
        <span className="stat-value">{policies.length}</span>
      </div>
      <div className="stat-cell">
        <span className="stat-label">Total Lives</span>
        <span className="stat-value" style={{ color: 'var(--accent3)' }}>
          {totalLives.toLocaleString()}
        </span>
      </div>
      <div className="stat-cell">
        <span className="stat-label">Active Agents</span>
        <span className="stat-value" style={{ color: 'var(--accent2)' }}>
          {agents}
        </span>
      </div>
      <div className="stat-cell">
        <span className="stat-label">Agencies</span>
        <span className="stat-value" style={{ color: 'var(--accent4)' }}>
          {agencies}
        </span>
      </div>
      <div className="stat-cell">
        <span className="stat-label">UHC</span>
        <span className="stat-value" style={{ color: 'var(--accent)' }}>
          {uhcCount}
        </span>
      </div>
      <div className="stat-cell">
        <span className="stat-label">Other Carriers</span>
        <span className="stat-value" style={{ color: 'var(--accent2)' }}>
          {otherCount}
        </span>
      </div>
    </div>
  )
}
