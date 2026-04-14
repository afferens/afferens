'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: 'var(--background)' }}>

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
            afferens
          </Link>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="text-xs font-mono mb-4 px-3 py-1 border inline-block" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              check your inbox
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>
              Magic link sent to <span style={{ color: 'var(--foreground)' }}>{email}</span>.
              <br />Click it to get your API key.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--foreground)' }}>
              Get your API key
            </h1>
            <p className="text-sm mb-8 text-center" style={{ color: 'var(--muted)' }}>
              Enter your email. We send a magic link — no password needed.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm font-mono border bg-transparent outline-none focus:border-[var(--accent)] transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  background: 'var(--surface)',
                }}
              />

              {error && (
                <p className="text-xs font-mono" style={{ color: '#ff4444' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-bold transition-opacity disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#000' }}
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>

            <p className="text-xs text-center mt-6" style={{ color: 'var(--muted)' }}>
              No credit card. No password. Free to start.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
