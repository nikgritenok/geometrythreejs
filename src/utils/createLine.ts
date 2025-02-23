import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import * as THREE from 'three'

export const createLine = (positions: number[], color: number, linewidth = 2) => {
  const geometry = new LineGeometry()
  geometry.setPositions(positions)

  const material = new LineMaterial({
    color,
    linewidth,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  })

  return new Line2(geometry, material)
}
