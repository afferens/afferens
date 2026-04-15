import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
  const supabase = createAdminClient()

  // ── Setup mode: user saved their card for auto top-up ──
  if (session.mode === 'setup') {
    const userId = session.metadata?.user_id
    const pack = session.metadata?.pack ?? 'spark'
    const threshold = parseInt(session.metadata?.threshold ?? '1000')

    if (!userId) return NextResponse.json({ error: 'No user_id in metadata' }, { status: 400 })

    // Get the setup intent to retrieve the saved payment method
    const setupIntent = await stripe.setupIntents.retrieve(session.setup_intent as string)
    const paymentMethodId = setupIntent.payment_method as string

    // Create or retrieve a Stripe customer for this user
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.id === userId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 })

    let customerId = session.customer as string | null
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email })
      customerId = customer.id
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId })

    await supabase
      .from('api_keys')
      .update({
        stripe_customer_id: customerId,
        stripe_payment_method_id: paymentMethodId,
        auto_topup_enabled: true,
        auto_topup_pack: pack,
        auto_topup_threshold: threshold,
      })
      .eq('user_id', userId)

    return NextResponse.json({ received: true, mode: 'setup' })
  }

  // ── Payment mode: manual credit pack purchase ──
  const email = session.customer_details?.email
  if (!email) {
    return NextResponse.json({ error: 'No email on session' }, { status: 400 })
  }

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
    const amount = session.amount_total ?? 0
    if (amount <= 900)       tokensToAdd = TOKEN_GRANTS.spark
    else if (amount <= 2900) tokensToAdd = TOKEN_GRANTS.builder
    else if (amount <= 9900) tokensToAdd = TOKEN_GRANTS.studio
    else                     tokensToAdd = TOKEN_GRANTS.scale
  }

  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const user = users.find(u => u.email === email)
  if (!user) {
    console.error(`Stripe webhook: no Afferens account found for email ${email}`)
    return NextResponse.json({ received: true, warning: 'No matching user found' })
  }

  const { data: keyRecord, error: keyError } = await supabase
    .from('api_keys')
    .select('id, tokens_consumed')
    .eq('user_id', user.id)
    .single()

  if (keyError || !keyRecord) {
    return NextResponse.json({ error: 'No api_keys record for user' }, { status: 500 })
  }

  const newConsumed = keyRecord.tokens_consumed - tokensToAdd

  await supabase
    .from('api_keys')
    .update({ tokens_consumed: newConsumed })
    .eq('id', keyRecord.id)

  return NextResponse.json({ received: true, tokens_granted: tokensToAdd })
}
