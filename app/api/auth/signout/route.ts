import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const headersList = await headers()
  const host = headersList.get('host') || 'afferens.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return NextResponse.redirect(new URL('/', `${protocol}://${host}`), { status: 303 })
}
