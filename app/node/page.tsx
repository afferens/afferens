'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type SensorReading = {
  time: string
  modality: string
  data: Record<string, unknown>
  tokens: number
  entity_id?: string
}

type Command = {
  id: string
  command_type: string
  parameters: Record<string, unknown>
  received_at: string
}

export default function NodePage() {
  const [apiKey, setApiKey] = useState('')
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('idle')
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [totalTokens, setTotalTokens] = useState(0)
  const [error, setError] = useState('')
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [commands, setCommands] = useState<Command[]>([])
  const [cameraActive, setCameraActive] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const visionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestGPS = useRef<Record<string, unknown> | null>(null)
  const latestMotion = useRef<Record<string, unknown> | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

  // Load TF model and start camera when running
  useEffect(() => {
    if (!running) return

    let cancelled = false

    async function initCamera() {
      setModelStatus('loading')
      try {
        // Dynamic imports — avoids SSR crash and keeps initial bundle small
        const tf = await import('@tensorflow/tfjs')
        await tf.ready()
        const cocoSsd = await import('@tensorflow-models/coco-ssd')
        const model = await cocoSsd.load()
        if (cancelled) return
        modelRef.current = model
        setModelStatus('ready')

        // Start rear camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setCameraActive(true)
      } catch (e) {
        if (!cancelled) {
          setModelStatus('error')
          setError(`Camera/model error: ${e instanceof Error ? e.message : String(e)}`)
        }
      }
    }

    initCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      setCameraActive(false)
      setModelStatus('idle')
    }
  }, [running])

  async function sendReading(
    modality: string,
    classification: string,
    data: Record<string, unknown>
  ) {
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
        body: JSON.stringify({ modality, classification, data }),
      })
      return await res.json()
    } catch {
      return null
    }
  }

  // Poll for incoming commands every 5s
  useEffect(() => {
    if (!running || !apiKey) return

    const nodeId = `IPHONE-${navigator.userAgent.includes('iPhone') ? 'IOS' : 'DEVICE'}-01`

    async function pollCommands() {
      try {
        const res = await fetch(`/api/commands?node_id=${encodeURIComponent(nodeId)}`, {
          headers: { 'X-API-KEY': apiKey },
        })
        const result = await res.json()
        if (result.commands?.length > 0) {
          const received = result.commands.map((c: { id: string; command_type: string; parameters: Record<string, unknown> }) => ({
            id: c.id,
            command_type: c.command_type,
            parameters: c.parameters,
            received_at: new Date().toLocaleTimeString(),
          }))
          setCommands(prev => [...received, ...prev].slice(0, 20))
        }
      } catch { /* ignore */ }
    }

    const interval = setInterval(pollCommands, 5000)
    pollCommands()
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, apiKey])

  // GPS + Motion pulse every 5s
  useEffect(() => {
    if (!running) return

    async function pulse() {
      const time = new Date().toLocaleTimeString()
      let tokensThisPulse = 0

      if (latestGPS.current) {
        const result = await sendReading('SPATIAL', 'iphone_gps', latestGPS.current)
        if (result?.status === 200) {
          tokensThisPulse += result.sense_tokens_consumed
          setReadings(prev => [{
            time, modality: 'SPATIAL', data: latestGPS.current!,
            tokens: result.sense_tokens_consumed, entity_id: result.entity_id,
          }, ...prev].slice(0, 30))
        }
      }

      if (latestMotion.current) {
        const result = await sendReading('INTEROCEPTION', 'iphone_motion', latestMotion.current)
        if (result?.status === 200) {
          tokensThisPulse += result.sense_tokens_consumed
          setReadings(prev => [{
            time, modality: 'INTEROCEPTION', data: latestMotion.current!,
            tokens: result.sense_tokens_consumed, entity_id: result.entity_id,
          }, ...prev].slice(0, 30))
        }
      }

      if (tokensThisPulse > 0) {
        setTotalTokens(prev => prev + tokensThisPulse)
        setStatus('streaming')
      }
    }

    intervalRef.current = setInterval(pulse, 5000)
    pulse()

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, apiKey])

  // Vision detection pulse every 10s (heavier — runs object detection)
  const runVision = useCallback(async () => {
    if (!modelRef.current || !videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    if (video.readyState < 2) return

    const predictions = await modelRef.current.detect(video)
    if (!predictions || predictions.length === 0) return

    // Draw bounding boxes on canvas overlay
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#00ff88'
      ctx.lineWidth = 2
      ctx.font = '12px monospace'
      ctx.fillStyle = '#00ff88'
      for (const p of predictions) {
        const [x, y, w, h] = p.bbox
        ctx.strokeRect(x, y, w, h)
        ctx.fillText(`${p.class} ${Math.round(p.score * 100)}%`, x + 2, y > 14 ? y - 4 : y + 14)
      }
    }

    const detectionData = {
      objects: predictions.map((p: { class: string; score: number; bbox: number[] }) => ({
        label: p.class,
        confidence: parseFloat(p.score.toFixed(3)),
        bbox_x: Math.round(p.bbox[0]),
        bbox_y: Math.round(p.bbox[1]),
        bbox_w: Math.round(p.bbox[2]),
        bbox_h: Math.round(p.bbox[3]),
      })),
      object_count: predictions.length,
      model: 'coco-ssd',
      frame_width: video.videoWidth,
      frame_height: video.videoHeight,
    }

    const time = new Date().toLocaleTimeString()
    const result = await sendReading('VISION', 'iphone_camera_coco', detectionData)
    if (result?.status === 200) {
      setTotalTokens(prev => prev + result.sense_tokens_consumed)
      setReadings(prev => [{
        time, modality: 'VISION', data: detectionData,
        tokens: result.sense_tokens_consumed, entity_id: result.entity_id,
      }, ...prev].slice(0, 30))
      setStatus('streaming')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  useEffect(() => {
    if (!running || modelStatus !== 'ready' || !cameraActive) return

    visionIntervalRef.current = setInterval(runVision, 10000)
    // Fire first detection after a short delay to let video stabilize
    const t = setTimeout(runVision, 2000)

    return () => {
      if (visionIntervalRef.current) clearInterval(visionIntervalRef.current)
      clearTimeout(t)
    }
  }, [running, modelStatus, cameraActive, runVision])

  async function startNode() {
    setError('')
    if (!apiKey.trim()) { setError('Paste your API key first.'); return }

    // iOS motion permission
    if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
        if (permission !== 'granted') { setError('Motion sensor permission denied.'); return }
      } catch {
        setError('Could not request motion permission.'); return
      }
    }

    setStatus('connecting')
    setRunning(true)
  }

  function stopNode() {
    setRunning(false)
    setStatus('idle')
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (visionIntervalRef.current) clearInterval(visionIntervalRef.current)
  }

  return (
    <main className="min-h-screen flex flex-col px-5 py-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono mb-1" style={{ color: 'var(--muted)' }}>afferens</div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Node</h1>
        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--muted)' }}>
          This device is an Afferens Node. It streams real sensor data to the Afferens API.
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

      {/* Camera viewfinder */}
      {running && (
        <div className="mb-6">
          <div className="text-xs font-mono mb-2 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Camera — VISION modality
          </div>
          <div className="relative w-full border" style={{ borderColor: 'var(--border)', background: '#000', aspectRatio: '4/3', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ display: cameraActive ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  {modelStatus === 'loading' ? 'Loading vision model...' : modelStatus === 'error' ? 'Camera unavailable' : 'Initializing...'}
                </span>
              </div>
            )}
            {modelStatus === 'ready' && cameraActive && (
              <div className="absolute top-2 left-2 px-2 py-0.5" style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid var(--accent)' }}>
                <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>LIVE · COCO-SSD</span>
              </div>
            )}
          </div>
          <p className="text-xs font-mono mt-1" style={{ color: 'var(--muted)' }}>
            Object detection runs on-device every 10 seconds. Detections stream to /api/ingest as VISION events.
          </p>
        </div>
      )}

      {/* What's being sensed */}
      {running && (
        <div className="mb-6 border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Active sensors on this device
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'VISION — camera, object detection (COCO-SSD, 80 classes)' },
              { label: 'SPATIAL — lat, lng, altitude, speed, heading' },
              { label: 'INTEROCEPTION — accelerometer, gyroscope' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-mono mt-3" style={{ color: 'var(--muted)' }}>
            SPATIAL + INTEROCEPTION → every 5s · VISION → every 10s
          </p>
        </div>
      )}

      {/* Incoming commands */}
      {commands.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-mono mb-3 uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Incoming commands
          </div>
          <div className="flex flex-col gap-2">
            {commands.map((c, i) => (
              <div key={i} className="border p-3" style={{ borderColor: '#ff4444', background: 'rgba(255,68,68,0.05)' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold" style={{ color: '#ff4444' }}>{c.command_type}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{c.received_at}</span>
                </div>
                {Object.keys(c.parameters).length > 0 && (
                  <pre className="text-xs font-mono overflow-x-auto" style={{ color: '#888' }}>
                    {JSON.stringify(c.parameters, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
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
