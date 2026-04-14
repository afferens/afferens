import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this user already has an API key
      const admin = createAdminClient()
      const { data: existingKey } = await admin
        .from('api_keys')
        .select('key')
        .eq('user_id', data.user.id)
        .single()

      // If no key exists yet, generate one for this new user
      if (!existingKey) {
        const emailPrefix = data.user.email?.split('@')[0].slice(0, 8).toUpperCase() || 'USER'
        const randomHex = Math.floor(Math.random() * 99).toString().padStart(2, '0')
        const newKey = `AFF-${randomHex}-${emailPrefix}`

        await admin.from('api_keys').insert({
          user_id: data.user.id,
          key: newKey,
        })
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/signup?error=auth_failed`)
}
