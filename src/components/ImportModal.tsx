'use client'

import { useRef, useState } from 'react'

type Props = {
  onImport: (file: File) => Promise<void>
  onClose: () => void
}

export default function ImportModal({ onImport, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [importing, setImporting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.name.match(/\.(xlsx|xls|csv)$/i)) setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    await onImport(file)
    setImporting(false)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <h2>↑ Import Policies</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Upload an Excel (.xlsx) or CSV file. The file should include columns matching:{' '}
          <span style={{ color: 'var(--text)' }}>
            Group Name, Group DBA, Policy Status, Policy Number, Carrier, Renewal Date, Lives,
            Agent Name, Agency Name, Paragon Sales Exec
          </span>
          . New records will be appended to the existing data.
        </p>

        <div
          className={`drop-zone${dragOver ? ' drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span className="drop-zone-icon">📂</span>
          <span>Drop your file here or click to browse</span>
          <br />
          <span style={{ fontSize: 11, marginTop: 6, display: 'inline-block' }}>
            Accepts .xlsx, .xls, .csv
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="file-selected">
            <span>📄</span>
            <span>{file.name}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 11 }}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={!file || importing}
          >
            {importing ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
