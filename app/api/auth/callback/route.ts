import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'REF-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  code += '-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const refCode = searchParams.get('ref')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const admin = createAdminClient()
      const { data: existingKey } = await admin
        .from('api_keys')
        .select('key')
        .eq('user_id', data.user.id)
        .single()

      if (!existingKey) {
        const emailPrefix = data.user.email?.split('@')[0].slice(0, 8).toUpperCase() || 'USER'
        const randomHex = Math.floor(Math.random() * 99).toString().padStart(2, '0')
        const newKey = `AFF-${randomHex}-${emailPrefix}`
        const referralCode = generateReferralCode()

        // Validate referral code if provided
        let referredBy: string | null = null
        if (refCode) {
          const { data: refOwner } = await admin
            .from('api_keys')
            .select('user_id')
            .eq('referral_code', refCode)
            .single()

          if (refOwner && refOwner.user_id !== data.user.id) {
            referredBy = refCode
          }
        }

        await admin.from('api_keys').insert({
          user_id: data.user.id,
          key: newKey,
          referral_code: referralCode,
          ...(referredBy ? { referred_by: referredBy } : {}),
        })
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/signup?error=auth_failed`)
}
