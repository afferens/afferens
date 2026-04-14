import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// How many tokens each Stripe Payment Link product grants
const TOKEN_GRANTS: Record<string, number> = {
  spark:   50_000,
  builder: 200_000,
  studio:  1_000_000,
  scale:   4_000_000,
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 400 }
    )
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Get the customer's email from the session
  const email = session.customer_details?.email
  if (!email) {
    return NextResponse.json({ error: 'No email on session' }, { status: 400 })
  }

  // Determine which pack was purchased via the product name metadata
  // We look at the line items to find the product name
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
  const productName = lineItems.data[0]?.description?.toLowerCase() ?? ''

  let tokensToAdd = 0
  for (const [pack, tokens] of Object.entries(TOKEN_GRANTS)) {
    if (productName.includes(pack)) {
      tokensToAdd = tokens
      break
    }
  }

  if (tokensToAdd === 0) {
    // Fallback: derive from amount paid
    const amount = session.amount_total ?? 0
    if (amount <= 900)       tokensToAdd = TOKEN_GRANTS.spark
    else if (amount <= 2900) tokensToAdd = TOKEN_GRANTS.builder
    else if (amount <= 9900) tokensToAdd = TOKEN_GRANTS.studio
    else                     tokensToAdd = TOKEN_GRANTS.scale
  }

  const supabase = createAdminClient()

  // Find the user by email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const user = users.find(u => u.email === email)
  if (!user) {
    // User doesn't have an account yet — store the grant to apply on signup (future improvement)
    console.error(`Stripe webhook: no Afferens account found for email ${email}`)
    return NextResponse.json({ received: true, warning: 'No matching user found' })
  }

  // Fetch their current api_key record
  const { data: keyRecord, error: keyError } = await supabase
    .from('api_keys')
    .select('id, tokens_consumed')
    .eq('user_id', user.id)
    .single()

  if (keyError || !keyRecord) {
    return NextResponse.json({ error: 'No api_keys record for user' }, { status: 500 })
  }

  // We track "tokens_consumed" so we subtract the grant from the consumed count
  // (effectively giving them a credit). If consumed goes below 0 we clamp to 0.
  const newConsumed = Math.max(0, keyRecord.tokens_consumed - tokensToAdd)

  const { error: updateError } = await supabase
    .from('api_keys')
    .update({ tokens_consumed: newConsumed })
    .eq('id', keyRecord.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update token balance' }, { status: 500 })
  }

  console.log(`Stripe webhook: granted ${tokensToAdd} tokens to ${email}`)
  return NextResponse.json({ received: true, tokens_granted: tokensToAdd })
}
