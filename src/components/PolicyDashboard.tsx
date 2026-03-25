'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Policy, PolicyInput } from '@/types/policy'
import StatsBar from './StatsBar'
import PolicyTable from './PolicyTable'
import DetailPane from './DetailPane'
import AddPolicyModal from './AddPolicyModal'
import ImportModal from './ImportModal'
import Toast from './Toast'

export default function PolicyDashboard() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [filtered, setFiltered] = useState<Policy[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterCarrier, setFilterCarrier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [sortCol, setSortCol] = useState('groupName')
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPolicies = useCallback(async () => {
    try {
      const res = await fetch('/api/policies')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Policy[] = await res.json()
      setPolicies(data)
    } catch (err) {
      console.error('Failed to load policies:', err)
      showToast('Failed to load policies — check database connection')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPolicies() }, [fetchPolicies])

  // Client-side filter + sort
  useEffect(() => {
    let result = [...policies]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        [p.groupName, p.groupDba, String(p.policyNumber ?? ''), p.agentName, p.agencyName]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    if (filterCarrier) result = result.filter((p) => p.carrier === filterCarrier)
    if (filterAgent) result = result.filter((p) => p.agentName === filterAgent)
    if (filterStatus) {
      result = result.filter((p) => {
        const s = p.policyStatus?.toLowerCase() ?? ''
        if (filterStatus === 'Active') return !s.includes('aor') && !s.includes('ga') && !s.includes('new')
        if (filterStatus === 'AOR') return s.includes('aor') || s.includes('ga')
        if (filterStatus === 'New') return s.includes('new')
        return true
      })
    }

    result.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortCol] ?? ''
      const bv = (b as Record<string, unknown>)[sortCol] ?? ''
      if (sortCol === 'lives' || sortCol === 'policyNumber') {
        return (Number(av) - Number(bv)) * sortDir
      }
      if (sortCol === 'renewalDate') {
        const ad = av ? new Date(String(av)).getTime() : 0
        const bd = bv ? new Date(String(bv)).getTime() : 0
        return (ad - bd) * sortDir
      }
      return String(av).toLowerCase() < String(bv).toLowerCase() ? -sortDir : sortDir
    })

    setFiltered(result)
  }, [policies, search, filterCarrier, filterStatus, filterAgent, sortCol, sortDir])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === 1 ? -1 : 1))
    else { setSortCol(col); setSortDir(1) }
  }

  const handleSave = async (id: number, data: PolicyInput) => {
    await fetch(`/api/policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchPolicies()
    showToast('Changes saved ✓')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this policy? This cannot be undone.')) return
    await fetch(`/api/policies/${id}`, { method: 'DELETE' })
    setSelectedId(null)
    await fetchPolicies()
    showToast('Policy deleted')
  }

  const handleAdd = async (data: PolicyInput) => {
    await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchPolicies()
    setShowAdd(false)
    showToast('Policy added ✓')
  }

  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/import', { method: 'POST', body: formData })
    const { imported, error } = await res.json()
    if (error) { showToast(`Import failed: ${error}`); return }
    await fetchPolicies()
    setShowImport(false)
    showToast(`${imported} policies imported ✓`)
  }

  const handleExportCSV = () => {
    const fields: (keyof Policy)[] = [
      'groupName', 'groupDba', 'policyStatus', 'policyNumber', 'carrier',
      'renewalDate', 'lives', 'agentName', 'agencyName', 'paragonSalesExec',
    ]
    const headers = [
      'Group Name', 'Group DBA', 'Policy Status', 'Policy Number', 'Carrier',
      'Renewal Date', 'Lives', 'Agent Name', 'Agency Name', 'PolicyPulse Exec',
    ]
    const rows = [
      headers.join(','),
      ...policies.map((p) =>
        fields.map((f) => `"${String(p[f] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'active_policies_export.csv'
    a.click()
    showToast('CSV exported ✓')
  }

  const agents = Array.from(new Set(policies.map((p) => p.agentName).filter((x): x is string => !!x)))
  const carriers = Array.from(new Set(policies.map((p) => p.carrier).filter((x): x is string => !!x)))
  const selectedPolicy = policies.find((p) => p.id === selectedId) ?? null
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="layout">
      <header>
        <div className="header-title">
          <h1>Active Policies</h1>
          <p>PolicyPulse · {today}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>↑ Import</button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>↓ Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Policy</button>
        </div>
      </header>

      <StatsBar policies={policies} />

      <div className="controls">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search groups, agents, policy #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filterCarrier} onChange={(e) => setFilterCarrier(e.target.value)}>
          <option value="">All Carriers</option>
          {carriers.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="AOR">AOR / GA</option>
          <option value="New">New Group</option>
        </select>
        <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
          <option value="">All Agents</option>
          {agents.map((a) => <option key={a}>{a}</option>)}
        </select>
        <span className="record-count">{filtered.length} of {policies.length} records</span>
      </div>

      <div className="main">
        <PolicyTable
          policies={filtered}
          selectedId={selectedId}
          sortCol={sortCol}
          sortDir={sortDir}
          onSelect={setSelectedId}
          onSort={handleSort}
          loading={loading}
        />
        <DetailPane
          policy={selectedPolicy}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>

      {showAdd && <AddPolicyModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      {showImport && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}
      <Toast message={toast} />
    </div>
  )
}
