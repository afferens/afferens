'use client'

import { useState } from 'react'

type Props = {
  enabled: boolean
  pack: string
  threshold: number
}

const PACKS = [
  { id: 'spark',   label: 'Spark',   price: '$9',   tokens: '50k' },
  { id: 'builder', label: 'Builder', price: '$29',  tokens: '200k' },
  { id: 'studio',  label: 'Studio',  price: '$99',  tokens: '1M' },
  { id: 'scale',   label: 'Scale',   price: '$299', tokens: '4M' },
]

export default function AutoTopup({ enabled, pack, threshold }: Props) {
  const [selectedPack, setSelectedPack] = useState(pack)
  const [selectedThreshold, setSelectedThreshold] = useState(threshold)
  const [loading, setLoading] = useState(false)

  async function handleEnable() {
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack: selectedPack, threshold: selectedThreshold }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <div className="border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Auto Top-up
        </div>
        {enabled && (
          <span className="text-xs font-mono px-2 py-0.5" style={{ background: '#003322', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
            ACTIVE
          </span>
        )}
      </div>

      {enabled ? (
        <div>
          <p className="text-xs font-mono mb-1" style={{ color: 'var(--muted)' }}>
            Pack: <span style={{ color: 'var(--foreground)' }}>{PACKS.find(p => p.id === pack)?.label ?? pack}</span>
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            Triggers when tokens remaining drops below <span style={{ color: 'var(--foreground)' }}>{threshold.toLocaleString()}</span>
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-mono mb-5" style={{ color: 'var(--muted)' }}>
            Automatically charge your card when you run low. Never interrupt your agent.
          </p>

          {/* Pack selector */}
          <div className="mb-4">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>Top-up pack</div>
            <div className="grid grid-cols-2 gap-2">
              {PACKS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPack(p.id)}
                  className="flex items-center justify-between px-3 py-2 border text-left"
                  style={{
                    borderColor: selectedPack === p.id ? 'var(--accent)' : 'var(--border)',
                    background: selectedPack === p.id ? '#003322' : 'transparent',
                  }}
                >
                  <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{p.label}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{p.price} · {p.tokens}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Threshold selector */}
          <div className="mb-5">
            <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>
              Trigger when tokens remaining drops below
            </div>
            <select
              value={selectedThreshold}
              onChange={e => setSelectedThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono border bg-transparent outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
            >
              <option value={500}>500 tokens</option>
              <option value={1000}>1,000 tokens</option>
              <option value={2000}>2,000 tokens</option>
              <option value={5000}>5,000 tokens</option>
            </select>
          </div>

          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full py-3 text-sm font-bold font-mono disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {loading ? 'Redirecting...' : 'Enable Auto Top-up'}
          </button>
        </div>
      )}
    </div>
  )
}
