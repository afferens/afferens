import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://afferens.com'

const PACKS: Record<string, { netCents: number; tokens: number; label: string }> = {
  spark:   { netCents: 900,   tokens: 50_000,    label: 'Spark — 50,000 Sense Tokens' },
  builder: { netCents: 2900,  tokens: 200_000,   label: 'Builder — 200,000 Sense Tokens' },
  studio:  { netCents: 9900,  tokens: 1_000_000, label: 'Studio — 1,000,000 Sense Tokens' },
  scale:   { netCents: 29900, tokens: 4_000_000, label: 'Scale — 4,000,000 Sense Tokens' },
}

// Spark rate: 50,000 tokens per $9
const TOKENS_PER_CENT = 50_000 / 900

function grossUp(netCents: number): number {
  return Math.ceil((netCents + 30) / (1 - 0.029))
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { pack, amount } = await request.json()

  let netCents: number
  let tokens: number
  let label: string

  if (pack === 'custom') {
    const netDollars = Number(amount)
    if (!netDollars || netDollars < 10) {
      return NextResponse.json({ error: 'Minimum custom amount is $10' }, { status: 400 })
    }
    netCents = Math.round(netDollars * 100)
    tokens = Math.floor(netCents * TOKENS_PER_CENT)
    label = `Custom — ${tokens.toLocaleString()} Sense Tokens`
  } else {
    const packData = PACKS[pack]
    if (!packData) {
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 })
    }
    netCents = packData.netCents
    tokens = packData.tokens
    label = packData.label
  }

  const grossCents = grossUp(netCents)
  const feeCents = grossCents - netCents

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'usd',
    customer_email: user.email ?? undefined,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: grossCents,
        product_data: {
          name: label,
          description: `Includes $${(feeCents / 100).toFixed(2)} processing fee`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      user_id: user.id,
      tokens: String(tokens),
      pack,
    },
    success_url: `${BASE_URL}/dashboard?purchase=success`,
    cancel_url: `${BASE_URL}/pricing`,
  })

  return NextResponse.json({ url: session.url })
}
