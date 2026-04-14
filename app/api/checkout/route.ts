import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { pack, threshold } = await request.json()

  const session = await stripe.checkout.sessions.create({
    mode: 'setup',
    currency: 'usd',
    customer_email: user.email ?? undefined,
    success_url: `https://afferens.vercel.app/dashboard?autotopup=success`,
    cancel_url: `https://afferens.vercel.app/dashboard`,
    metadata: {
      user_id: user.id,
      pack: pack ?? 'spark',
      threshold: String(threshold ?? 1000),
    },
  })

  return NextResponse.json({ url: session.url })
}
