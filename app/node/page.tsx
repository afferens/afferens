'use client'

import { useState, useEffect, useRef } from 'react'

type SensorReading = {
  time: string
  modality: string
  data: Record<string, unknown>
  tokens: number
  entity_id?: string
}

export default function NodePage() {
  const [apiKey, setApiKey] = useState('')
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('idle')
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [totalTokens, setTotalTokens] = useState(0)
  const [error, setError] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestGPS = useRef<Record<string, unknown> | null>(null)
  const latestMotion = useRef<Record<string, unknown> | null>(null)

  // Watch GPS continuously
  useEffect(() => {
    if (!running) return
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        latestGPS.current = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
          altitude_m: pos.coords.altitude ? parseFloat(pos.coords.altitude.toFixed(1)) : null,
          speed_ms: pos.coords.speed ? parseFloat(pos.coords.speed.toFixed(2)) : 0,
          heading_deg: pos.coords.heading ? parseFloat(pos.coords.heading.toFixed(1)) : null,
          accuracy_m: parseFloat(pos.coords.accuracy.toFixed(1)),
        }
      },
      (err) => setError(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 0 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [running])

  // Watch device motion continuously
  useEffect(() => {
    if (!running) return

    function handleMotion(e: DeviceMotionEvent) {
      latestMotion.current = {
        accel_x: parseFloat((e.acceleration?.x ?? 0).toFixed(3)),
        accel_y: parseFloat((e.acceleration?.y ?? 0).toFixed(3)),
        accel_z: parseFloat((e.acceleration?.z ?? 0).toFixed(3)),
        rotation_alpha: parseFloat((e.rotationRate?.alpha ?? 0).toFixed(2)),
        rotation_beta: parseFloat((e.rotationRate?.beta ?? 0).toFixed(2)),
        rotation_gamma: parseFloat((e.rotationRate?.gamma ?? 0).toFixed(2)),
        interval_ms: e.interval,
      }
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [running])

  // Send sensor data to Afferens every 5 seconds
  useEffect(() => {
    if (!running) return

    async function sendReading(
      modality: string,
      classification: string,
      data: Record<string, unknown>
    ) {
      try {
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
          },
          body: JSON.stringify({ modality, classification, data }),
        })
        const json = await res.json()
        return json
      } catch {
        return null
      }
    }

    async function pulse() {
      const time = new Date().toLocaleTimeString()
      let tokensThisPulse = 0

      // Send GPS/spatial if available
      if (latestGPS.current) {
        const result = await sendReading('SPATIAL', 'iphone_gps', latestGPS.current)
        if (result?.status === 200) {
          tokensThisPulse += result.sense_tokens_consumed
          setReadings(prev => [{
            time,
            modality: 'SPATIAL',
            data: latestGPS.current!,
            tokens: result.sense_tokens_consumed,
            entity_id: result.entity_id,
          }, ...prev].slice(0, 20))
        }
      }

      // Send motion/interoception if available
      if (latestMotion.current) {
        const result = await sendReading('INTEROCEPTION', 'iphone_motion', latestMotion.current)
        if (result?.status === 200) {
          tokensThisPulse += result.sense_tokens_consumed
          setReadings(prev => [{
            time,
            modality: 'INTEROCEPTION',
            data: latestMotion.current!,
            tokens: result.sense_tokens_consumed,
            entity_id: result.entity_id,
          }, ...prev].slice(0, 20))
        }
      }

      if (tokensThisPulse > 0) {
        setTotalTokens(prev => prev + tokensThisPulse)
        setStatus('streaming')
      }
    }

    intervalRef.current = setInterval(pulse, 5000)
    pulse() // fire immediately on start

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, apiKey])

  async function startNode() {
    setError('')
    if (!apiKey.trim()) {
      setError('Paste your API key first.')
      return
    }

    // iOS requires a user gesture to enable DeviceMotion
    if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
        if (permission !== 'granted') {
          setError('Motion sensor permission denied.')
          return
        }
      } catch {
        setError('Could not request motion permission.')
        return
      }
    }

    setStatus('connecting')
    setRunning(true)
  }

  function stopNode() {
    setRunning(false)
    setStatus('idle')
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <main className="min-h-screen flex flex-col px-5 py-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono mb-1" style={{ color: 'var(--muted)' }}>afferens</div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Node</h1>
        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--muted)' }}>
          This device is a ClawSense Node. It streams real sensor data to the Afferens API.
        </p>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: status === 'streaming' ? 'var(--accent)' : status === 'connecting' ? '#ffaa00' : '#333' }}
        />
        <span className="text-xs font-mono uppercase" style={{ color: status === 'streaming' ? 'var(--accent)' : 'var(--muted)' }}>
          {status === 'idle' ? 'offline' : status}
        </span>
        {status === 'streaming' && (
          <span className="text-xs font-mono ml-auto" style={{ color: 'var(--accent)' }}>
            {totalTokens} tokens sent
          </span>
        )}
      </div>

      {/* API Key input */}
      {!running && (
        <div className="mb-5">
          <div className="text-xs font-mono mb-2" style={{ color: 'var(--muted)' }}>YOUR API KEY</div>
          <input
            type="text"
            placeholder="AFF-00-YOURNAME"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full px-4 py-3 text-sm font-mono border bg-transparent outline-none"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs font-mono mb-4" style={{ color: '#ff4444' }}>{error}</p>
      )}

      {/* Start / Stop */}
      {!running ? (
        <button
          onClick={startNode}
          className="w-full py-4 font-bold text-sm mb-8"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          Start Sensing
        </button>
      ) : (
        <button
          onClick={stopNode}
          className="w-full py-4 font-bold text-sm mb-8 border"
          style={{ borderColor: '#ff4444', color: '#ff4444', background: 'transparent' }}
        >
          Stop Node
        </button>
      )}

      {/* What's being sensed */}
      {running && (
        <div className="mb-6 border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Active sensors on this device
          </div>
          <div className="flex flex-col gap-2">
            {[
              { name: 'GPS', label: 'SPATIAL — lat, lng, altitude, speed, heading' },
              { name: 'MOTION', label: 'INTEROCEPTION — accelerometer, gyroscope' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-mono mt-3" style={{ color: 'var(--muted)' }}>
            Streaming every 5 seconds → /api/ingest
          </p>
        </div>
      )}

      {/* Live feed */}
      {readings.length > 0 && (
        <div>
          <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Live feed
          </div>
          <div className="flex flex-col gap-2">
            {readings.map((r, i) => (
              <div key={i} className="border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{r.modality}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{r.time} · {r.tokens} tokens</span>
                </div>
                <pre className="text-xs font-mono overflow-x-auto" style={{ color: '#888' }}>
                  {JSON.stringify(r.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

    </main>
  )
}
