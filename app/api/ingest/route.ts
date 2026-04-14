import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Maps the raw modality string to a token cost
const TOKEN_COST: Record<string, number> = {
  VISION: 14,
  SPATIAL: 10,
  ACOUSTIC: 8,
  ENVIRONMENTAL: 6,
  MOLECULAR: 18,
  INTEROCEPTION: 5,
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return NextResponse.json(
      { status: 401, error: 'Missing API key. Add header: X-API-KEY: your-key' },
      { status: 401 }
    )
  }

  let body: {
    modality: string
    classification?: string
    data: Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { status: 400, error: 'Invalid JSON body.' },
      { status: 400 }
    )
  }

  const { modality, classification, data } = body

  if (!modality || !data) {
    return NextResponse.json(
      { status: 400, error: 'Body must include modality and data fields.' },
      { status: 400 }
    )
  }

  const normalizedModality = modality.toUpperCase()
  const tokenCost = TOKEN_COST[normalizedModality] ?? 10

  const supabase = createAdminClient()

  // Validate the API key
  const { data: keyRecord, error: keyError } = await supabase
    .from('api_keys')
    .select('id, tokens_consumed, is_active')
    .eq('key', apiKey)
    .single()

  if (keyError || !keyRecord) {
    return NextResponse.json(
      { status: 401, error: 'Invalid API key.' },
      { status: 401 }
    )
  }

  if (!keyRecord.is_active) {
    return NextResponse.json(
      { status: 403, error: 'API key is inactive.' },
      { status: 403 }
    )
  }

  // Generate a unique entity ID for this node reading
  const entityId = `LIVE-${normalizedModality.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`

  // Insert the live sensor reading into the perception_events table
  const { error: insertError } = await supabase
    .from('perception_events')
    .insert({
      entity_id: entityId,
      type: normalizedModality,
      modality: normalizedModality,
      classification: classification || 'live_node_reading',
      confidence: 1.0, // Raw sensor data is ground truth
      spatial_coords: data,
      sense_tokens_cost: tokenCost,
    })

  if (insertError) {
    return NextResponse.json(
      { status: 500, error: 'Failed to store sensor data.' },
      { status: 500 }
    )
  }

  // Increment token counter
  await supabase
    .from('api_keys')
    .update({ tokens_consumed: keyRecord.tokens_consumed + tokenCost })
    .eq('id', keyRecord.id)

  return NextResponse.json({
    status: 200,
    entity_id: entityId,
    modality: normalizedModality,
    sense_tokens_consumed: tokenCost,
    message: 'Sensor data ingested successfully.',
  })
}
