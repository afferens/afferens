'use client'

import { useState } from 'react'
import CopyButton from './CopyButton'

interface Props {
  referralCode: string
  referralCount: number
  referredBy: string | null
  referralRedeemed: boolean
}

export default function ReferralCard({ referralCode, referralCount, referredBy, referralRedeemed }: Props) {
  const [applyCode, setApplyCode] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setApplying(true)
    setApplyError('')

    const res = await fetch('/api/referral/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: applyCode }),
    })

    const data = await res.json()
    if (res.ok) {
      setApplySuccess(true)
    } else {
      setApplyError(data.error ?? 'Something went wrong')
    }
    setApplying(false)
  }

  const tokensEarned = referralCount * 10_000

  return (
    <div className="border p-6 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="text-xs font-mono mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        Referrals
      </div>

      {/* Your referral code */}
      <div className="mb-4">
        <p className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>Your referral code</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm font-mono py-2 px-3 border" style={{ borderColor: 'var(--border)', color: 'var(--accent)', background: '#0a0a0a' }}>
            {referralCode}
          </code>
          <CopyButton value={referralCode} />
        </div>
        <p className="text-xs font-mono mt-2" style={{ color: 'var(--muted)' }}>
          Share your link:{' '}
          <span style={{ color: 'var(--foreground)' }}>
            afferens.vercel.app/signup?ref={referralCode}
          </span>
        </p>
      </div>

      {/* Stats */}
      {referralCount > 0 && (
        <div className="flex gap-6 mb-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>{referralCount}</div>
            <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>referrals</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>{tokensEarned.toLocaleString()}</div>
            <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>bonus tokens earned</div>
          </div>
        </div>
      )}

      {/* Referred-by status */}
      {referredBy && (
        <div className="pt-4 border-t text-xs font-mono" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          {referralRedeemed
            ? '✓ Referral bonus claimed'
            : 'Referral code applied — 10,000 bonus tokens unlock on your first purchase'}
        </div>
      )}

      {/* Apply admin code post-signup */}
      {!referredBy && !applySuccess && (
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {showApplyForm ? (
            <form onSubmit={handleApply} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter referral code"
                value={applyCode}
                onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm font-mono border bg-transparent outline-none focus:border-[var(--accent)] transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: '#0a0a0a' }}
              />
              {applyError && (
                <p className="text-xs font-mono" style={{ color: '#ff4444' }}>{applyError}</p>
              )}
              <button
                type="submit"
                disabled={applying || !applyCode}
                className="text-xs font-mono py-2 px-4 border transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'transparent' }}
              >
                {applying ? 'Applying...' : 'Apply code'}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowApplyForm(true)}
              className="text-xs font-mono transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              Have a referral code?
            </button>
          )}
        </div>
      )}

      {applySuccess && (
        <div className="pt-4 border-t text-xs font-mono" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>
          ✓ Code applied — 10,000 bonus tokens unlock on your first purchase
        </div>
      )}
    </div>
  )
}
