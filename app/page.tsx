import Link from 'next/link'
import Image from 'next/image'

const SENSES = [
  {
    name: 'VISION',
    tokens: 14,
    desc: 'Object detection, classification, bounding boxes, scene context',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    name: 'SPATIAL',
    tokens: 10,
    desc: 'GPS position, heading, velocity, altitude, motion vectors',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    name: 'ACOUSTIC',
    tokens: 8,
    desc: 'Sound event detection, dB levels, frequency, source direction',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    name: 'ENVIRONMENTAL',
    tokens: 6,
    desc: 'Temperature, humidity, pressure, wind speed, sea state',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
      </svg>
    ),
  },
  {
    name: 'MOLECULAR',
    tokens: 18,
    desc: 'CO₂, VOC, particulate matter, gas composition, air quality index',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/>
        <circle cx="5" cy="7" r="2"/>
        <circle cx="19" cy="7" r="2"/>
        <circle cx="5" cy="17" r="2"/>
        <circle cx="19" cy="17" r="2"/>
        <path d="M7 7.5l3.5 3M13.5 13.5L17 17M7 16.5l3.5-3M13.5 10.5L17 7"/>
      </svg>
    ),
  },
  {
    name: 'INTEROCEPTION',
    tokens: 5,
    desc: 'Node health, CPU/memory, battery, uptime, sensor diagnostics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b sticky top-0 z-40 backdrop-blur-sm" style={{ borderColor: 'var(--border)', background: 'rgba(8,8,8,0.85)' }}>
        <Link href="/">
          <Image src="/afferens-logo.png" alt="Afferens" height={26} width={130} style={{ objectFit: 'contain' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium border transition-all hover:border-white"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-8 py-28 text-center overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,255,136,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto w-full">
          <div className="text-xs font-mono mb-6 px-3 py-1 border inline-flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--accent)' }} />
            v1.0.0 — early access
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]" style={{ color: 'var(--foreground)' }}>
            Your agent is guessing.
            <br />
            <span style={{ color: 'var(--accent)' }}>Give it senses.</span>
          </h1>

          <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
            Afferens returns live real-world data — position, motion, camera, environment, audio — as structured JSON, ready to inject into any LLM context window. One API key. Zero sensor pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: 'var(--accent)', color: '#000', boxShadow: '0 0 0 0 rgba(0,255,136,0)' }}
            >
              Get your free API key
            </Link>
            <Link
              href="/docs"
              className="px-8 py-3 font-medium text-sm border transition-all hover:border-white"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Read the docs →
            </Link>
          </div>
        </div>
      </section>

      {/* Try it now */}
      <section className="px-8 pb-24 max-w-4xl mx-auto w-full">
        <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Try it right now — no signup required
        </div>
        <div className="border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--accent)' }}></span>
            <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>terminal</span>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ color: 'var(--accent)' }}>
{`curl "https://afferens.com/api/demo?modality=VISION"`}
          </pre>
          <div className="border-t px-4 py-2 flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
            <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>response</span>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ color: '#888', lineHeight: '1.6' }}>
{`{
  "status": 200,
  "data": [{
    "modality": "VISION",
    "classification": "forklift",
    "confidence": 0.9341,
    "data": {
      "objects": [
        { "label": "forklift", "confidence": 0.934 },
        { "label": "person",   "confidence": 0.871 }
      ],
      "object_count": 2
    },
    "sense_tokens_consumed": 14
  }],
  "tokens_remaining": 9986
}`}
          </pre>
        </div>
        <p className="text-xs font-mono mt-3" style={{ color: 'var(--muted)' }}>
          Also try:{' '}
          {['SPATIAL', 'ACOUSTIC', 'ENVIRONMENTAL', 'MOLECULAR', 'INTEROCEPTION'].map((m, i) => (
            <span key={m}>
              <span style={{ color: 'var(--accent)' }}>{m}</span>
              {i < 4 ? <span style={{ color: 'var(--muted-2)' }}> · </span> : null}
            </span>
          ))}
        </p>
      </section>

      {/* The 6 Senses */}
      <section className="px-8 pb-24 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Six sensory modalities
          </h2>
          <span className="text-xs font-mono" style={{ color: 'var(--muted-2)' }}>tokens / call</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SENSES.map((sense) => (
            <div
              key={sense.name}
              className="p-5 border card-hover"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span style={{ color: 'var(--accent)' }}>{sense.icon}</span>
                  <span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                    {sense.name}
                  </span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'var(--muted-2)' }}>
                  {sense.tokens}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted)', lineHeight: '1.5' }}>
                {sense.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-8 pb-24 max-w-4xl mx-auto w-full">
        <div className="border p-10 text-center" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            Ready to ground your agent?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Free to start. 10,000 Sense Tokens on signup. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Get your API key
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          © 2026 Afferens / Wild Rice
        </span>
        <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
        </div>
      </footer>
    </main>
  )
}
