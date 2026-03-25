import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 })
  }

  const headerPayload = headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)

  let event: WebhookEvent
  try {
    const wh = new Webhook(WEBHOOK_SECRET)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const { type, data } = event

  if (type === 'user.created' || type === 'user.updated') {
    const primaryEmail = (data as any).email_addresses?.find(
      (e: any) => e.id === (data as any).primary_email_address_id
    )?.email_address

    await prisma.user.upsert({
      where: { clerkId: (data as any).id },
      create: {
        clerkId: (data as any).id,
        email: primaryEmail ?? '',
        firstName: (data as any).first_name ?? null,
        lastName: (data as any).last_name ?? null,
        imageUrl: (data as any).image_url ?? null,
      },
      update: {
        email: primaryEmail ?? '',
        firstName: (data as any).first_name ?? null,
        lastName: (data as any).last_name ?? null,
        imageUrl: (data as any).image_url ?? null,
      },
    })
  }

  if (type === 'user.deleted') {
    await prisma.user.deleteMany({ where: { clerkId: (data as any).id } })
  }

  return new Response('OK', { status: 200 })
}
