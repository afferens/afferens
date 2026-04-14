import Link from 'next/link'

const TIERS = [
  {
    name: 'Developer',
    price: '$0',
    period: '/month',
    tokens: '500,000 Sense Tokens',
    overage: '$1.00 per 1M additional tokens',
    features: [
      'All 6 sensory modalities',
      'REST API access',
      '/api/perception + /api/ingest',
      'Community support',
    ],
    cta: 'Start free',
    ctaHref: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$150',
    period: '/month',
    tokens: '50,000,000 Sense Tokens',
    overage: '$0.80 per 1M additional tokens',
    features: [
      'Everything in Developer',
      '100x token allowance',
      'Priority support',
      'Usage dashboard',
    ],
    cta: 'Upgrade to Pro',
    ctaHref: 'https://buy.stripe.com/YOUR_STRIPE_PAYMENT_LINK',
    highlight: true,
  },
  {
    name: 'Scale',
    price: '$2,500',
    period: '/month',
    tokens: '2,000,000,000 Sense Tokens',
    overage: '$0.50 per 1M additional tokens',
    features: [
      'Everything in Pro',
      'Dedicated infrastructure',
      'Custom modality ingestion',
      'SLA + dedicated support',
    ],
    cta: 'Contact us',
    ctaHref: 'mailto:hello@afferens.dev',
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

        <div className="mb-12">
          <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>afferens / pricing</div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Pricing
          </h1>
          <p className="text-sm font-mono" style={{ color: 'var(--muted)' }}>
            Pay for what your agents sense. Billed in Sense Tokens — one standardized unit of real-world perception.
          </p>
        </div>

        {/* Tier grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TIERS.map(tier => (
            <div
              key={tier.name}
              className="border p-6 flex flex-col"
              style={{
                borderColor: tier.highlight ? 'var(--accent)' : 'var(--border)',
                background: tier.highlight ? 'var(--surface)' : 'transparent',
              }}
            >
              {tier.highlight && (
                <div className="text-xs font-mono font-bold mb-3 uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                  Most popular
                </div>
              )}
              <div className="text-sm font-mono font-bold mb-1" style={{ color: 'var(--muted)' }}>
                {tier.name}
              </div>
              <div className="text-4xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                {tier.price}
                <span className="text-sm font-normal font-mono" style={{ color: 'var(--muted)' }}>{tier.period}</span>
              </div>
              <div className="text-xs font-mono mb-1" style={{ color: 'var(--accent)' }}>
                {tier.tokens}
              </div>
              <div className="text-xs font-mono mb-6" style={{ color: 'var(--muted)' }}>
                then {tier.overage}
              </div>
              <ul className="flex flex-col gap-2 mb-8 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="text-xs font-mono flex items-start gap-2" style={{ color: 'var(--foreground)' }}>
                    <span style={{ color: 'var(--accent)' }}>+</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={tier.ctaHref}
                className="block text-center py-3 text-sm font-bold font-mono"
                style={{
                  background: tier.highlight ? 'var(--accent)' : 'transparent',
                  color: tier.highlight ? '#000' : 'var(--foreground)',
                  border: tier.highlight ? 'none' : '1px solid var(--border)',
                }}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Token cost table */}
        <div className="border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-mono mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Sense Token costs per modality
          </div>
          <div className="grid grid-cols-2 gap-y-3">
            {[
              { modality: 'VISION', cost: 14 },
              { modality: 'MOLECULAR', cost: 18 },
              { modality: 'SPATIAL', cost: 10 },
              { modality: 'ACOUSTIC', cost: 8 },
              { modality: 'ENVIRONMENTAL', cost: 6 },
              { modality: 'INTEROCEPTION', cost: 5 },
            ].map(({ modality, cost }) => (
              <div key={modality} className="flex items-center justify-between pr-8">
                <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{modality}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{cost} tokens / call</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
