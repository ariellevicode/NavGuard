// 2D map coordinate (in meters / grid units)
export interface Point2D {
  x: number
  y: number
}

// Real-time helicopter state
export interface HelicopterState {
  position: Point2D
  headingDeg: number
  isFlying: boolean
  progress: number
}

// Map background rendering mode
export type MapBackgroundMode = 'grid' | 'orthophoto'