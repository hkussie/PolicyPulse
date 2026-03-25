'use client'

import { useState } from 'react'
import type { PolicyInput } from '@/types/policy'

const CARRIERS = ['UHC', 'Principal', 'TransAmerica', 'Amwins']
const STATUSES = [
  'Active',
  'Active - AOR/GA for 2026',
  'Active - AOR/GA',
  'Active - New Group 2026',
]

type Props = {
  onAdd: (data: PolicyInput) => Promise<void>
  onClose: () => void
}

export default function AddPolicyModal({ onAdd, onClose }: Props) {
  const [form, setForm] = useState<PolicyInput>({
    groupName: null, groupDba: null, policyStatus: 'Active', policyNumber: null,
    carrier: null, renewalDate: null, lives: null, agentName: null,
    agencyName: null, paragonSalesExec: null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof PolicyInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.groupName || !form.carrier) {
      setError('Group Name and Carrier are required.')
      return
    }
    setSaving(true)
    await onAdd(form)
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>+ Add Policy</h2>
        {error && (
          <p style={{ color: 'var(--accent4)', fontSize: 12, marginBottom: 14 }}>{error}</p>
        )}
        <div className="modal-grid">
          <div className="field-row full">
            <label className="field-label">Group Name *</label>
            <input className="field-input" placeholder="Acme Corp" value={form.groupName ?? ''} onChange={(e) => set('groupName', e.target.value)} />
          </div>
          <div className="field-row full">
            <label className="field-label">Group DBA</label>
            <input className="field-input" placeholder="Trading as..." value={form.groupDba ?? ''} onChange={(e) => set('groupDba', e.target.value)} />
          </div>
          <div className="field-row">
            <label className="field-label">Policy Number</label>
            <input className="field-input" type="number" placeholder="123456" value={form.policyNumber ?? ''} onChange={(e) => set('policyNumber', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="field-row">
            <label className="field-label">Carrier *</label>
            <select className="field-input" value={form.carrier ?? ''} onChange={(e) => set('carrier', e.target.value)}>
              <option value="">— Select —</option>
              {CARRIERS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Policy Status</label>
            <select className="field-input" value={form.policyStatus ?? ''} onChange={(e) => set('policyStatus', e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Renewal Date</label>
            <input className="field-input" type="date" value={form.renewalDate?.split('T')[0] ?? ''} onChange={(e) => set('renewalDate', e.target.value || null)} />
          </div>
          <div className="field-row">
            <label className="field-label">Lives</label>
            <input className="field-input" type="number" min="0" placeholder="0" value={form.lives ?? ''} onChange={(e) => set('lives', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="field-row">
            <label className="field-label">Agent Name</label>
            <input className="field-input" placeholder="Jane Smith" value={form.agentName ?? ''} onChange={(e) => set('agentName', e.target.value)} />
          </div>
          <div className="field-row full">
            <label className="field-label">Agency Name</label>
            <input className="field-input" placeholder="Best Insurance Agency" value={form.agencyName ?? ''} onChange={(e) => set('agencyName', e.target.value)} />
          </div>
          <div className="field-row full">
            <label className="field-label">PolicyPulse Exec</label>
            <input className="field-input" placeholder="Kussie, Tim" value={form.paragonSalesExec ?? ''} onChange={(e) => set('paragonSalesExec', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Adding…' : 'Add Policy'}
          </button>
        </div>
      </div>
    </div>
  )
}
