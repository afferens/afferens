'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_TEXT = 500
const DRAFT_KEY = 'afferens_feedback_drafts'

type Draft = {
  id: string
  message: string
  savedAt: string
}

type Submitted = {
  id: string
  created_at: string
  message: string
  attachments: string[]
}

type Tab = 'new' | 'drafts' | 'submitted'

function getDrafts(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveDrafts(drafts: Draft[]) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
}

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('new')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [submittedList, setSubmittedList] = useState<Submitted[]>([])
  const [loadingSubmitted, setLoadingSubmitted] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const overLimit = message.length > MAX_TEXT

  // Load drafts from localStorage on open
  useEffect(() => {
    if (open) {
      setDrafts(getDrafts())
    }
  }, [open])

  // Auto-save draft as user types
  const autosaveDraft = useCallback((text: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (!text.trim()) return

    saveTimerRef.current = setTimeout(() => {
      const existing = getDrafts()
      const id = currentDraftId ?? `draft_${Date.now()}`
      if (!currentDraftId) setCurrentDraftId(id)

      const updated = [
        { id, message: text, savedAt: new Date().toLocaleTimeString() },
        ...existing.filter(d => d.id !== id),
      ].slice(0, 10)

      saveDrafts(updated)
      setDrafts(updated)
    }, 800)
  }, [currentDraftId])

  function handleMessageChange(text: string) {
    setMessage(text)
    autosaveDraft(text)
  }

  function loadDraft(draft: Draft) {
    setMessage(draft.message)
    setCurrentDraftId(draft.id)
    setTab('new')
    setSubmitted(false)
    setError('')
  }

  function deleteDraft(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const updated = getDrafts().filter(d => d.id !== id)
    saveDrafts(updated)
    setDrafts(updated)
    if (currentDraftId === id) setCurrentDraftId(null)
  }

  async function loadSubmitted() {
    setLoadingSubmitted(true)
    const res = await fetch('/api/feedback/mine')
    const result = await res.json()
    setSubmittedList(result.feedback ?? [])
    setLoadingSubmitted(false)
  }

  function handleTabChange(t: Tab) {
    setTab(t)
    if (t === 'submitted' && submittedList.length === 0) {
      loadSubmitted()
    }
  }

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
      // Remove draft on successful submit
      if (currentDraftId) {
        const updated = getDrafts().filter(d => d.id !== currentDraftId)
        saveDrafts(updated)
        setDrafts(updated)
        setCurrentDraftId(null)
      }
      setSubmitted(true)
      setSubmittedList([]) // force refresh next time submitted tab opens
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
    setCurrentDraftId(null)
    setTab('new')
  }

  function startNew() {
    setMessage('')
    setFiles([])
    setError('')
    setSubmitted(false)
    setCurrentDraftId(null)
    setTab('new')
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
        {drafts.length > 0 && (
          <span
            className="ml-2 px-1.5 py-0.5 text-xs"
            style={{ background: '#000', color: 'var(--accent)' }}
          >
            {drafts.length}
          </span>
        )}
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
            style={{ background: 'var(--background)', borderColor: 'var(--border)', maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Feedback</span>
              <button onClick={handleClose} className="text-xs font-mono" style={{ color: 'var(--muted)' }}>✕</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              {(['new', 'drafts', 'submitted'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className="flex-1 py-2.5 text-xs font-mono capitalize transition-colors"
                  style={{
                    color: tab === t ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                    background: 'transparent',
                  }}
                >
                  {t}
                  {t === 'drafts' && drafts.length > 0 && (
                    <span className="ml-1" style={{ color: 'var(--accent)' }}>({drafts.length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-5">

              {/* NEW TAB */}
              {tab === 'new' && (
                submitted ? (
                  <div className="text-center py-6">
                    <div className="text-xs font-mono mb-2 px-3 py-1 border inline-block" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                      received
                    </div>
                    <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>Thanks. We read everything.</p>
                    <div className="flex gap-3 justify-center mt-5">
                      <button onClick={startNew} className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
                        Send another
                      </button>
                      <button onClick={() => handleTabChange('submitted')} className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        View submitted
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <textarea
                        required
                        rows={5}
                        placeholder="Bug, feature request, anything..."
                        value={message}
                        onChange={e => handleMessageChange(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border bg-transparent outline-none resize-none focus:border-[var(--accent)] transition-colors"
                        style={{
                          borderColor: overLimit ? '#ff4444' : 'var(--border)',
                          color: 'var(--foreground)',
                          background: 'var(--surface)',
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono" style={{ color: overLimit ? '#ff4444' : 'var(--muted)' }}>
                          {message.length}/{MAX_TEXT}
                          {currentDraftId && !overLimit && (
                            <span style={{ color: '#555' }}> · draft saved</span>
                          )}
                        </span>
                        {overLimit && (
                          <span className="text-xs font-mono" style={{ color: '#ff8800' }}>
                            Upload a doc instead
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
                )
              )}

              {/* DRAFTS TAB */}
              {tab === 'drafts' && (
                drafts.length === 0 ? (
                  <p className="text-xs font-mono text-center py-6" style={{ color: 'var(--muted)' }}>
                    No drafts. Start typing and it auto-saves.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {drafts.map(draft => (
                      <div
                        key={draft.id}
                        onClick={() => loadDraft(draft)}
                        className="border p-3 cursor-pointer hover:border-white transition-colors"
                        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                            saved {draft.savedAt}
                          </span>
                          <button
                            onClick={e => deleteDraft(draft.id, e)}
                            className="text-xs flex-shrink-0"
                            style={{ color: 'var(--muted)' }}
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs font-mono line-clamp-2" style={{ color: 'var(--foreground)' }}>
                          {draft.message}
                        </p>
                        <span className="text-xs font-mono mt-2 inline-block" style={{ color: 'var(--accent)' }}>
                          Tap to continue →
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* SUBMITTED TAB */}
              {tab === 'submitted' && (
                loadingSubmitted ? (
                  <p className="text-xs font-mono text-center py-6" style={{ color: 'var(--muted)' }}>Loading...</p>
                ) : submittedList.length === 0 ? (
                  <p className="text-xs font-mono text-center py-6" style={{ color: 'var(--muted)' }}>
                    No submissions yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {submittedList.map(item => (
                      <div
                        key={item.id}
                        className="border p-3"
                        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>sent</span>
                          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-mono line-clamp-3" style={{ color: 'var(--foreground)' }}>
                          {item.message}
                        </p>
                        {item.attachments?.length > 0 && (
                          <p className="text-xs font-mono mt-1" style={{ color: 'var(--muted)' }}>
                            {item.attachments.length} attachment{item.attachments.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
