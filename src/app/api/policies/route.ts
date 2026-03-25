import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const policies = await prisma.policy.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json(policies)
  } catch (err) {
    console.error('GET /api/policies error:', err)
    return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const policy = await prisma.policy.create({
    data: {
      groupName: body.groupName || null,
      groupDba: body.groupDba || null,
      policyStatus: body.policyStatus || null,
      policyNumber: body.policyNumber ? Number(body.policyNumber) : null,
      carrier: body.carrier || null,
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      lives: body.lives !== undefined && body.lives !== '' ? Number(body.lives) : null,
      agentName: body.agentName || null,
      agencyName: body.agencyName || null,
      paragonSalesExec: body.paragonSalesExec || null,
    },
  })
  return NextResponse.json(policy, { status: 201 })
}
