import { NextRequest, NextResponse } from 'next/server'

// Public demo endpoint — no auth required, no token deduction, rate-limited by modality
// Returns canned but realistic sensory data so developers can try the API in under 60s

const DEMO_DATA: Record<string, object> = {
  VISION: {
    timestamp: new Date().toISOString(),
    entity_id: 'DEMO-VIS-001',
    modality: 'VISION',
    classification: 'forklift',
    confidence: 0.9341,
    spatial_coords: { x: 12.4, y: -3.2, z: 0.0 },
    data: {
      objects: [
        { label: 'forklift', confidence: 0.934, bbox_x: 142, bbox_y: 88, bbox_w: 210, bbox_h: 180 },
        { label: 'person', confidence: 0.871, bbox_x: 380, bbox_y: 110, bbox_w: 60, bbox_h: 140 },
      ],
      object_count: 2,
      model: 'afferens-vision-v1',
      frame_width: 1280,
      frame_height: 720,
    },
    sense_tokens_consumed: 14,
  },
  SPATIAL: {
    timestamp: new Date().toISOString(),
    entity_id: 'DEMO-SPT-001',
    modality: 'SPATIAL',
    classification: 'gps_reading',
    confidence: 1.0,
    spatial_coords: { lat: 3.073, lng: 101.518, altitude_m: 42.1 },
    data: {
      lat: 3.073,
      lng: 101.518,
      altitude_m: 42.1,
      speed_ms: 1.4,
      heading_deg: 267.3,
      accuracy_m: 2.1,
    },
    sense_tokens_consumed: 10,
  },
  ENVIRONMENTAL: {
    timestamp: new Date().toISOString(),
    entity_id: 'DEMO-ENV-001',
    modality: 'ENVIRONMENTAL',
    classification: 'ambient_reading',
    confidence: 0.99,
    spatial_coords: null,
    data: {
      temperature_c: 28.4,
      humidity_pct: 71.2,
      pressure_hpa: 1013.2,
      wind_speed_knots: 3.1,
      wind_direction_deg: 180,
    },
    sense_tokens_consumed: 6,
  },
  ACOUSTIC: {
    timestamp: new Date().toISOString(),
    entity_id: 'DEMO-ACU-001',
    modality: 'ACOUSTIC',
    classification: 'sound_event',
    confidence: 0.882,
    spatial_coords: { x: 5.0, y: -1.2, z: 0.0 },
    data: {
      event: 'machinery_operating',
      db_level: 74.2,
      frequency_hz: 320,
      duration_ms: 1200,
      direction_deg: 45,
    },
    sense_tokens_consumed: 8,
  },
  MOLECULAR: {
    timestamp: new Date().toISOString(),
    entity_id: 'DEMO-MOL-001',
    modality: 'MOLECULAR',
    classification: 'air_quality',
    confidence: 0.97,
    spatial_coords: null,
    data: {
      co2_ppm: 412,
      co_ppm: 0.4,
      voc_ppb: 18,
      pm25_ugm3: 11.2,
      pm10_ugm3: 24.8,
      o3_ppb: 22,
    },
    sense_tokens_consumed: 18,
  },
  INTEROCEPTION: {
    timestamp: new Date().toISOString(),
    entity_id: 'DEMO-INT-001',
    modality: 'INTEROCEPTION',
    classification: 'node_health',
    confidence: 1.0,
    spatial_coords: null,
    data: {
      cpu_pct: 14.2,
      mem_pct: 38.7,
      battery_pct: 91,
      uptime_s: 86400,
      sensor_errors: 0,
      network_latency_ms: 12,
    },
    sense_tokens_consumed: 5,
  },
}

// Simple in-memory rate limit — max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; reset: number }>()

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const now = Date.now()
  const windowMs = 60_000
  const maxRequests = 10

  const entry = rateLimitMap.get(ip)
  if (entry && now < entry.reset) {
    if (entry.count >= maxRequests) {
      return NextResponse.json(
        { status: 429, error: 'Demo rate limit reached. Sign up for a free API key to continue.' },
        { status: 429 }
      )
    }
    entry.count++
  } else {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs })
  }

  const modality = request.nextUrl.searchParams.get('modality')?.toUpperCase() ?? 'VISION'
  const data = DEMO_DATA[modality] ?? DEMO_DATA.VISION

  return NextResponse.json({
    status: 200,
    demo: true,
    note: 'This is demo data. Sign up at afferens.com/signup to get a free API key with 10,000 real tokens.',
    data: [data],
    count: 1,
    tokens_remaining: 10000,
    api_version: 'v1.0.0',
  })
}
