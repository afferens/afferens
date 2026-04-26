import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="px-8 py-6 border-t flex items-center justify-between"
      style={{ borderColor: 'var(--border)' }}
    >
      <span className="text-sm" style={{ color: 'var(--muted)' }}>
        © 2026 Afferens / Wild Rice
      </span>
      <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--muted)' }}>
        <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
      </div>
    </footer>
  )
}
