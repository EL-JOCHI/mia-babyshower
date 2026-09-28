import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import { glowTexture, pageEdgeTexture, pageTexture, pieceKinds, pieceTextures, type PieceKind } from './paperTextures'
import type { WorldPalette } from './palette'
import type { StageMix } from './stageMix'

export interface PieceLook {
  paper: THREE.MeshStandardMaterial
  ink: THREE.MeshBasicMaterial
  // Width over height.
  aspect: number
  light?: readonly [number, number]
}

// Shared by every station and made once per world: one unit plane, and one pair of materials per
// kind of paper piece. The stage lighting retints them all each frame.
export interface WorldResources {
  // A 1 by 1 plane whose bottom edge sits on y = 0, so a piece hinges at its foot.
  plane: THREE.PlaneGeometry
  pieces: Record<PieceKind, PieceLook>
  page: THREE.MeshStandardMaterial
  pageEdge: THREE.MeshStandardMaterial
  flame: THREE.MeshBasicMaterial
  doorGlow: THREE.MeshBasicMaterial
  dust: THREE.PointsMaterial
  // The paper whose tint follows the stage, and the ink that fades in with tinta.
  tinted: THREE.MeshStandardMaterial[]
  inked: THREE.MeshBasicMaterial[]
}

function createResources(): WorldResources {
  const plane = new THREE.PlaneGeometry(1, 1)
  plane.translate(0, 0.5, 0)

  const pieces = {} as Record<PieceKind, PieceLook>
  for (const kind of pieceKinds) {
    const textures = pieceTextures(kind)
    pieces[kind] = {
      paper: new THREE.MeshStandardMaterial({
        map: textures.paper,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        roughness: tuning.world.paper.roughness.piece,
      }),
      ink: new THREE.MeshBasicMaterial({
        map: textures.ink,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
      aspect: textures.aspect,
      light: textures.light,
    }
  }

  const { roughness } = tuning.world.paper
  const page = new THREE.MeshStandardMaterial({ map: pageTexture(), roughness: roughness.page })
  const pageEdge = new THREE.MeshStandardMaterial({ map: pageEdgeTexture(), roughness: roughness.page })
  const glow = glowTexture()
  const flame = new THREE.MeshBasicMaterial({
    map: glow,
    color: tokens.candle,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  })
  const doorGlow = new THREE.MeshBasicMaterial({ color: tokens.plum, side: THREE.DoubleSide })
  const dust = new THREE.PointsMaterial({
    map: glow,
    color: tokens.bone,
    size: tuning.world.dust.size,
    transparent: true,
    opacity: tuning.world.dust.opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  return {
    plane,
    pieces,
    page,
    pageEdge,
    flame,
    doorGlow,
    dust,
    tinted: [...pieceKinds.map((kind) => pieces[kind].paper), page, pageEdge],
    inked: pieceKinds.map((kind) => pieces[kind].ink),
  }
}

function disposeMaterial(material: THREE.Material & { map?: THREE.Texture | null }) {
  material.map?.dispose()
  material.dispose()
}

function disposeResources(r: WorldResources) {
  r.plane.dispose()
  for (const kind of pieceKinds) {
    disposeMaterial(r.pieces[kind].paper)
    disposeMaterial(r.pieces[kind].ink)
  }
  // The flame and the dust share one glow texture; disposing it twice is harmless.
  for (const material of [r.page, r.pageEdge, r.flame, r.doorGlow, r.dust]) disposeMaterial(material)
}

const paper = new THREE.Color()
const candle = new THREE.Color(tokens.candle)
const bone = new THREE.Color(tokens.bone)
const unlitDoor = new THREE.Color(tokens.plum)

// Retints the shared materials for the stage and the look: the paper warms, the ink fades in, the
// flames and the doorway light up, and after Cuento completo the doorway glows brighter (spec §6).
// Runs every frame without allocating.
export function applyStageMix(r: WorldResources, mix: StageMix, palette: WorldPalette, complete: boolean) {
  paper.copy(palette.paper.sketch).lerp(palette.paper.bone, mix.ink).lerp(palette.paper.warm, mix.warm)
  for (const material of r.tinted) material.color.copy(paper)
  for (const material of r.inked) material.opacity = mix.ink
  r.flame.opacity = mix.light
  r.doorGlow.color.copy(unlitDoor).lerp(candle, mix.light)
  if (complete) r.doorGlow.color.lerp(bone, tuning.world.family.completeGlow * mix.light)
  r.dust.color.copy(palette.dust).lerp(candle, mix.warm)
}

export function useWorldResources(): WorldResources {
  const [resources] = useState(createResources)
  useEffect(() => () => disposeResources(resources), [resources])
  return resources
}
