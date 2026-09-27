import { tuning } from '../tuning'
import { resolveInvite } from './invite'

export interface BookEnvironment {
  reducedMotion: boolean
  // The screen's height in CSS pixels (window.innerHeight).
  height: number
  // Whether WebGL can start. Asked last, since the check creates a context.
  webgl: () => boolean
}

// Design §9: whether a screen this tall (CSS pixels) shows a whole page at
// tuning.world.page.minScale between the HUD and the signposts.
export function fitsBook(height: number): boolean {
  return height >= tuning.world.minHeightPx
}

// Design §2: the 3D pop-up book, or the flat room with reduced motion, without WebGL, or on a
// screen too short for a readable page.
export function wantsBook({ reducedMotion, height, webgl }: BookEnvironment): boolean {
  return !reducedMotion && fitsBook(height) && webgl()
}

// Design §2 Loading: a guest on a day link who will get the book starts fetching it at page start,
// alongside the entry script, instead of once the room has rendered.
export function shouldPreloadWorld(search: string, env: BookEnvironment): boolean {
  return resolveInvite(search).kind === 'day' && wantsBook(env)
}

// Spec §7: the full book, the flat room's cards over the live 3D attic (the backdrop), or over the
// paper diorama.
export type RoomLevel = 'book' | 'backdrop' | 'diorama'

export interface RoomEnvironment extends BookEnvironment {
  // The book gave way this visit: it did not get ready within loadTimeoutMs, or the screen turned
  // too short. The live attic may follow.
  bookGaveWay: boolean
  // The 3D failed this visit: the WebGL context was lost, the renderer could not start, an error was
  // caught, or the chunk failed to load. No retry.
  failed: boolean
  // Level 2's scene has arrived and drawn its first frame.
  backdropReady: boolean
}

export function roomLevel(env: RoomEnvironment): RoomLevel {
  if (env.reducedMotion || env.failed || !env.webgl()) return 'diorama'
  if (fitsBook(env.height) && !env.bookGaveWay) return 'book'
  return env.backdropReady ? 'backdrop' : 'diorama'
}

// Whether the flat room loads the live attic behind its cards (it shows once it is ready).
export function wantsBackdrop(env: Omit<RoomEnvironment, 'backdropReady'>): boolean {
  return roomLevel({ ...env, backdropReady: true }) === 'backdrop'
}

// The QR's size in the book, in design pixels: at the smallest page scale it is still drawn at
// tuning.qr.minPx on screen (the flat room draws its pages at full size, so it needs no more).
export const bookQrPx = Math.ceil(tuning.qr.minPx / tuning.world.page.minScale)
