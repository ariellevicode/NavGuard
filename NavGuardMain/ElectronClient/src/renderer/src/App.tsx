import React, { useState, useEffect } from 'react'
import { VirtualMap } from './components/VirtualMap'
import { Point2D, HelicopterState } from './types/navigation'

function App(): React.JSX.Element {
  const [pointA, setPointA] = useState<Point2D | null>(null)
  const [pointB, setPointB] = useState<Point2D | null>(null)
  const [helicopter, setHelicopter] = useState<HelicopterState | null>(null)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1)
  const [evadeJammedZone, setEvadeJammedZone] = useState<boolean>(false)

  // Compute flight heading angle (in degrees) from Point A to Point B
  const calculateHeading = (from: Point2D, to: Point2D): number => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    return (Math.atan2(dx, -dy) * 180) / Math.PI
  }

  // Handle map click to set Origin and Target coordinates
  const handleMapClick = (clickedPoint: Point2D): void => {
    if (!pointA || (pointA && pointB)) {
      setPointA(clickedPoint)
      setPointB(null)
      setHelicopter({
        position: clickedPoint,
        headingDeg: 0,
        isFlying: false,
        progress: 0
      })
    } else {
      const heading = calculateHeading(pointA, clickedPoint)
      setPointB(clickedPoint)
      setHelicopter({
        position: pointA,
        headingDeg: heading,
        isFlying: false,
        progress: 0
      })
    }
  }

  // Simulation loop moving the helicopter from Origin to Target
  useEffect(() => {
    if (!helicopter?.isFlying || !pointA || !pointB) return

    const dx = pointB.x - pointA.x
    const dy = pointB.y - pointA.y
    const distance = Math.hypot(dx, dy)
    if (distance === 0) return

    const intervalMs = 20
    const baseSpeedPerSec = 140
    const stepProgress = ((baseSpeedPerSec * speedMultiplier) / distance) * (intervalMs / 1000)

    const timer = setInterval(() => {
      setHelicopter((prev) => {
        if (!prev) return null
        const nextProgress = Math.min(prev.progress + stepProgress, 1)
        const nextX = Math.round(pointA.x + dx * nextProgress)
        const nextY = Math.round(pointA.y + dy * nextProgress)

        return {
          ...prev,
          position: { x: nextX, y: nextY },
          progress: nextProgress,
          isFlying: nextProgress < 1
        }
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [helicopter?.isFlying, pointA, pointB, speedMultiplier])

  const handleStartFlight = (): void => {
    if (!pointA || !pointB) return
    const heading = calculateHeading(pointA, pointB)
    setHelicopter((prev) => ({
      position: prev && prev.progress < 1 ? prev.position : pointA,
      headingDeg: heading,
      isFlying: true,
      progress: prev && prev.progress < 1 ? prev.progress : 0
    }))
  }

  const handleStopFlight = (): void => {
    setHelicopter((prev) => (prev ? { ...prev, isFlying: false } : null))
  }

  const handleReset = (): void => {
    setPointA(null)
    setPointB(null)
    setHelicopter(null)
  }

  const totalDistance =
    pointA && pointB ? Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y).toFixed(1) : '0.0'

  const remainingDistance =
    pointA && pointB && helicopter
      ? (Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y) * (1 - helicopter.progress)).toFixed(1)
      : totalDistance

  return (
    <div
      dir="rtl"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#090b0e',
        color: '#d1d9e2',
        fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* Top Header Bar (Clean - only NAVGUARD title) */}
      <header
        style={{
          height: '44px',
          backgroundColor: '#10141a',
          borderBottom: '1px solid #222934',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#00d2ff' }} />
          <span
            style={{
              fontFamily: 'Consolas, monospace',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: '#f1f5f9'
            }}
          >
            NAVGUARD
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Right Control Sidebar */}
        <aside
          style={{
            width: '300px',
            backgroundColor: '#10141a',
            borderLeft: '1px solid #222934',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            gap: '18px'
          }}
        >
          {/* Telemetry Readouts (ORIGIN, TARGET, AIRCRAFT POS, DIST REMAINING) */}
          <div>
            <div
              dir="ltr"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontFamily: 'Consolas, monospace'
              }}
            >
              <div style={{ backgroundColor: '#0b0e12', border: '1px solid #1e2530', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#10b981' }}>ORIGIN</div>
                <div style={{ fontSize: '13px', color: '#f1f5f9', marginTop: '2px' }}>
                  {pointA ? `${String(pointA.x).padStart(4, '0')}, ${String(pointA.y).padStart(4, '0')}` : '----, ----'}
                </div>
              </div>

              <div style={{ backgroundColor: '#0b0e12', border: '1px solid #1e2530', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#f59e0b' }}>TARGET</div>
                <div style={{ fontSize: '13px', color: '#f1f5f9', marginTop: '2px' }}>
                  {pointB ? `${String(pointB.x).padStart(4, '0')}, ${String(pointB.y).padStart(4, '0')}` : '----, ----'}
                </div>
              </div>

              <div style={{ backgroundColor: '#0b0e12', border: '1px solid #1e2530', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>AIRCRAFT POS</div>
                <div style={{ fontSize: '13px', color: '#00d2ff', marginTop: '2px' }}>
                  {helicopter
                    ? `${String(helicopter.position.x).padStart(4, '0')}, ${String(helicopter.position.y).padStart(4, '0')}`
                    : '----, ----'}
                </div>
              </div>

              <div style={{ backgroundColor: '#0b0e12', border: '1px solid #1e2530', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>DIST REMAINING</div>
                <div style={{ fontSize: '13px', color: '#f1f5f9', marginTop: '2px' }}>
                  {pointA && pointB ? `${remainingDistance}m` : '----'}
                </div>
              </div>
            </div>

            {/* Route Progress Bar */}
            <div style={{ marginTop: '12px' }}>
              <div
                dir="ltr"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'Consolas, monospace',
                  fontSize: '11px',
                  color: '#8b9bb0',
                  marginBottom: '4px'
                }}
              >
                <span>PROGRESS</span>
                <span>{helicopter ? `${(helicopter.progress * 100).toFixed(0)}%` : '0%'}</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#1e2530' }}>
                <div
                  style={{
                    width: `${helicopter ? helicopter.progress * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: '#00d2ff',
                    transition: 'width 40ms linear'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Evade Jammed Zone Toggle Switch */}
          <div
            style={{
              backgroundColor: '#0b0e12',
              border: '1px solid #1e2530',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>
              התחמקות מאזור משובש
            </span>
            <button
              type="button"
              onClick={() => setEvadeJammedZone((prev) => !prev)}
              style={{
                width: '44px',
                height: '22px',
                borderRadius: '11px',
                border: `1px solid ${evadeJammedZone ? '#00d2ff' : '#334155'}`,
                backgroundColor: evadeJammedZone ? 'rgba(0, 210, 255, 0.25)' : '#1e2530',
                position: 'relative',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: evadeJammedZone ? '#00d2ff' : '#64748b',
                  position: 'absolute',
                  top: '2px',
                  left: evadeJammedZone ? '24px' : '3px',
                  transition: 'left 0.15s ease'
                }}
              />
            </button>
          </div>

          {/* Simulation Speed Slider */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#94a3b8',
                marginBottom: '6px'
              }}
            >
              <span>קצב סימולציה</span>
              <span style={{ fontFamily: 'Consolas, monospace', color: '#f1f5f9' }}>
                {speedMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.5}
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00d2ff', cursor: 'pointer' }}
            />
          </div>

          {/* Clean Action Buttons (without EXEC/HOLD/CLR labels) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleStartFlight}
              disabled={!pointA || !pointB || helicopter?.isFlying}
              style={{
                padding: '10px 12px',
                borderRadius: '2px',
                border: `1px solid ${!pointA || !pointB || helicopter?.isFlying ? '#222934' : '#00d2ff'}`,
                backgroundColor:
                  !pointA || !pointB || helicopter?.isFlying ? '#141920' : 'rgba(0, 210, 255, 0.14)',
                color: !pointA || !pointB || helicopter?.isFlying ? '#475569' : '#00d2ff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: !pointA || !pointB || helicopter?.isFlying ? 'not-allowed' : 'pointer',
                textAlign: 'center'
              }}
            >
              הפעל טיסה לאורך המסלול
            </button>

            <button
              onClick={handleStopFlight}
              disabled={!helicopter?.isFlying}
              style={{
                padding: '10px 12px',
                borderRadius: '2px',
                border: `1px solid ${!helicopter?.isFlying ? '#222934' : '#f59e0b'}`,
                backgroundColor: !helicopter?.isFlying ? '#141920' : 'rgba(245, 158, 11, 0.12)',
                color: !helicopter?.isFlying ? '#475569' : '#f59e0b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: !helicopter?.isFlying ? 'not-allowed' : 'pointer',
                textAlign: 'center'
              }}
            >
              השהה הרצה
            </button>

            <button
              onClick={handleReset}
              style={{
                padding: '10px 12px',
                borderRadius: '2px',
                border: '1px solid #26303d',
                backgroundColor: '#141920',
                color: '#94a3b8',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              נקה נקודות ציון
            </button>
          </div>
        </aside>

        {/* Map Viewport */}
        <main style={{ flex: 1, padding: '10px', display: 'flex', backgroundColor: '#07090c' }}>
          <VirtualMap
            pointA={pointA}
            pointB={pointB}
            helicopter={helicopter}
            backgroundMode="grid"
            onMapClick={handleMapClick}
          />
        </main>
      </div>
    </div>
  )
}

export default App