import React, { useRef, useState } from 'react'
import { Point2D, HelicopterState, MapBackgroundMode } from '../types/navigation'

interface VirtualMapProps {
  pointA: Point2D | null
  pointB: Point2D | null
  helicopter: HelicopterState | null
  backgroundMode?: MapBackgroundMode
  orthophotoUrl?: string
  gridSize?: number
  onMapClick: (clickedPoint: Point2D) => void
}

export const VirtualMap: React.FC<VirtualMapProps> = ({
  pointA,
  pointB,
  helicopter,
  backgroundMode = 'grid',
  orthophotoUrl,
  gridSize = 20,
  onMapClick
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [rotorAngle, setRotorAngle] = useState<number>(0)

  const viewBoxSize = 1000
  const cellStep = viewBoxSize / gridSize

  // Animate main rotor rotation while flying
  React.useEffect(() => {
    if (!helicopter?.isFlying) return
    const timer = setInterval(() => {
      setRotorAngle((prev) => (prev + 35) % 360)
    }, 30)
    return () => clearInterval(timer)
  }, [helicopter?.isFlying])

  // Convert screen click to internal 1000x1000 map coordinates
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>): void => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.max(
      0,
      Math.min(viewBoxSize, Math.round(((e.clientX - rect.left) / rect.width) * viewBoxSize))
    )
    const y = Math.max(
      0,
      Math.min(viewBoxSize, Math.round(((e.clientY - rect.top) / rect.height) * viewBoxSize))
    )
    onMapClick({ x, y })
  }

  // Modular background layer: grid board now, satellite orthophoto in the future
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
        onClick={handleSvgClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          display: 'block'
        }}
      >
        {/* 1. Background Layer */}
        {renderMapBackground()}

        {/* 2. Flight Route Line */}
        {pointA && pointB && (
          <g>
            <line
              x1={pointA.x}
              y1={pointA.y}
              x2={pointB.x}
              y2={pointB.y}
              stroke="#475569"
              strokeWidth={2}
              strokeDasharray="8,6"
            />
            {helicopter && (
              <line
                x1={pointA.x}
                y1={pointA.y}
                x2={helicopter.position.x}
                y2={helicopter.position.y}
                stroke="#10b981"
                strokeWidth={3}
              />
            )}
          </g>
        )}

        {/* 3. Origin Marker (Coordinates only) */}
        {pointA && (
          <g transform={`translate(${pointA.x}, ${pointA.y})`}>
            <circle r={8} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
            <text
              x={14}
              y={4}
              fill="#10b981"
              fontSize="14"
              fontFamily="Consolas, monospace"
              fontWeight="bold"
            >
              {`(${pointA.x}, ${pointA.y})`}
            </text>
          </g>
        )}

        {/* 4. Target Marker (Coordinates only) */}
        {pointB && (
          <g transform={`translate(${pointB.x}, ${pointB.y})`}>
            <circle r={8} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
            <text
              x={14}
              y={4}
              fill="#f87171"
              fontSize="14"
              fontFamily="Consolas, monospace"
              fontWeight="bold"
            >
              {`(${pointB.x}, ${pointB.y})`}
            </text>
          </g>
        )}

        {/* 5. Helicopter Icon */}
        {helicopter && (
          <g
            transform={`translate(${helicopter.position.x}, ${helicopter.position.y}) rotate(${helicopter.headingDeg})`}
          >
            <circle r={20} fill="rgba(0, 210, 255, 0.12)" stroke="#00d2ff" strokeWidth={1} />
            <path
              d="M 0 -15 L 5 -4 L 4 8 L 1.5 20 L 6 22 L 6 24 L -6 24 L -6 22 L -1.5 20 L -4 8 L -5 -4 Z"
              fill="#facc15"
              stroke="#0b0e12"
              strokeWidth={1.2}
            />
            <g transform={`rotate(${rotorAngle})`}>
              <line x1={-19} y1={0} x2={19} y2={0} stroke="#e2e8f0" strokeWidth={2.2} />
              <line x1={0} y1={-19} x2={0} y2={19} stroke="#e2e8f0" strokeWidth={2.2} />
            </g>
            <circle r={2.5} fill="#0b0e12" stroke="#00d2ff" strokeWidth={1.5} />
          </g>
        )}
      </svg>
    </div>
  )
}