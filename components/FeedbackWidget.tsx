'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_TEXT = 500

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const overLimit = message.length > MAX_TEXT

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || overLimit) return
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

  function handleClose() {
    setOpen(false)
    setMessage('')
    setFiles([])
    setError('')
    setSubmitted(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-2 text-xs font-mono font-bold shadow-lg transition-all hover:scale-105"
        style={{ background: 'var(--accent)', color: '#000', borderRadius: 0 }}
        aria-label="Give feedback"
      >
        feedback
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-6"
          onClick={handleClose}
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          {/* Panel */}
          <div
            className="w-full max-w-sm flex flex-col border"
            style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Give feedback</span>
              <button onClick={handleClose} className="text-xs font-mono" style={{ color: 'var(--muted)' }}>✕</button>
            </div>

            <div className="px-5 py-5">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="text-xs font-mono mb-2 px-3 py-1 border inline-block" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                    received
                  </div>
                  <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>Thanks. We read everything.</p>
                  <button onClick={handleClose} className="mt-5 text-xs font-mono" style={{ color: 'var(--accent)' }}>
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  <div className="flex flex-col gap-1">
                    <textarea
                      required
                      rows={5}
                      placeholder="Bug, feature request, anything..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border bg-transparent outline-none resize-none focus:border-[var(--accent)] transition-colors"
                      style={{
                        borderColor: overLimit ? '#ff4444' : 'var(--border)',
                        color: 'var(--foreground)',
                        background: 'var(--surface)',
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-mono"
                        style={{ color: overLimit ? '#ff4444' : 'var(--muted)' }}
                      >
                        {message.length}/{MAX_TEXT}
                      </span>
                      {overLimit && (
                        <span className="text-xs font-mono" style={{ color: '#ff8800' }}>
                          Too long — upload a doc instead
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {files.length > 0 && (
                      <div className="flex flex-col gap-1 mb-2">
                        {files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-1.5 border text-xs font-mono" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                            <span className="truncate mr-3" style={{ color: 'var(--foreground)' }}>{file.name}</span>
                            <button type="button" onClick={() => removeFile(i)} style={{ color: 'var(--muted)' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {files.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-mono border px-3 py-1.5 transition-colors hover:border-white"
                        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                      >
                        + Attach {files.length > 0 ? `(${files.length}/5)` : 'image, video, or doc'}
                      </button>
                    )}
                  </div>

                  {error && (
                    <p className="text-xs font-mono" style={{ color: '#ff4444' }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !message.trim() || overLimit}
                    className="w-full py-2.5 text-xs font-bold transition-opacity disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: '#000' }}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
