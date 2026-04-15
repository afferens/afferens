import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const admin = createAdminClient()

  const formData = await request.formData()
  const message = formData.get('message') as string
  const email = formData.get('email') as string | null
  const userId = formData.get('user_id') as string | null
  const files = formData.getAll('files') as File[]

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const attachmentUrls: string[] = []

  for (const file of files) {
    if (!file || file.size === 0) continue
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error } = await admin.storage
      .from('feedback-attachments')
      .upload(path, buffer, { contentType: file.type })

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
