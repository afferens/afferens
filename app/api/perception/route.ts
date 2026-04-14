import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const modality = request.nextUrl.searchParams.get('modality')?.toUpperCase() || null
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '1'), 10)

  // Reject requests with no API key
  if (!apiKey) {
    return NextResponse.json(
      { status: 401, error: 'Missing API key. Add header: X-API-KEY: your-key' },
      { status: 401 }
    )
  }

  const supabase = createAdminClient()

  // Look up the API key in the database
  const { data: keyRecord, error: keyError } = await supabase
    .from('api_keys')
    .select('id, user_id, tokens_consumed, is_active')
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

  // Enforce free tier limit
  const FREE_TIER_LIMIT = 500_000
  if (keyRecord.tokens_consumed >= FREE_TIER_LIMIT) {
    return NextResponse.json(
      {
        status: 402,
        error: 'Free tier limit reached (500,000 Sense Tokens). Upgrade to Pro to continue.',
        tokens_consumed: keyRecord.tokens_consumed,
        upgrade_url: 'https://afferens.vercel.app/pricing',
      },
      { status: 402 }
    )
  }

  // Pull perception events from the database
  let query = supabase
    .from('perception_events')
    .select('entity_id, type, modality, classification, confidence, spatial_coords, sense_tokens_cost')
    .limit(limit)

  if (modality) {
    query = query.eq('modality', modality)
  }

  const { data: events, error: eventsError } = await query

  if (eventsError || !events || events.length === 0) {
    return NextResponse.json(
      { status: 404, error: 'No perception data found for the requested modality.' },
      { status: 404 }
    )
  }

  // Calculate total tokens this request costs
  const totalTokens = events.reduce((sum, e) => sum + e.sense_tokens_cost, 0)

  // Update the token counter for this API key
  await supabase
    .from('api_keys')
    .update({ tokens_consumed: keyRecord.tokens_consumed + totalTokens })
    .eq('id', keyRecord.id)

  // Format the response to match the expected schema
  const responseData = events.map(e => ({
    timestamp: new Date().toISOString(),
    entity_id: e.entity_id,
    type: e.type,
    modality: e.modality,
    classification: e.classification,
    confidence: e.confidence,
    spatial_coords: e.spatial_coords,
    sense_tokens_consumed: e.sense_tokens_cost,
  }))

  return NextResponse.json({
    status: 200,
    data: responseData,
    count: responseData.length,
    api_version: 'v1.0.0',
  })
}
