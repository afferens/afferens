'use client'

const PACKS = [
  { id: 'spark',   label: 'Spark',   price: '$9',   tokens: '50,000',    href: 'https://buy.stripe.com/bJebJ13vk6MQapSfBe8N200' },
  { id: 'builder', label: 'Builder', price: '$29',  tokens: '200,000',   href: 'https://buy.stripe.com/4gM28r9TI5IM41u9cQ8N201', highlight: true },
  { id: 'studio',  label: 'Studio',  price: '$99',  tokens: '1,000,000', href: 'https://buy.stripe.com/eVq00j8PE8UYgOg60E8N202' },
  { id: 'scale',   label: 'Scale',   price: '$299', tokens: '4,000,000', href: 'https://buy.stripe.com/6oU9AT8PEdbe9lO88M8N203' },
]

export default function BuyTokens() {
  return (
    <div className="border p-6 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="text-xs font-mono mb-1 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        Buy Tokens
      </div>
      <p className="text-xs font-mono mb-5" style={{ color: 'var(--muted)' }}>
        One-time purchase. Tokens never expire. Stack packs as needed.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PACKS.map(pack => (
          <a
            key={pack.id}
            href={pack.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-3 border transition-colors"
            style={{
              borderColor: pack.highlight ? 'var(--accent)' : 'var(--border)',
              background: pack.highlight ? '#003322' : 'transparent',
              textDecoration: 'none',
            }}
          >
            <div>
              <div className="text-xs font-mono font-bold" style={{ color: 'var(--foreground)' }}>
                {pack.label}
              </div>
              <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                {pack.tokens} tokens
              </div>
            </div>
            <div className="text-sm font-bold font-mono" style={{ color: pack.highlight ? 'var(--accent)' : 'var(--foreground)' }}>
              {pack.price}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
