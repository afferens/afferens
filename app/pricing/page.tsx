'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const PACKS = [
  {
    name: 'Spark',
    pack: 'spark',
    price: '$9',
    tokens: '50,000',
    callsEst: '~5,000',
    description: 'Hit the wall. Like what you see. Buy more.',
    highlight: false,
  },
  {
    name: 'Builder',
    pack: 'builder',
    price: '$29',
    tokens: '200,000',
    callsEst: '~20,000',
    description: 'Enough to build and ship a real integration.',
    highlight: true,
  },
  {
    name: 'Studio',
    pack: 'studio',
    price: '$99',
    tokens: '1,000,000',
    callsEst: '~100,000',
    description: 'For agents running in production.',
    highlight: false,
  },
  {
    name: 'Scale',
    pack: 'scale',
    price: '$299',
    tokens: '4,000,000',
    callsEst: '~400,000',
    description: 'High-volume. Best per-token rate.',
    highlight: false,
  },
]

const TOKENS_PER_DOLLAR = 50_000 / 9

function calcTokens(dollars: number): number {
  return Math.floor(dollars * TOKENS_PER_DOLLAR)
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [customError, setCustomError] = useState('')

  async function handleBuy(pack: string, amount?: number) {
    setLoading(pack)
    try {
      const res = await fetch('/api/checkout/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack, amount }),
      })

      if (res.status === 401) {
        router.push('/signup')
        return
      }

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(null)
    }
  }

  function handleCustomBuy() {
    const val = parseFloat(customAmount)
    if (!val || val < 10) {
      setCustomError('Minimum $10')
      return
    }
    setCustomError('')
    handleBuy('custom', val)
  }

  const customDollars = parseFloat(customAmount) || 0
  const customTokens = customDollars >= 10 ? calcTokens(customDollars) : 0

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      <Nav />

      <div className="flex-1 px-8 py-16 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="mb-4">
          <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>afferens / pricing</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Sense Tokens
          </h1>
          <p className="text-base max-w-xl" style={{ color: 'var(--muted)' }}>
            No subscriptions. No monthly commitments. Buy tokens when you need them — they never expire.
          </p>
        </div>

        {/* Free tier callout */}
        <div className="border px-5 py-4 mb-12 flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div>
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>FREE TO START</span>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--muted)' }}>
              Every new account gets 10,000 Sense Tokens free. No card required.
            </p>
          </div>
          <a
            href="/signup"
            className="text-xs font-mono font-bold px-4 py-2 flex-shrink-0"
            style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
          >
            Sign In Free
          </a>
        </div>

        {/* Credit pack grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {PACKS.map(pack => (
            <div
              key={pack.name}
              className="border p-6 flex flex-col card-hover"
              style={{
                borderColor: pack.highlight ? 'var(--accent)' : 'var(--border)',
                background: 'var(--surface)',
              }}
            >
              {pack.highlight && (
                <div className="text-xs font-mono font-bold mb-3 uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                  Most popular
                </div>
              )}
              <div className="text-sm font-mono font-bold mb-3" style={{ color: 'var(--muted)' }}>
                {pack.name}
              </div>
              <div className="text-4xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                {pack.price}
              </div>
              <div className="text-sm font-mono font-bold mb-1" style={{ color: 'var(--accent)' }}>
                {pack.tokens} tokens
              </div>
              <div className="text-xs font-mono mb-4" style={{ color: 'var(--muted)' }}>
                {pack.callsEst} avg API calls
              </div>
              <p className="text-sm mb-6 flex-1" style={{ color: 'var(--muted)' }}>
                {pack.description}
              </p>
              <button
                onClick={() => handleBuy(pack.pack)}
                disabled={loading !== null}
                className="block w-full text-center py-3 text-sm font-bold font-mono"
                style={{
                  background: pack.highlight ? 'var(--accent)' : 'transparent',
                  color: pack.highlight ? '#000' : 'var(--foreground)',
                  border: pack.highlight ? 'none' : '1px solid var(--border)',
                  opacity: loading !== null ? 0.6 : 1,
                  cursor: loading !== null ? 'not-allowed' : 'pointer',
                }}
              >
                {loading === pack.pack ? 'Loading…' : `Buy ${pack.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Custom topup */}
        <div className="border p-6 mb-16" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-mono font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Custom Amount
          </div>
          <p className="text-xs font-mono mb-4" style={{ color: 'var(--muted)' }}>
            Top up any amount — min $10, no maximum. Tokens never expire.
          </p>
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <div className="flex items-center border" style={{ borderColor: customError ? '#ff4444' : 'var(--border)' }}>
                <span className="px-3 text-sm font-mono" style={{ color: 'var(--muted)', borderRight: '1px solid var(--border)' }}>$</span>
                <input
                  type="number"
                  min="10"
                  step="1"
                  placeholder="10"
                  value={customAmount}
                  onChange={e => { setCustomAmount(e.target.value); setCustomError('') }}
                  className="px-3 py-2 text-sm font-mono bg-transparent outline-none w-28"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
              {customError && (
                <span className="text-xs font-mono" style={{ color: '#ff4444' }}>{customError}</span>
              )}
            </div>
            {customTokens > 0 && (
              <div className="flex items-center py-2">
                <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>
                  = {customTokens.toLocaleString()} tokens
                </span>
              </div>
            )}
            <button
              onClick={handleCustomBuy}
              disabled={loading !== null}
              className="px-6 py-2 text-sm font-bold font-mono"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                background: 'transparent',
                opacity: loading !== null ? 0.6 : 1,
                cursor: loading !== null ? 'not-allowed' : 'pointer',
              }}
            >
              {loading === 'custom' ? 'Loading…' : 'Buy Custom'}
            </button>
          </div>
          <p className="text-xs font-mono mt-3" style={{ color: 'var(--muted)' }}>
            A small processing fee is added at checkout.
          </p>
        </div>

        {/* Per-token rate table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          <div className="border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="text-xs font-mono mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Cost per 1,000 tokens
            </div>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Spark', price: '$9', per1k: '$0.180' },
                { name: 'Builder', price: '$29', per1k: '$0.145' },
                { name: 'Studio', price: '$99', per1k: '$0.099' },
                { name: 'Scale', price: '$299', per1k: '$0.075' },
              ].map(r => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{r.name}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{r.per1k} / 1k tokens</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono mt-4" style={{ color: 'var(--muted)' }}>
              Tokens never expire. Stack packs as needed.
            </p>
          </div>

          <div className="border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <div className="text-xs font-mono mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
              Tokens per API call
            </div>
            <div className="flex flex-col gap-3">
              {[
                { modality: 'MOLECULAR', cost: 18 },
                { modality: 'VISION', cost: 14 },
                { modality: 'SPATIAL', cost: 10 },
                { modality: 'ACOUSTIC', cost: 8 },
                { modality: 'ENVIRONMENTAL', cost: 6 },
                { modality: 'INTEROCEPTION', cost: 5 },
              ].map(({ modality, cost }) => (
                <div key={modality} className="flex items-center justify-between">
                  <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{modality}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{cost} tokens / call</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Enterprise */}
        <div className="border p-6 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="text-sm font-mono font-bold mb-1" style={{ color: 'var(--foreground)' }}>Need more?</div>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              Volume deals, dedicated infrastructure, custom modality ingestion, and SLA — contact us.
            </p>
          </div>
          <a
            href="mailto:hello@afferens.dev"
            className="text-xs font-mono font-bold px-4 py-2 flex-shrink-0 ml-6"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            Contact us
          </a>
        </div>

      </div>
      <Footer />
    </main>
  )
}
