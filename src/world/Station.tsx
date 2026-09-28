import { Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef, type ReactNode, type RefObject } from 'react'
import * as THREE from 'three'
import type { LandmarkId } from '../logic/layout'
import { tuning, type PieceSpec } from '../tuning'
import { DeferredDetail } from './DeferredDetail'
import { FamilyCutouts } from './FamilyCutouts'
import type { WorldResources } from './resources'
import type { ShadowState } from './StageLighting'

interface Props {
  id: LandmarkId
  // The station's place along the path, 0 to 1.
  at: number
  anchor: THREE.Vector3
  viewRef: RefObject<{ progress: number }>
  // Nothing pops up until the cover opens.
  awake: boolean
  resources: WorldResources
  // The paper pieces cast the candle's shadow: moving one makes the shadow map stale.
  shadowRef: RefObject<ShadowState>
  // The book has drawn its first frame: the Familia station's paper family may mount (DeferredDetail).
  detail: boolean
  // Tapping this station's door piece (the Familia station's) starts Misha's scratch (spec §6).
  onDoorTap?: () => void
  children: ReactNode
}

const flat = -Math.PI / 2
const { fadeFrom, fadeTo } = tuning.world.page
// Html keeps the page in the DOM when it would hide it: the text must stay reachable.
const keepVisible = () => {}

function PaperPiece({
  piece,
  resources,
  hinge,
  onTap,
  children,
}: {
  piece: PieceSpec
  resources: WorldResources
  hinge: (group: THREE.Group | null) => void
  onTap?: () => void
  children?: ReactNode
}) {
  const look = resources.pieces[piece.kind]
  const height = piece.height
  const width = height * look.aspect
  const scaleX = piece.flip ? -width : width
  const light = look.light
  const flameSize = width * tuning.world.flame.scale
  const tap = onTap
    ? (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onTap()
      }
    : undefined
  return (
    <group ref={hinge} position={[piece.x, 0, piece.z]} rotation-x={flat}>
      <mesh geometry={resources.plane} material={look.paper} scale={[scaleX, height, 1]} castShadow onClick={tap} />
      <mesh geometry={resources.plane} material={look.ink} scale={[scaleX, height, 1]} position-z={0.004} />
      {piece.kind === 'candle' && light && (
        <mesh
          geometry={resources.plane}
          material={resources.flame}
          position={[0, light[1] * height - flameSize * tuning.world.flame.sink, 0.02]}
          scale={flameSize}
        />
      )}
      {piece.kind === 'door' && (
        <mesh
          geometry={resources.plane}
          material={resources.doorGlow}
          position-z={-0.03}
          scale={[width * tuning.world.doorway.width, height * tuning.world.doorway.height, 1]}
        />
      )}
      {children}
    </group>
  )
}

// Design §1 and §2: a pop-up station. Paper cut-outs and the page itself fold up from the book as
// the camera arrives, with a springy overshoot, and lie flat again once it moves on. The page is
// the landmark's real HTML, placed in 3D, so text stays sharp and keyboards and screen readers
// reach everything. At the Familia station the paper family stands in the doorway (spec §6).
export function Station({ id, at, anchor, viewRef, awake, resources, shadowRef, detail, onDoorTap, children }: Props) {
  const pieces: readonly PieceSpec[] = tuning.world.pieces[id]
  const doorIndex = pieces.findIndex((piece) => piece.kind === 'door')
  const { cardPx, slotPx, cardWidth, lift, zIndexRange } = tuning.world.page
  const unitsPerPx = cardWidth / cardPx
  const hinges = useRef<(THREE.Group | null)[]>([])
  const slot = useRef<HTMLDivElement | null>(null)
  const shown = useRef(-1)
  // 0 is flat, 1 is standing. The page is the last hinge.
  const springs = useRef({ angle: new Float32Array(pieces.length + 1), velocity: new Float32Array(pieces.length + 1) })

  useFrame((_, delta) => {
    const { range, stiffness, damping, stagger, stillEps } = tuning.world.popUp
    const dt = Math.min(delta, 1 / 30)
    const target = awake && Math.abs(viewRef.current.progress - at) < range ? 1 : 0
    const { angle, velocity } = springs.current
    const count = angle.length
    let piecesMoved = false
    for (let i = 0; i < count; i++) {
      // Pieces further back rise a little later.
      const k = stiffness * (1 - (stagger * i) / count)
      const before = angle[i]!
      velocity[i]! += (k * (target - before) - damping * velocity[i]!) * dt
      angle[i]! += velocity[i]! * dt
      // The page (the last hinge) casts no shadow; the paper pieces do.
      if (i < count - 1 && Math.abs(angle[i]! - before) > stillEps) piecesMoved = true
      const hinge = hinges.current[i]
      if (hinge) hinge.rotation.x = flat * (1 - angle[i]!)
    }
    if (piecesMoved) shadowRef.current.stale = true
    // A page lying flat far away would show as a sliver, so it fades out as it folds down. It stays
    // in the DOM and focusable: focus brings the camera, and the page rises again.
    const page = slot.current
    const opacity = THREE.MathUtils.smoothstep(angle[count - 1]!, fadeFrom, fadeTo)
    if (page && Math.abs(opacity - shown.current) > 0.01) {
      shown.current = opacity
      page.style.opacity = String(opacity)
      page.toggleAttribute('data-flat', opacity < 0.5)
    }
  })

  const setHinge = (i: number) => (group: THREE.Group | null) => {
    hinges.current[i] = group
  }

  return (
    <group position={anchor}>
      {pieces.map((piece, i) => (
        <PaperPiece key={i} piece={piece} resources={resources} hinge={setHinge(i)} onTap={i === doorIndex ? onDoorTap : undefined}>
          {id === 'familia' && i === doorIndex && (
            <DeferredDetail ready={detail}>
              {(shown) => <FamilyCutouts springs={springs} index={doorIndex} viewRef={viewRef} at={at} shown={shown} />}
            </DeferredDetail>
          )}
        </PaperPiece>
      ))}
      <group ref={setHinge(pieces.length)} rotation-x={flat}>
        <Html
          transform
          // drei draws 400 / distanceFactor CSS pixels per world unit.
          distanceFactor={unitsPerPx * 400}
          position={[0, (slotPx * unitsPerPx) / 2 + lift, 0]}
          zIndexRange={[...zIndexRange]}
          occlude={false}
          onOcclude={keepVisible}
        >
          <div ref={slot} className="station-slot" style={{ width: cardPx, height: slotPx, opacity: 0 }}>
            <section className={`landmark landmark-${id} station-page`} data-landmark-id={id}>
              {children}
            </section>
          </div>
        </Html>
      </group>
    </group>
  )
}
