import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'wildricemedia@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  const admin = createAdminClient()

  // Fetch all users
  const { data: { users } } = await admin.auth.admin.listUsers()

  // Fetch all api_keys
  const { data: keys } = await admin
    .from('api_keys')
    .select('user_id, key, tokens_consumed, is_active, auto_topup_enabled, created_at')
    .order('tokens_consumed', { ascending: false })

  // Fetch command count
  const { count: commandCount } = await admin
    .from('commands')
    .select('*', { count: 'exact', head: true })

  // Fetch perception event count
  const { count: perceptionCount } = await admin
    .from('perception_events')
    .select('*', { count: 'exact', head: true })

  const totalTokens = keys?.reduce((sum, k) => sum + k.tokens_consumed, 0) ?? 0
  const activeKeys = keys?.filter(k => k.is_active).length ?? 0

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/">
          <Image src="/afferens-logo.png" alt="Afferens" height={28} width={140} style={{ objectFit: 'contain' }} />
        </Link>
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>admin</span>
      </nav>

      <div className="flex-1 px-8 py-12 max-w-5xl mx-auto w-full">

        <h1 className="text-2xl font-bold mb-10" style={{ color: 'var(--foreground)' }}>Analytics</h1>

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total users', value: users.length },
            { label: 'Active API keys', value: activeKeys },
            { label: 'Tokens consumed', value: totalTokens.toLocaleString() },
            { label: 'Commands issued', value: commandCount ?? 0 },
          ].map(stat => (
            <div key={stat.label} className="border p-5" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="text-xs font-mono mb-2 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                {stat.label}
              </div>
              <div className="text-3xl font-bold font-mono" style={{ color: 'var(--accent)' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Per-user table */}
        <div>
          <div className="text-xs font-mono mb-4 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Users
          </div>
          <div className="border" style={{ borderColor: 'var(--border)' }}>
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b text-xs font-mono uppercase tracking-widest" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}>
              <span className="col-span-2">Email</span>
              <span>Tokens used</span>
              <span>Auto top-up</span>
              <span>Joined</span>
            </div>

            {keys?.map((k, i) => {
              const u = users.find(u => u.id === k.user_id)
              const pct = Math.min(100, Math.round((k.tokens_consumed / 10_000) * 100))
              return (
                <div
                  key={k.key}
                  className={`grid grid-cols-5 gap-4 px-4 py-4 ${i > 0 ? 'border-t' : ''}`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="col-span-2 text-xs font-mono truncate" style={{ color: 'var(--foreground)' }}>
                    {u?.email ?? '—'}
                  </span>
                  <div>
                    <span className="text-xs font-mono" style={{ color: k.tokens_consumed > 8000 ? '#ff4444' : 'var(--accent)' }}>
                      {k.tokens_consumed.toLocaleString()}
                    </span>
                    <div className="w-full h-1 mt-1 rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? '#ff4444' : 'var(--accent)' }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: k.auto_topup_enabled ? 'var(--accent)' : 'var(--muted)' }}>
                    {k.auto_topup_enabled ? 'on' : 'off'}
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    {new Date(k.created_at).toLocaleDateString()}
                  </span>
                </div>
              )
            })}

            {(!keys || keys.length === 0) && (
              <div className="px-4 py-8 text-center text-xs font-mono" style={{ color: 'var(--muted)' }}>
                No users yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
