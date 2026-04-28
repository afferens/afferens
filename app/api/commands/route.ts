import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getIp } from '@/lib/ratelimit'

// Nodes call this to get their pending commands, then mark them executed
export async function GET(request: NextRequest) {
  const ip = getIp(request)
  const { allowed } = await checkRateLimit(`commands:${ip}`, 100, 60_000)
  if (!allowed) {
    return NextResponse.json({ status: 429, error: 'Rate limit exceeded. Max 100 requests/min per IP.' }, { status: 429 })
  }

  const apiKey = request.headers.get('x-api-key')
  const nodeId = request.nextUrl.searchParams.get('node_id')

  if (!apiKey) {
    return NextResponse.json({ status: 401, error: 'Missing API key.' }, { status: 401 })
  }

  if (!nodeId) {
    return NextResponse.json({ status: 400, error: 'Missing node_id param.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('id, is_active')
    .eq('key', apiKey)
    .single()

  if (!keyRecord || !keyRecord.is_active) {
    return NextResponse.json({ status: 401, error: 'Invalid or inactive API key.' }, { status: 401 })
  }

  // Fetch queued commands for this node
  const { data: commands } = await supabase
    .from('commands')
    .select('id, command_type, parameters, created_at')
    .eq('target_node_id', nodeId)
    .eq('status', 'queued')
    .order('created_at', { ascending: true })

  if (commands && commands.length > 0) {
    // Mark them all as executed
    const ids = commands.map(c => c.id)
    await supabase
      .from('commands')
      .update({ status: 'executed', executed_at: new Date().toISOString() })
      .in('id', ids)
  }

  return NextResponse.json({
    status: 200,
    node_id: nodeId,
    commands: commands ?? [],
    count: commands?.length ?? 0,
  })
}
