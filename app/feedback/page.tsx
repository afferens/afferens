'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const formData = new FormData()
    formData.append('message', message)
    if (user?.email) formData.append('email', user.email)
    if (user?.id) formData.append('user_id', user.id)
    for (const file of files) formData.append('files', file)

    const res = await fetch('/api/feedback', { method: 'POST', body: formData })
    const result = await res.json()

    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error ?? 'Something went wrong. Try again.')
    }
    setLoading(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(prev => [...prev, ...selected].slice(0, 5))
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/">
          <Image src="/afferens-logo.png" alt="Afferens" height={28} width={140} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/dashboard" className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          Dashboard
        </Link>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-lg">

          {submitted ? (
            <div className="text-center">
              <div className="text-xs font-mono mb-4 px-3 py-1 border inline-block" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                received
              </div>
              <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>
                Thanks. We read everything.
              </p>
              <Link href="/dashboard" className="inline-block mt-8 text-xs font-mono" style={{ color: 'var(--accent)' }}>
                ← Back to dashboard
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Give feedback
              </h1>
              <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
                Bug, feature request, or anything else. Attach screenshots or docs if useful.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                <textarea
                  required
                  rows={6}
                  placeholder="What's on your mind?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-mono border bg-transparent outline-none resize-none focus:border-[var(--accent)] transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
                />

                {/* File attachments */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {files.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 border text-xs font-mono" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                          <span style={{ color: 'var(--foreground)' }} className="truncate mr-4">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="flex-shrink-0"
                            style={{ color: 'var(--muted)' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-mono border px-3 py-2 transition-colors hover:border-white"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                    >
                      + Attach file {files.length > 0 ? `(${files.length}/5)` : ''}
                    </button>
                  )}
                </div>

                {error && (
                  <p className="text-xs font-mono" style={{ color: '#ff4444' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full py-3 text-sm font-bold transition-opacity disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: '#000' }}
                >
                  {loading ? 'Sending...' : 'Send feedback'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
