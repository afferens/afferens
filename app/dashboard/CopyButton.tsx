'use client'

import { useState } from 'react'

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="text-xs font-mono px-3 py-2 border transition-colors whitespace-nowrap"
      style={{
        borderColor: copied ? 'var(--accent)' : 'var(--border)',
        color: copied ? 'var(--accent)' : 'var(--muted)',
      }}
    >
      {copied ? 'copied' : 'copy'}
    </button>
  )
}
