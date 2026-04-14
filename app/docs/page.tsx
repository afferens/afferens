import Link from 'next/link'

export default function DocsPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
          afferens
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-medium border"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
        >
          Get API Key
        </Link>
      </nav>

      <div className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>API Reference</h1>
        <p className="text-sm mb-12" style={{ color: 'var(--muted)' }}>
          Base URL: <code className="font-mono" style={{ color: 'var(--accent)' }}>https://afferens.vercel.app</code>
        </p>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Authentication</h2>
          <div className="border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Every request requires your API key in the <code className="font-mono" style={{ color: 'var(--foreground)' }}>X-API-KEY</code> header.
              Get your key from the <Link href="/signup" style={{ color: 'var(--accent)' }}>dashboard</Link>.
            </p>
            <pre className="text-xs font-mono" style={{ color: '#aaa' }}>
{`X-API-KEY: AFF-77-YOURNAME`}
            </pre>
          </div>
        </section>

        {/* Perception endpoint */}
        <section className="mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Endpoints</h2>

          <div className="border mb-4" style={{ borderColor: 'var(--border)' }}>
            {/* Endpoint header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <span className="text-xs font-mono px-2 py-0.5" style={{ background: '#003322', color: 'var(--accent)' }}>GET</span>
              <code className="text-sm font-mono" style={{ color: 'var(--foreground)' }}>/api/perception</code>
            </div>

            <div className="p-5">
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                Returns structured sensory perception data. Each call consumes Sense Tokens based on the modality.
              </p>

              {/* Parameters */}
              <div className="mb-6">
                <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Query Parameters</div>
                <div className="border" style={{ borderColor: 'var(--border)' }}>
                  {[
                    { param: 'modality', type: 'string', required: false, desc: 'VISION · SPATIAL · ACOUSTIC · ENVIRONMENTAL · MOLECULAR · INTEROCEPTION. Omit for all.' },
                    { param: 'limit', type: 'integer', required: false, desc: 'Number of events to return. Max 10. Default 1.' },
                  ].map((p, i) => (
                    <div key={p.param} className={`flex gap-4 p-4 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: 'var(--border)' }}>
                      <div className="w-32 shrink-0">
                        <code className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{p.param}</code>
                        <div className="text-xs mt-1 font-mono" style={{ color: 'var(--muted)' }}>{p.type}</div>
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token costs */}
              <div className="mb-6">
                <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Sense Token Cost per Call</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { m: 'VISION', t: 14 },
                    { m: 'SPATIAL', t: 10 },
                    { m: 'ACOUSTIC', t: 8 },
                    { m: 'ENVIRONMENTAL', t: 6 },
                    { m: 'MOLECULAR', t: 18 },
                    { m: 'INTEROCEPTION', t: 5 },
                  ].map(({ m, t }) => (
                    <div key={m} className="flex justify-between items-center px-3 py-2 border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{m}</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example response */}
              <div>
                <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Response</div>
                <pre className="text-xs font-mono overflow-x-auto p-4 border" style={{ borderColor: 'var(--border)', background: '#0a0a0a', color: '#aaa' }}>
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
            </div>
          </div>
        </section>

        {/* Code examples */}
        <section className="mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Code Examples</h2>

          {/* curl */}
          <div className="border mb-4" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-3 border-b text-xs font-mono" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--muted)' }}>
              curl
            </div>
            <pre className="p-5 text-xs font-mono overflow-x-auto" style={{ background: '#0a0a0a', color: '#aaa' }}>
{`curl https://afferens.vercel.app/api/perception \\
  -H "X-API-KEY: YOUR_KEY" \\
  -G \\
  -d "modality=vision" \\
  -d "limit=1"`}
            </pre>
          </div>

          {/* Python */}
          <div className="border" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-3 border-b text-xs font-mono" style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--muted)' }}>
              python
            </div>
            <pre className="p-5 text-xs font-mono overflow-x-auto" style={{ background: '#0a0a0a', color: '#aaa' }}>
{`import requests

response = requests.get(
    "https://afferens.vercel.app/api/perception",
    headers={"X-API-KEY": "YOUR_KEY"},
    params={"modality": "vision", "limit": 1}
)

data = response.json()
print(data)`}
            </pre>
          </div>
        </section>

        {/* Error codes */}
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Error Codes</h2>
          <div className="border" style={{ borderColor: 'var(--border)' }}>
            {[
              { code: '401', msg: 'Missing or invalid API key' },
              { code: '403', msg: 'API key is inactive' },
              { code: '404', msg: 'No data found for the requested modality' },
            ].map((e, i) => (
              <div key={e.code} className={`flex gap-4 p-4 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: 'var(--border)' }}>
                <code className="text-xs font-mono w-10 shrink-0" style={{ color: '#ff4444' }}>{e.code}</code>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{e.msg}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
