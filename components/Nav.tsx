'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
  }, [])

  return (
    <nav
      className="flex items-center justify-between px-8 py-5 border-b sticky top-0 z-40 backdrop-blur-sm"
      style={{ borderColor: 'var(--border)', background: 'rgba(8,8,8,0.85)' }}
    >
      <Link href="/">
        <Image src="/afferens-logo.png" alt="Afferens" height={26} width={130} style={{ objectFit: 'contain' }} />
      </Link>
      <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
        <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link
          href={loggedIn ? '/dashboard' : '/signup'}
          className="px-4 py-2 text-sm font-medium border transition-all hover:border-white"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
        >
          {loggedIn ? 'Dashboard' : 'Sign In'}
        </Link>
      </div>
    </nav>
  )
}
