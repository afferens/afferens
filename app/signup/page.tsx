'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [showRefInput, setShowRefInput] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralCode(ref.toUpperCase())
      setShowRefInput(true)
    }
  }, [])

  function callbackUrl() {
    const base = `${window.location.origin}/api/auth/callback`
    return referralCode ? `${base}?ref=${encodeURIComponent(referralCode)}` : base
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl() },
    })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: 'var(--background)' }}>

      <div className="w-full max-w-sm">

        <div className="mb-10 text-center">
          <Link href="/">
            <Image src="/afferens-logo.png" alt="Afferens" height={28} width={140} style={{ objectFit: 'contain' }} />
          </Link>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="text-xs font-mono mb-4 px-3 py-1 border inline-block" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
              check your inbox
            </div>
            <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>
              Magic link sent to <span style={{ color: 'var(--foreground)' }}>{email}</span>.
              <br />Click it to access your dashboard.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--foreground)' }}>
              Sign in to Afferens
            </h1>
            <p className="text-sm mb-8 text-center" style={{ color: 'var(--muted)' }}>
              New or returning — same flow. No password needed.
            </p>

            {/* SSO buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => handleOAuth('google')}
                className="w-full py-3 text-sm font-mono border flex items-center justify-center gap-3 transition-colors hover:border-white"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuth('github')}
                className="w-full py-3 text-sm font-mono border flex items-center justify-center gap-3 transition-colors hover:border-white"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* Magic link */}
            <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm font-mono border bg-transparent outline-none focus:border-[var(--accent)] transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
              />

              {/* Referral code */}
              {showRefInput ? (
                <input
                  type="text"
                  placeholder="Referral code (e.g. REF-AB3F-9K2M)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 text-sm font-mono border bg-transparent outline-none focus:border-[var(--accent)] transition-colors"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--surface)' }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRefInput(true)}
                  className="text-xs font-mono text-left transition-colors"
                  style={{ color: 'var(--muted)' }}
                >
                  Have a referral code?
                </button>
              )}

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
              Free to start. No credit card required.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
