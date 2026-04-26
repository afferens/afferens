import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function LegalPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      <Nav />

      <div className="flex-1 px-8 py-12 max-w-3xl mx-auto w-full">

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Privacy Policy & Terms</h1>
        <p className="text-xs font-mono mb-12" style={{ color: 'var(--muted)' }}>Last updated: April 15, 2026 · Afferens / Wild Rice</p>

        {/* Privacy Policy */}
        <section className="mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: 'var(--muted)' }}>Privacy Policy</h2>

          <div className="flex flex-col gap-6 text-sm" style={{ color: 'var(--muted)' }}>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>What we collect</div>
              <p>When you sign up, we collect your email address to create your account and API key. We store API usage data — which modalities you call, how many tokens you consume — to enforce limits and process billing. If you enable auto top-up, we store a Stripe customer ID and payment method reference (not your card number — that lives with Stripe).</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>What we don&apos;t collect</div>
              <p>We do not sell your data. We do not track you across other sites. We do not read the content of sensor data you push through the API — it is stored in your account&apos;s perception events and only accessible via your API key.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>How we use it</div>
              <p>Your email is used to send your magic link for login and, if applicable, payment receipts via Stripe. We do not send marketing emails unless you opt in.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>Third parties</div>
              <p>We use Supabase (database and auth), Stripe (payments), and Vercel (hosting). Each has their own privacy policy. We do not share your data with any other third parties.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>Data deletion</div>
              <p>To delete your account and all associated data, email <a href="mailto:hello@afferens.dev" style={{ color: 'var(--accent)' }}>hello@afferens.dev</a>. We will process deletion within 7 days.</p>
            </div>

          </div>
        </section>

        {/* Terms */}
        <section className="mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: 'var(--muted)' }}>Terms of Service</h2>

          <div className="flex flex-col gap-6 text-sm" style={{ color: 'var(--muted)' }}>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>The service</div>
              <p>Afferens provides an API for ingesting, storing, and retrieving structured sensory data for use in AI agent systems. The service is provided by Wild Rice, Malaysia.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>Acceptable use</div>
              <p>You may use Afferens for lawful purposes only. You may not use the API to store or transmit illegal content, attempt to reverse-engineer the service, or abuse the free tier through automated account creation.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>Credits and billing</div>
              <p>Sense Token credit packs are prepaid and non-refundable. Credits do not expire. We reserve the right to adjust pricing with 30 days notice. Auto top-up charges are triggered automatically when your token balance falls below your configured threshold — you can disable this at any time from your dashboard.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>Uptime and liability</div>
              <p>We aim for high availability but make no uptime guarantees during early access. Afferens is not liable for decisions made by AI agents acting on data returned by the API. You are responsible for validating sensor data before using it in safety-critical systems.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>Changes</div>
              <p>We may update these terms. Continued use of the API after changes constitutes acceptance. Material changes will be communicated via email.</p>
            </div>

            <div>
              <div className="font-mono mb-1" style={{ color: 'var(--foreground)' }}>Contact</div>
              <p>Questions: <a href="mailto:hello@afferens.dev" style={{ color: 'var(--accent)' }}>hello@afferens.dev</a></p>
            </div>

          </div>
        </section>

      </div>

      <Footer />
    </main>
  )
}
