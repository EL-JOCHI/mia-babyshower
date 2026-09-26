import type { Point } from './layout'

interface RoomSize {
  roomWidth: number
  roomHeight: number
}

// Adding 0 turns -0 into 0.
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max) + 0

// The camera is the room point at the viewport's top-left corner.
export function clampCamera(camera: Point, room: RoomSize, vw: number, vh: number, margin: number): Point {
  const maxX = Math.max(0, room.roomWidth - vw)
  const maxY = Math.max(0, room.roomHeight - vh)
  return { x: clamp(camera.x, -margin, maxX + margin), y: clamp(camera.y, -margin, maxY + margin) }
}

// The camera that centres a room point in the viewport, without leaving the room.
export function cameraTargetFor(point: Point, room: RoomSize, vw: number, vh: number): Point {
  return clampCamera({ x: point.x - vw / 2, y: point.y - vh / 2 }, room, vw, vh, 0)
}

// §4 Three eras: 0 at the left end of the room, 1 at the right end.
export function horizontalPosition(cameraX: number, roomWidth: number, vw: number): number {
  const travel = roomWidth - vw
  if (travel <= 0) return 0
  return clamp(cameraX / travel, 0, 1)
}
