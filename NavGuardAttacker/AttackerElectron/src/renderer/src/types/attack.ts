export interface Point2D {
  x: number
  y: number
}

// Drawn circular attack zone on the map
export interface AttackZone {
  center: Point2D
  radius: number
}

export type MapBackgroundMode = 'grid' | 'orthophoto'

export type AttackExecutionState = 'idle' | 'active' | 'paused'