import { useFrame } from '@react-three/fiber'
import { memo, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import { familySheet, familySheetLayout, type SheetLayout } from './familySheet'
import { familySpots, foldUp, walkBegins, walkPose, type FigureSpot, type WalkPose } from './familyWalk'

interface Props {
  // The Familia station's pop-up springs: the figures set off once the door stands.
  springs: RefObject<{ angle: Float32Array }>
  // The door piece's place among the springs.
  index: number
  // The camera's place along the path, and the station's: the door already stands while the guest
  // is on the page before (the pop-up range reaches the next station), so the walk waits for the
  // camera to arrive, where the guest can see it.
  viewRef: RefObject<{ progress: number }>
  at: number
  // The family's shaders are compiled and it shows (DeferredDetail): the walk waits for it.
  shown: boolean
}

// A plane covering the figure's cell (the figure and its margin), with its feet on y = 0.
function figureGeometry(spot: FigureSpot, layout: SheetLayout, index: number): THREE.PlaneGeometry {
  const cell = layout.cells[index]!
  const pad = layout.pad * spot.scale
  const geometry = new THREE.PlaneGeometry(spot.width + pad * 2, spot.height + pad * 2)
  geometry.translate(0, spot.height / 2, 0)
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, cell.u0 + uv.getX(i) * (cell.u1 - cell.u0), cell.v0 + uv.getY(i) * (cell.v1 - cell.v0))
  }
  return geometry
}

function createFamily(spots: readonly FigureSpot[]) {
  const layout = familySheetLayout()
  const sheet = familySheet(layout)
  const { alphaTest } = tuning.world.family
  return {
    sheet,
    geometries: spots.map((spot, i) => figureGeometry(spot, layout, i)),
    // Unlit: the figures are silhouettes, backlit by the door's glow and their candle rim.
    paper: new THREE.MeshBasicMaterial({ map: sheet, alphaTest, side: THREE.DoubleSide }),
    edge: new THREE.MeshBasicMaterial({ map: sheet, alphaTest, color: tokens.shadow, side: THREE.DoubleSide }),
  }
}

type FamilyParts = ReturnType<typeof createFamily>

function disposeFamily(parts: FamilyParts) {
  parts.sheet.dispose()
  parts.paper.dispose()
  parts.edge.dispose()
  for (const geometry of parts.geometries) geometry.dispose()
}

// One scratch pose, reused every frame.
const pose: WalkPose = { x: 0, z: 0, bob: 0, done: false }
// A figure lying flat, folded back about its feet like the book's pop-up pieces.
const flat = -Math.PI / 2

// Spec §6: the paper family as thin cutouts standing in the Familia doorway. They are children of the
// door piece, so once standing they fold with its pop-up spring. The door already stands from the
// page before, so the family waits lying flat, out of sight; the first time the camera arrives with
// the door standing, each figure folds up from the page with the pop-up spring and walks in, one
// after another, and rests. That plays once a visit, and not before the family shows: it mounts after
// the book's first frame and shows once its shaders are compiled.
export const FamilyCutouts = memo(function FamilyCutouts({ springs, index, viewRef, at, shown }: Props) {
  const [spots] = useState(familySpots)
  const [parts] = useState(() => createFamily(spots))
  useEffect(() => () => disposeFamily(parts), [parts])
  const figures = useRef<(THREE.Group | null)[]>([])
  const walk = useRef({ started: false, elapsed: 0, done: false })
  const { standY, edge, layer } = tuning.world.family

  // Before the walk, every figure waits a step out on the page, lying flat and hidden.
  useLayoutEffect(() => {
    spots.forEach((spot, i) => {
      const figure = figures.current[i]
      if (!figure) return
      figure.position.set(spot.start[0], standY, spot.start[1])
      figure.rotation.x = flat
      figure.visible = false
    })
  }, [spots, standY])

  useFrame((_, delta) => {
    const state = walk.current
    if (state.done) return
    if (!state.started) {
      if (!walkBegins(springs.current.angle[index]!, viewRef.current.progress, at, shown)) return
      state.started = true
    }
    state.elapsed += Math.min(delta, 0.1)
    let done = true
    for (let i = 0; i < spots.length; i++) {
      const spot = spots[i]!
      walkPose(spot, state.elapsed, pose)
      const fold = foldUp(spot, state.elapsed)
      const figure = figures.current[i]
      if (figure) {
        figure.position.set(pose.x, standY + pose.bob, pose.z)
        figure.rotation.x = flat * (1 - fold)
        figure.visible = fold > 0
      }
      if (!pose.done) done = false
    }
    state.done = done
  })

  return (
    <group>
      {spots.map((spot, i) => (
        <group
          key={spot.id}
          ref={(group) => {
            figures.current[i] = group
          }}
        >
          <mesh geometry={parts.geometries[i]} material={parts.paper} position-z={i * layer} />
          <mesh geometry={parts.geometries[i]} material={parts.edge} position-z={i * layer - edge} />
        </group>
      ))}
    </group>
  )
})
