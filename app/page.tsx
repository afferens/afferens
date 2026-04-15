import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/">
          <Image src="/afferens-logo.png" alt="Afferens" height={28} width={140} style={{ objectFit: 'contain' }} />
        </Link>
        <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center max-w-4xl mx-auto w-full">

        <div className="text-xs font-mono mb-6 px-3 py-1 border inline-block" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          v1.0.0 — now in early access
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
          Your AI agent is blind.<br />
          <span style={{ color: 'var(--accent)' }}>Afferens gives it senses.</span>
        </h1>

        <p className="text-lg mb-4 max-w-2xl" style={{ color: 'var(--muted)' }}>
          Afferens is the Universal Sensory Layer for AI agents. One API that gives your agent real-time vision, spatial awareness, sound, environmental data, chemical detection, and self-diagnostics — from any hardware.
        </p>

        <p className="text-sm mb-12 font-mono" style={{ color: '#444' }}>
          No bespoke sensor stacks. No hallucinated state. Just structured perception data your agent can act on.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 font-bold text-sm transition-all"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Get started — free
          </Link>
          <Link
            href="/docs"
            className="px-8 py-3 font-bold text-sm border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Read the docs
          </Link>
        </div>
      </section>

      {/* Live API Preview */}
      <section className="px-8 pb-24 max-w-4xl mx-auto w-full">
        <div className="border rounded" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--accent)' }}></span>
            <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              GET /api/perception?modality=vision&amp;limit=1
            </span>
          </div>
          <pre className="p-4 text-xs font-mono overflow-x-auto" style={{ color: '#aaa' }}>
{`{
  "status": 200,
  "data": [{
    "timestamp": "2026-04-14T12:00:00.000Z",
    "entity_id": "ENT-0x1A3F",
    "type": "VISION",
    "modality": "VISION",
    "classification": "vessel",
    "confidence": 0.9124,
    "spatial_coords": { "x": 26.07, "y": -90.72, "z": 58.31 },
    "sense_tokens_consumed": 14
  }],
  "count": 1,
  "api_version": "v1.0.0"
}`}
          </pre>
        </div>
      </section>

      {/* The 6 Senses */}
      <section className="px-8 pb-24 max-w-4xl mx-auto w-full">
        <h2 className="text-xs font-mono mb-8 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Six sensory modalities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'VISION', desc: 'Object detection, tracking, scene context' },
            { name: 'SPATIAL', desc: 'Position, heading, velocity of all entities' },
            { name: 'ACOUSTIC', desc: 'Sound events, signal localization' },
            { name: 'ENVIRONMENTAL', desc: 'Wind, temperature, pressure, sea state' },
            { name: 'MOLECULAR', desc: 'Gas detection, chemical composition' },
            { name: 'INTEROCEPTION', desc: 'Node health, sensor self-diagnostics' },
          ].map((sense) => (
            <div
              key={sense.name}
              className="p-4 border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="text-xs font-mono mb-2" style={{ color: 'var(--accent)' }}>
                {sense.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {sense.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          afferens — the afferent layer for AI agents
        </span>
      </footer>
    </main>
  )
}
