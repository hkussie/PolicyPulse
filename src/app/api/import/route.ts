import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as XLSX from 'xlsx'

const COLUMN_MAP: Record<string, string> = {
  'group name': 'groupName',
  'group dba': 'groupDba',
  'policy status': 'policyStatus',
  'policy number': 'policyNumber',
  'carrier': 'carrier',
  'renewal date': 'renewalDate',
  'lives': 'lives',
  'agent name': 'agentName',
  'agency name': 'agencyName',
  'paragon sales exec': 'paragonSalesExec',
}

function parseDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') {
    // Excel serial date
    return XLSX.SSF.parse_date_code(value) as unknown as Date
  }
  const d = new Date(String(value))
  return isNaN(d.getTime()) ? null : d
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null })

  const records = rows.map((row) => {
    const record: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      const field = COLUMN_MAP[key.trim().toLowerCase()]
      if (field) record[field] = value
    }
    return record
  })

  const created = await prisma.$transaction(
    records
      .filter((r) => r.groupName) // skip rows with no group name
      .map((r) =>
        prisma.policy.create({
          data: {
            groupName: r.groupName ? String(r.groupName) : null,
            groupDba: r.groupDba ? String(r.groupDba) : null,
            policyStatus: r.policyStatus ? String(r.policyStatus) : null,
            policyNumber: r.policyNumber ? Math.round(Number(r.policyNumber)) : null,
            carrier: r.carrier ? String(r.carrier) : null,
            renewalDate: parseDate(r.renewalDate),
            lives: r.lives ? Math.round(Number(r.lives)) : null,
            agentName: r.agentName ? String(r.agentName) : null,
            agencyName: r.agencyName ? String(r.agencyName) : null,
            paragonSalesExec: r.paragonSalesExec ? String(r.paragonSalesExec) : null,
          },
        })
      )
  )

  return NextResponse.json({ imported: created.length })
}
