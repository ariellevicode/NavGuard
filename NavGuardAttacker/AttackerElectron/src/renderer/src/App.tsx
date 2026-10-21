import React, { useState, useEffect } from 'react'
import { AttackerMap } from './components/AttackerMap'
import { AttackZone, AttackExecutionState } from './types/attack'

function App(): React.JSX.Element {
  // Simultaneous Attack Modes (Jamming and/or Spoofing)
  const [jammingSelected, setJammingSelected] = useState<boolean>(true)
  const [spoofingSelected, setSpoofingSelected] = useState<boolean>(false)

  // Simultaneous Attack Forms (Zone and/or Time)
  const [zoneModeSelected, setZoneModeSelected] = useState<boolean>(true)
  const [timeModeSelected, setTimeModeSelected] = useState<boolean>(false)

  // Drawn zone on map
  const [attackZone, setAttackZone] = useState<AttackZone | null>(null)

  // Time duration settings (in seconds)
  const [durationSeconds, setDurationSeconds] = useState<number>(30)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30)

  // Attack execution state: 'idle' | 'active' | 'paused'
  const [executionState, setExecutionState] = useState<AttackExecutionState>('idle')

  // Countdown timer when Time mode is enabled and attack is active
  useEffect(() => {
    if (executionState !== 'active' || !timeModeSelected) return

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setExecutionState('idle')
          return durationSeconds
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [executionState, timeModeSelected, durationSeconds])

  // Keep remainingSeconds synced when changing duration in idle state
  const handleDurationChange = (newDuration: number): void => {
    const clamped = Math.max(1, newDuration)
    setDurationSeconds(clamped)
    if (executionState === 'idle') {
      setRemainingSeconds(clamped)
    }
  }

  // Start or resume attack
  const handleStartAttack = (): void => {
    if (!jammingSelected && !spoofingSelected) return
    if (!zoneModeSelected && !timeModeSelected) return
    if (zoneModeSelected && !attackZone) return

    if (executionState === 'idle') {
      setRemainingSeconds(durationSeconds)
    }
    setExecutionState('active')
  }

  // Pause active attack
  const handlePauseAttack = (): void => {
    if (executionState === 'active') {
      setExecutionState('paused')
    }
  }

  // Stop attack completely and reset timer
  const handleStopAttack = (): void => {
    setExecutionState('idle')
    setRemainingSeconds(durationSeconds)
  }

  const canStart =
    (jammingSelected || spoofingSelected) &&
    (zoneModeSelected || timeModeSelected) &&
    (!zoneModeSelected || attackZone !== null) &&
    executionState !== 'active'

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
      {/* Top Header Bar (Consistent with Main Client) */}
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
          <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444' }} />
          <span
            style={{
              fontFamily: 'Consolas, monospace',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: '#f1f5f9'
            }}
          >
            NAVGUARD // ATTACKER
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
            gap: '18px',
            overflowY: 'auto'
          }}
        >
          {/* 1. Attack Mode (Jamming / Spoofing - can select both simultaneously) */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
              מצב התקפה (ניתן לשלב בו-זמנית)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setJammingSelected((prev) => !prev)}
                style={{
                  padding: '10px',
                  borderRadius: '2px',
                  border: `1px solid ${jammingSelected ? '#ef4444' : '#26303d'}`,
                  backgroundColor: jammingSelected ? 'rgba(239, 68, 68, 0.16)' : '#0b0e12',
                  color: jammingSelected ? '#f87171' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                שיבוש
              </button>

              <button
                type="button"
                onClick={() => setSpoofingSelected((prev) => !prev)}
                style={{
                  padding: '10px',
                  borderRadius: '2px',
                  border: `1px solid ${spoofingSelected ? '#ef4444' : '#26303d'}`,
                  backgroundColor: spoofingSelected ? 'rgba(239, 68, 68, 0.16)' : '#0b0e12',
                  color: spoofingSelected ? '#f87171' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                זיוף
              </button>
            </div>
          </div>

          {/* 2. Attack Form (Zone / Time - can select both simultaneously) */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
              צורת התקפה
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setZoneModeSelected((prev) => !prev)}
                style={{
                  padding: '10px',
                  borderRadius: '2px',
                  border: `1px solid ${zoneModeSelected ? '#00d2ff' : '#26303d'}`,
                  backgroundColor: zoneModeSelected ? 'rgba(0, 210, 255, 0.14)' : '#0b0e12',
                  color: zoneModeSelected ? '#00d2ff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                אזור
              </button>

              <button
                type="button"
                onClick={() => setTimeModeSelected((prev) => !prev)}
                style={{
                  padding: '10px',
                  borderRadius: '2px',
                  border: `1px solid ${timeModeSelected ? '#00d2ff' : '#26303d'}`,
                  backgroundColor: timeModeSelected ? 'rgba(0, 210, 255, 0.14)' : '#0b0e12',
                  color: timeModeSelected ? '#00d2ff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                זמן
              </button>
            </div>
          </div>

          {/* 3. Zone Configuration Box (shown when Zone mode is selected) */}
          {zoneModeSelected && (
            <div
              style={{
                backgroundColor: '#0b0e12',
                border: '1px solid #1e2530',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                לחץ וגרור על המפה כדי לצייר את אזור התקיפה
              </div>
              <div
                dir="ltr"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'Consolas, monospace',
                  fontSize: '12px',
                  color: '#f1f5f9'
                }}
              >
                <span>
                  CENTER:{' '}
                  {attackZone ? `(${attackZone.center.x}, ${attackZone.center.y})` : '----, ----'}
                </span>
                <span>RADIUS: {attackZone ? `${attackZone.radius}m` : '----'}</span>
              </div>
              {attackZone && (
                <button
                  type="button"
                  onClick={() => setAttackZone(null)}
                  style={{
                    padding: '6px',
                    borderRadius: '2px',
                    border: '1px solid #26303d',
                    backgroundColor: '#141920',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  נקה אזור מהמפה
                </button>
              )}
            </div>
          )}

          {/* 4. Time Duration Configuration Box (shown when Time mode is selected) */}
          {timeModeSelected && (
            <div
              style={{
                backgroundColor: '#0b0e12',
                border: '1px solid #1e2530',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>משך זמן תקיפה (שניות):</span>
                <span style={{ fontFamily: 'Consolas, monospace', color: '#f1f5f9' }}>
                  {remainingSeconds}s / {durationSeconds}s
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={600}
                value={durationSeconds}
                disabled={executionState !== 'idle'}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                style={{
                  backgroundColor: '#141920',
                  border: '1px solid #26303d',
                  color: '#f1f5f9',
                  padding: '6px 8px',
                  borderRadius: '2px',
                  fontFamily: 'Consolas, monospace',
                  fontSize: '13px'
                }}
              />
            </div>
          )}

          {/* 5. Attack Control Buttons: Start, Pause, Stop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleStartAttack}
              disabled={!canStart}
              style={{
                padding: '10px 12px',
                borderRadius: '2px',
                border: `1px solid ${!canStart ? '#222934' : '#ef4444'}`,
                backgroundColor: !canStart ? '#141920' : 'rgba(239, 68, 68, 0.18)',
                color: !canStart ? '#475569' : '#f87171',
                fontWeight: 600,
                fontSize: '13px',
                cursor: !canStart ? 'not-allowed' : 'pointer',
                textAlign: 'center'
              }}
            >
              התחל התקפה
            </button>

            <button
              type="button"
              onClick={handlePauseAttack}
              disabled={executionState !== 'active'}
              style={{
                padding: '10px 12px',
                borderRadius: '2px',
                border: `1px solid ${executionState !== 'active' ? '#222934' : '#f59e0b'}`,
                backgroundColor:
                  executionState !== 'active' ? '#141920' : 'rgba(245, 158, 11, 0.14)',
                color: executionState !== 'active' ? '#475569' : '#f59e0b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: executionState !== 'active' ? 'not-allowed' : 'pointer',
                textAlign: 'center'
              }}
            >
              הפסק התקפה
            </button>

            <button
              type="button"
              onClick={handleStopAttack}
              disabled={executionState === 'idle'}
              style={{
                padding: '10px 12px',
                borderRadius: '2px',
                border: `1px solid ${executionState === 'idle' ? '#222934' : '#94a3b8'}`,
                backgroundColor: '#141920',
                color: executionState === 'idle' ? '#475569' : '#e2e8f0',
                fontWeight: 500,
                fontSize: '13px',
                cursor: executionState === 'idle' ? 'not-allowed' : 'pointer',
                textAlign: 'center'
              }}
            >
              עצור התקפה
            </button>
          </div>
        </aside>

        {/* Map Viewport */}
        <main style={{ flex: 1, padding: '10px', display: 'flex', backgroundColor: '#07090c' }}>
          <AttackerMap
            zone={attackZone}
            canDrawZone={zoneModeSelected && executionState !== 'active'}
            executionState={executionState}
            jammingEnabled={jammingSelected}
            spoofingEnabled={spoofingSelected}
            backgroundMode="grid"
            onZoneChange={setAttackZone}
          />
        </main>
      </div>
    </div>
  )
}

export default App