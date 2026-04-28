import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getIp } from '@/lib/ratelimit'

const MAX_MESSAGE_LENGTH = 2000
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
])

export async function POST(request: NextRequest) {
  const ip = getIp(request)
  const { allowed } = await checkRateLimit(`feedback:${ip}`, 5, 15 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const admin = createAdminClient()

  const formData = await request.formData()
  const message = formData.get('message') as string
  const email = formData.get('email') as string | null
  const userId = formData.get('user_id') as string | null
  const files = formData.getAll('files') as File[]

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message must be under ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 })
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed.` }, { status: 400 })
  }

  for (const file of files) {
    if (!file || file.size === 0) continue
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `File "${file.name}" exceeds 10MB limit.` }, { status: 400 })
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: `File type "${file.type}" is not allowed.` }, { status: 400 })
    }
  }

  const attachmentUrls: string[] = []

  for (const file of files) {
    if (!file || file.size === 0) continue
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error } = await admin.storage
      .from('feedback-attachments')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (!error) {
      const { data } = admin.storage.from('feedback-attachments').getPublicUrl(path)
      attachmentUrls.push(data.publicUrl)
    }
  }

  const { error } = await admin.from('feedback').insert({
    message: message.trim(),
    email: email || null,
    user_id: userId || null,
    attachments: attachmentUrls,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
