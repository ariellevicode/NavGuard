import React, { useRef, useState } from 'react'
import { Point2D, AttackZone, MapBackgroundMode, AttackExecutionState } from '../types/attack'

interface AttackerMapProps {
  zone: AttackZone | null
  canDrawZone: boolean
  executionState: AttackExecutionState
  jammingEnabled: boolean
  spoofingEnabled: boolean
  backgroundMode?: MapBackgroundMode
  orthophotoUrl?: string
  gridSize?: number
  onZoneChange: (zone: AttackZone) => void
}

export const AttackerMap: React.FC<AttackerMapProps> = ({
  zone,
  canDrawZone,
  executionState,
  jammingEnabled,
  spoofingEnabled,
  backgroundMode = 'grid',
  orthophotoUrl,
  gridSize = 20,
  onZoneChange
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dragCenter, setDragCenter] = useState<Point2D | null>(null)

  const viewBoxSize = 1000
  const cellStep = viewBoxSize / gridSize

  // Convert mouse event to internal 1000x1000 map coordinates
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>): Point2D | null => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.max(
      0,
      Math.min(viewBoxSize, Math.round(((e.clientX - rect.left) / rect.width) * viewBoxSize))
    )
    const y = Math.max(
      0,
      Math.min(viewBoxSize, Math.round(((e.clientY - rect.top) / rect.height) * viewBoxSize))
    )
    return { x, y }
  }

  // Start drawing attack zone on mouse down
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>): void => {
    if (!canDrawZone) return
    const pt = getCoordinates(e)
    if (!pt) return
    setDragCenter(pt)
    onZoneChange({ center: pt, radius: 60 })
  }

  // Resize attack zone radius while dragging mouse
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>): void => {
    if (!canDrawZone || !dragCenter) return
    const pt = getCoordinates(e)
    if (!pt) return
    const radius = Math.max(25, Math.round(Math.hypot(pt.x - dragCenter.x, pt.y - dragCenter.y)))
    onZoneChange({ center: dragCenter, radius })
  }

  // Finish drawing zone on mouse up
  const handleMouseUp = (): void => {
    setDragCenter(null)
  }

  // Render grid or orthophoto background (identical to Main Client)
  const renderMapBackground = (): React.ReactNode => {
    if (backgroundMode === 'orthophoto' && orthophotoUrl) {
      return (
        <image
          href={orthophotoUrl}
          x={0}
          y={0}
          width={viewBoxSize}
          height={viewBoxSize}
          preserveAspectRatio="none"
        />
      )
    }

    const elements: React.ReactNode[] = []

    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellStep
      const isMajor = i % 5 === 0

      elements.push(
        <line
          key={`v-${i}`}
          x1={pos}
          y1={0}
          x2={pos}
          y2={viewBoxSize}
          stroke={isMajor ? '#1e2631' : '#131820'}
          strokeWidth={isMajor ? 1.4 : 0.8}
        />,
        <line
          key={`h-${i}`}
          x1={0}
          y1={pos}
          x2={viewBoxSize}
          y2={pos}
          stroke={isMajor ? '#1e2631' : '#131820'}
          strokeWidth={isMajor ? 1.4 : 0.8}
        />
      )

      if (isMajor && i > 0 && i < gridSize) {
        elements.push(
          <text
            key={`lbl-x-${i}`}
            x={pos + 5}
            y={18}
            fill="#4b5868"
            fontSize="12"
            fontFamily="Consolas, monospace"
          >
            {pos}m
          </text>,
          <text
            key={`lbl-y-${i}`}
            x={8}
            y={pos - 6}
            fill="#4b5868"
            fontSize="12"
            fontFamily="Consolas, monospace"
          >
            {pos}m
          </text>
        )
      }
    }

    return (
      <g>
        <rect x={0} y={0} width={viewBoxSize} height={viewBoxSize} fill="#0b0e12" />
        {elements}
      </g>
    )
  }

  // Pick zone color based on active attack state and selected modes
  const zoneStrokeColor =
    executionState === 'active'
      ? '#ef4444'
      : executionState === 'paused'
        ? '#f59e0b'
        : jammingEnabled || spoofingEnabled
          ? '#f87171'
          : '#64748b'

  const zoneFillColor =
    executionState === 'active'
      ? 'rgba(239, 68, 68, 0.22)'
      : executionState === 'paused'
        ? 'rgba(245, 158, 11, 0.16)'
        : 'rgba(239, 68, 68, 0.10)'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        backgroundColor: '#0b0e12',
        border: '1px solid #222934'
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          cursor: canDrawZone ? 'crosshair' : 'default',
          display: 'block'
        }}
      >
        {/* 1. Background Layer */}
        {renderMapBackground()}

        {/* 2. Drawn Attack Zone */}
        {zone && (
          <g transform={`translate(${zone.center.x}, ${zone.center.y})`}>
            <circle
              r={zone.radius}
              fill={zoneFillColor}
              stroke={zoneStrokeColor}
              strokeWidth={2.5}
              strokeDasharray={executionState === 'active' ? undefined : '8,6'}
            />
            <circle r={5} fill={zoneStrokeColor} />
            <text
              x={10}
              y={-10}
              fill={zoneStrokeColor}
              fontSize="14"
              fontFamily="Consolas, monospace"
              fontWeight="bold"
            >
              {`(${zone.center.x}, ${zone.center.y}) R:${zone.radius}m`}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}