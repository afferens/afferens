import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PACK_AMOUNTS: Record<string, number> = {
  spark:   900,
  builder: 2900,
  studio:  9900,
  scale:   29900,
}

const TOKEN_GRANTS: Record<string, number> = {
  spark:   50_000,
  builder: 200_000,
  studio:  1_000_000,
  scale:   4_000_000,
}

export async function POST(request: NextRequest) {
  const { key_id } = await request.json()

  const supabase = createAdminClient()

  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('id, tokens_consumed, stripe_customer_id, stripe_payment_method_id, auto_topup_enabled, auto_topup_pack')
    .eq('id', key_id)
    .single()

  if (!keyRecord || !keyRecord.auto_topup_enabled) return NextResponse.json({ skipped: true })
  if (!keyRecord.stripe_customer_id || !keyRecord.stripe_payment_method_id) return NextResponse.json({ skipped: true })

  const pack = keyRecord.auto_topup_pack ?? 'spark'
  const amount = PACK_AMOUNTS[pack] ?? 900
  const tokensToAdd = TOKEN_GRANTS[pack] ?? 50_000

  try {
    await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: keyRecord.stripe_customer_id,
      payment_method: keyRecord.stripe_payment_method_id,
      confirm: true,
      off_session: true,
    })
  } catch {
    // Payment failed — disable auto top-up so we don't keep trying a bad card
    await supabase
      .from('api_keys')
      .update({ auto_topup_enabled: false })
      .eq('id', key_id)
    return NextResponse.json({ error: 'Payment failed, auto top-up disabled' }, { status: 402 })
  }

  const newConsumed = keyRecord.tokens_consumed - tokensToAdd

  await supabase
    .from('api_keys')
    .update({ tokens_consumed: newConsumed })
    .eq('id', key_id)

  return NextResponse.json({ topped_up: true, tokens_added: tokensToAdd })
}
