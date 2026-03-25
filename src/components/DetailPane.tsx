'use client'

import { useEffect, useState } from 'react'
import type { Policy, PolicyInput } from '@/types/policy'

const CARRIER_COLORS: Record<string, string> = {
  UHC: '#4fffb0',
  Principal: '#7eb8ff',
  TransAmerica: '#ffb347',
  Amwins: '#ff6b8a',
}

const CARRIERS = ['UHC', 'Principal', 'TransAmerica', 'Amwins']
const STATUSES = [
  'Active',
  'Active - AOR/GA for 2026',
  'Active - AOR/GA',
  'Active - New Group 2026',
]

type Props = {
  policy: Policy | null
  onSave: (id: number, data: PolicyInput) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export default function DetailPane({ policy, onSave, onDelete }: Props) {
  const [form, setForm] = useState<PolicyInput>({
    groupName: null, groupDba: null, policyStatus: null, policyNumber: null,
    carrier: null, renewalDate: null, lives: null, agentName: null,
    agencyName: null, paragonSalesExec: null,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (policy) {
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = policy
      setForm(rest)
    }
  }, [policy?.id])

  if (!policy) {
    return (
      <div className="detail-pane">
        <div className="detail-empty">
          <span className="hint-icon">↗</span>
          <span>Select a policy to view and edit details</span>
        </div>
      </div>
    )
  }

  const set = (field: keyof PolicyInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(policy.id, form)
    setSaving(false)
  }

  const dateValue = form.renewalDate ? form.renewalDate.split('T')[0] : ''

  return (
    <div className="detail-pane">
      <div className="detail-header">
        <div className="detail-header-left">
          <h2>{form.groupName || '—'}</h2>
          {form.groupDba && <div className="dba">DBA: {form.groupDba}</div>}
        </div>
        <span
          className="carrier-dot"
          style={{
            background: CARRIER_COLORS[form.carrier ?? ''] ?? 'var(--muted)',
            width: 12,
            height: 12,
            marginTop: 4,
            flexShrink: 0,
          }}
        />
      </div>

      <div className="detail-body">
        <div className="field-group">
          <div className="field-group-title">Policy Details</div>
          <div className="field-row">
            <label className="field-label">Group Name</label>
            <input className="field-input" value={form.groupName ?? ''} onChange={(e) => set('groupName', e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Group DBA</label>
            <input className="field-input" value={form.groupDba ?? ''} onChange={(e) => set('groupDba', e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Policy Number</label>
            <input className="field-input" type="number" value={form.policyNumber ?? ''} onChange={(e) => set('policyNumber', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="field-row">
            <label className="field-label">Carrier</label>
            <select className="field-input" value={form.carrier ?? ''} onChange={(e) => set('carrier', e.target.value)}>
              <option value="">— Select —</option>
              {CARRIERS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Policy Status</label>
            <select className="field-input" value={form.policyStatus ?? ''} onChange={(e) => set('policyStatus', e.target.value)}>
              <option value="">— Select —</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Renewal Date</label>
            <input className="field-input" type="date" value={dateValue} onChange={(e) => set('renewalDate', e.target.value || null)} />
          </div>
          <div className="field-row">
            <label className="field-label">Lives</label>
            <input className="field-input" type="number" min="0" value={form.lives ?? ''} onChange={(e) => set('lives', e.target.value ? Number(e.target.value) : null)} />
          </div>
        </div>

        <div className="field-group">
          <div className="field-group-title">Agent & Agency</div>
          <div className="field-row">
            <label className="field-label">Agent Name</label>
            <input className="field-input" value={form.agentName ?? ''} onChange={(e) => set('agentName', e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Agency Name</label>
            <input className="field-input" value={form.agencyName ?? ''} onChange={(e) => set('agencyName', e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">PolicyPulse Exec</label>
            <input className="field-input" value={form.paragonSalesExec ?? ''} onChange={(e) => set('paragonSalesExec', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="detail-footer">
        <button className="btn btn-save" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button className="btn btn-danger btn-secondary" onClick={() => onDelete(policy.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}
