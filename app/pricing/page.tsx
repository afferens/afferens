import Link from 'next/link'

const PACKS = [
  {
    name: 'Spark',
    price: '$9',
    tokens: '50,000',
    tokensRaw: 50_000,
    callsEst: '~5,000',
    description: 'Hit the wall. Like what you see. Buy more.',
    ctaHref: 'https://buy.stripe.com/SPARK_LINK',
    highlight: false,
  },
  {
    name: 'Builder',
    price: '$29',
    tokens: '200,000',
    tokensRaw: 200_000,
    callsEst: '~20,000',
    description: 'Enough to build and ship a real integration.',
    ctaHref: 'https://buy.stripe.com/BUILDER_LINK',
    highlight: true,
  },
  {
    name: 'Studio',
    price: '$99',
    tokens: '1,000,000',
    tokensRaw: 1_000_000,
    callsEst: '~100,000',
    description: 'For agents running in production.',
    ctaHref: 'https://buy.stripe.com/STUDIO_LINK',
    highlight: false,
  },
  {
    name: 'Scale',
    price: '$299',
    tokens: '4,000,000',
    tokensRaw: 4_000_000,
    callsEst: '~400,000',
    description: 'High-volume. Best per-token rate.',
    ctaHref: 'https://buy.stripe.com/SCALE_LINK',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
          afferens
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-xs font-mono" style={{ color: 'var(--muted)' }}>Docs</Link>
          <Link href="/dashboard" className="text-xs font-mono" style={{ color: 'var(--muted)' }}>Dashboard</Link>
        </div>
      </nav>

      <div className="flex-1 px-8 py-16 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="mb-4">
          <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>afferens / pricing</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Sense Tokens
          </h1>
          <p className="text-sm font-mono max-w-xl" style={{ color: 'var(--muted)' }}>
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
          <Link
            href="/signup"
            className="text-xs font-mono font-bold px-4 py-2 flex-shrink-0"
            style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
          >
            Get API Key
          </Link>
        </div>

        {/* Credit pack grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PACKS.map(pack => (
            <div
              key={pack.name}
              className="border p-6 flex flex-col"
              style={{
                borderColor: pack.highlight ? 'var(--accent)' : 'var(--border)',
                background: pack.highlight ? 'var(--surface)' : 'transparent',
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
              <p className="text-xs font-mono mb-6 flex-1" style={{ color: 'var(--muted)' }}>
                {pack.description}
              </p>
              <a
                href={pack.ctaHref}
                className="block text-center py-3 text-sm font-bold font-mono"
                style={{
                  background: pack.highlight ? 'var(--accent)' : 'transparent',
                  color: pack.highlight ? '#000' : 'var(--foreground)',
                  border: pack.highlight ? 'none' : '1px solid var(--border)',
                }}
              >
                Buy {pack.name}
              </a>
            </div>
          ))}
        </div>

        {/* Per-token rate table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Value breakdown */}
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

          {/* Modality cost table */}
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
    </main>
  )
}
