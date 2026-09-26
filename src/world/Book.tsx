import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { tokens, tuning } from '../tuning'
import { pageHeight } from './bookPath'
import type { WorldResources } from './resources'

const segments = 160

// The open pages as one bent sheet across both halves of the book.
function pagesGeometry(): THREE.PlaneGeometry {
  const { pageWidth, pageDepth } = tuning.world.book
  const geometry = new THREE.PlaneGeometry(pageWidth * 2, pageDepth, segments, 1)
  geometry.rotateX(-Math.PI / 2)
  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) position.setY(i, pageHeight(position.getX(i)))
  geometry.computeVertexNormals()
  return geometry
}

// The stacked page edges along the front of the book, from the cover up to the page surface.
function edgeGeometry(): THREE.PlaneGeometry {
  const { pageWidth, pageDepth, coverTop } = tuning.world.book
  const geometry = new THREE.PlaneGeometry(pageWidth * 2, 1, segments, 1)
  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    const top = position.getY(i) > 0
    position.setY(i, top ? pageHeight(position.getX(i)) : coverTop)
    position.setZ(i, pageDepth / 2)
  }
  geometry.computeVertexNormals()
  const uv = geometry.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 40)
  return geometry
}

function createBook() {
  const { pageWidth, pageDepth, coverTop, coverMargin } = tuning.world.book
  const cloth = new THREE.MeshStandardMaterial({
    color: new THREE.Color(tokens.plum).lerp(new THREE.Color(tokens.deepRose), tuning.world.tints.cloth),
    roughness: 0.85,
  })
  return {
    cloth,
    pages: pagesGeometry(),
    edge: edgeGeometry(),
    cover: new THREE.BoxGeometry(pageWidth * 2 + coverMargin * 2, coverTop, pageDepth + coverMargin * 2),
  }
}

// Design §1: a giant open book lying on the attic floor.
export function Book({ resources }: { resources: WorldResources }) {
  const [book] = useState(createBook)
  useEffect(
    () => () => {
      book.cloth.dispose()
      book.pages.dispose()
      book.edge.dispose()
      book.cover.dispose()
    },
    [book],
  )
  const { coverTop } = tuning.world.book
  return (
    <group>
      <mesh geometry={book.cover} material={book.cloth} position-y={coverTop / 2} castShadow receiveShadow />
      <mesh geometry={book.pages} material={resources.page} receiveShadow />
      <mesh geometry={book.edge} material={resources.pageEdge} />
    </group>
  )
}
