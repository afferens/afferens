import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getIp } from '@/lib/ratelimit'

const COMMAND_TOKEN_COST = 5

const VALID_COMMANDS = [
  'CAPTURE_FRAME',
  'TRIGGER_ALARM',
  'MOVE_TO',
  'ROTATE_CAMERA',
  'LOCK',
  'UNLOCK',
  'ADJUST_SENSOR',
  'SHUTDOWN_NODE',
]

export async function POST(request: NextRequest) {
  const ip = getIp(request)
  const { allowed } = checkRateLimit(`actuation:${ip}`, 100, 60_000)
  if (!allowed) {
    return NextResponse.json({ status: 429, error: 'Rate limit exceeded. Max 100 requests/min per IP.' }, { status: 429 })
  }

  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return NextResponse.json(
      { status: 401, error: 'Missing API key. Add header: X-API-KEY: your-key' },
      { status: 401 }
    )
  }

  let body: {
    target_node_id: string
    command_type: string
    parameters?: Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ status: 400, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { target_node_id, command_type, parameters = {} } = body

  if (!target_node_id || !command_type) {
    return NextResponse.json(
      { status: 400, error: 'Body must include target_node_id and command_type.' },
      { status: 400 }
    )
  }

  if (!VALID_COMMANDS.includes(command_type.toUpperCase())) {
    return NextResponse.json(
      {
        status: 400,
        error: `Invalid command_type. Valid commands: ${VALID_COMMANDS.join(', ')}`,
      },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { data: keyRecord, error: keyError } = await supabase
    .from('api_keys')
    .select('id, tokens_consumed, is_active')
    .eq('key', apiKey)
    .single()

  if (keyError || !keyRecord) {
    return NextResponse.json({ status: 401, error: 'Invalid API key.' }, { status: 401 })
  }

  if (!keyRecord.is_active) {
    return NextResponse.json({ status: 403, error: 'API key is inactive.' }, { status: 403 })
  }

  const FREE_TIER_LIMIT = 10_000
  if (keyRecord.tokens_consumed >= FREE_TIER_LIMIT) {
    return NextResponse.json(
      {
        status: 402,
        error: 'Free tier limit reached (10,000 Sense Tokens). Top up your credits to continue.',
        upgrade_url: 'https://afferens.com/pricing',
      },
      { status: 402 }
    )
  }

  // Insert the command into the queue
  const { data: command, error: insertError } = await supabase
    .from('commands')
    .insert({
      api_key_id: keyRecord.id,
      target_node_id,
      command_type: command_type.toUpperCase(),
      parameters,
      status: 'queued',
      sense_tokens_cost: COMMAND_TOKEN_COST,
    })
    .select('id')
    .single()

  if (insertError || !command) {
    return NextResponse.json({ status: 500, error: 'Failed to queue command.' }, { status: 500 })
  }

  // Deduct tokens
  await supabase
    .from('api_keys')
    .update({ tokens_consumed: keyRecord.tokens_consumed + COMMAND_TOKEN_COST })
    .eq('id', keyRecord.id)

  return NextResponse.json({
    status: 200,
    command_id: command.id,
    target_node_id,
    command_type: command_type.toUpperCase(),
    parameters,
    status_label: 'queued',
    sense_tokens_consumed: COMMAND_TOKEN_COST,
    message: 'Command queued. Node will execute on next poll.',
  })
}
