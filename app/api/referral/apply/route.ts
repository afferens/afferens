import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { maxRequests: 5, windowMs: 15 * 60 * 1000 })
  if (limited) return limited

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await request.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check current user's record
  const { data: myRecord } = await admin
    .from('api_keys')
    .select('id, referred_by')
    .eq('user_id', user.id)
    .single()

  if (!myRecord) return NextResponse.json({ error: 'Account not found' }, { status: 404 })

  if (myRecord.referred_by) {
    return NextResponse.json({ error: 'You have already applied a referral code' }, { status: 400 })
  }

  // Find the code
  const { data: codeOwner } = await admin
    .from('api_keys')
    .select('user_id, is_admin')
    .eq('referral_code', code.toUpperCase())
    .single()

  if (!codeOwner) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
  }

  if (codeOwner.user_id === user.id) {
    return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 })
  }

  if (!codeOwner.is_admin) {
    return NextResponse.json({ error: 'Referral codes must be entered at signup' }, { status: 400 })
  }

  await admin
    .from('api_keys')
    .update({ referred_by: code.toUpperCase() })
    .eq('id', myRecord.id)

  return NextResponse.json({ success: true })
}
