import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CopyButton from './CopyButton'
import AutoTopup from './AutoTopup'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signup')
  }

  const admin = createAdminClient()
  const { data: keyRecord } = await admin
    .from('api_keys')
    .select('key, tokens_consumed, created_at, is_active, auto_topup_enabled, auto_topup_pack, auto_topup_threshold')
    .eq('user_id', user.id)
    .single()

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/">
          <Image src="/afferens-logo.png" alt="Afferens" height={28} width={140} style={{ objectFit: 'contain' }} />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {user.email}
          </span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">

        <h1 className="text-2xl font-bold mb-10" style={{ color: 'var(--foreground)' }}>
          Dashboard
        </h1>

        {/* API Key card */}
        <div className="border p-6 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Your API Key
          </div>

          {keyRecord ? (
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm font-mono py-2 px-3 border" style={{ borderColor: 'var(--border)', color: 'var(--accent)', background: '#0a0a0a' }}>
                {keyRecord.key}
              </code>
              <CopyButton value={keyRecord.key} />
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Generating your key...</p>
          )}

          <p className="text-xs font-mono mt-3" style={{ color: 'var(--muted)' }}>
            Pass this as the <code style={{ color: 'var(--foreground)' }}>X-API-KEY</code> header in every request.
          </p>
        </div>

        {/* Token usage */}
        {(() => {
          const FREE_TIER_LIMIT = 10_000
          const consumed = keyRecord?.tokens_consumed ?? 0
          const remaining = Math.max(0, FREE_TIER_LIMIT - consumed)
          const pct = Math.min(100, Math.round((consumed / FREE_TIER_LIMIT) * 100))
          const nearLimit = pct >= 80

          return (
            <div className="border p-6 mb-6" style={{ borderColor: nearLimit ? '#ff4444' : 'var(--border)', background: 'var(--surface)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Sense Tokens
                </div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  Free tier — 10,000 tokens
                </div>
              </div>
              <div className="text-4xl font-bold font-mono mb-2" style={{ color: nearLimit ? '#ff4444' : 'var(--accent)' }}>
                {consumed.toLocaleString()}
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'var(--border)' }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${pct}%`, background: nearLimit ? '#ff4444' : 'var(--accent)', transition: 'width 0.3s' }}
                />
              </div>
              <p className="text-xs font-mono" style={{ color: nearLimit ? '#ff4444' : 'var(--muted)' }}>
                {remaining.toLocaleString()} tokens remaining ({pct}% used)
              </p>
              {nearLimit && (
                <Link
                  href="/pricing"
                  className="inline-block mt-4 px-4 py-2 text-xs font-bold font-mono"
                  style={{ background: 'var(--accent)', color: '#000' }}
                >
                  Top up Sense Tokens
                </Link>
              )}
            </div>
          )
        })()}

        {/* Auto top-up */}
        <AutoTopup
          enabled={keyRecord?.auto_topup_enabled ?? false}
          pack={keyRecord?.auto_topup_pack ?? 'spark'}
          threshold={keyRecord?.auto_topup_threshold ?? 1000}
        />

        {/* Quick start */}
        <div className="border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-mono mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Quick start
          </div>
          <pre className="text-xs font-mono overflow-x-auto" style={{ color: '#aaa' }}>
{`curl https://afferens.vercel.app/api/perception \\
  -H "X-API-KEY: ${keyRecord?.key ?? 'YOUR_KEY'}" \\
  -G -d "modality=vision" -d "limit=1"`}
          </pre>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link href="/docs" className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
              Full API reference in docs
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
