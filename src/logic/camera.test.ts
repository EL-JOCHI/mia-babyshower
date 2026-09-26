import { describe, expect, it } from 'vitest'
import { clampCamera, cameraTargetFor, horizontalPosition } from './camera'

const room = { roomWidth: 2142, roomHeight: 1110 }

describe('camera math (§4)', () => {
  it('clamps travel to the room plus the edge margin', () => {
    expect(clampCamera({ x: -500, y: -500 }, room, 360, 740, 24)).toEqual({ x: -24, y: -24 })
    expect(clampCamera({ x: 9999, y: 9999 }, room, 360, 740, 24)).toEqual({ x: 2142 - 360 + 24, y: 1110 - 740 + 24 })
  })

  it('centres a point in the viewport and stays inside the room', () => {
    expect(cameraTargetFor({ x: 1000, y: 555 }, room, 360, 740)).toEqual({ x: 820, y: 185 })
    expect(cameraTargetFor({ x: 10, y: 10 }, room, 360, 740)).toEqual({ x: 0, y: 0 })
  })

  it('maps the camera to 0 at the left end and 1 at the right end', () => {
    expect(horizontalPosition(0, 2142, 360)).toBe(0)
    expect(horizontalPosition(2142 - 360, 2142, 360)).toBe(1)
    expect(horizontalPosition(-24, 2142, 360)).toBe(0)
    expect(horizontalPosition(891, 2142, 360)).toBeCloseTo(0.5, 5)
  })

  it('treats a room no wider than the viewport as position 0', () => {
    expect(horizontalPosition(0, 300, 360)).toBe(0)
  })
})
