import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  const body = await request.json()
  const policy = await prisma.policy.update({
    where: { id },
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
  return NextResponse.json(policy)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id)
  await prisma.policy.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
