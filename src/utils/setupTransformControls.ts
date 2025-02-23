import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/Addons.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { updateGui } from './guiConfig'

export const setupTransformControls = (
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  controls: OrbitControls,
  point: THREE.Mesh,
  geometryStoreSetter: (x: number, y: number, z: number) => void,
  projectionRefs: { projectionA: THREE.Mesh; projectionB: THREE.Mesh },
  scene: THREE.Scene,
) => {
  const transformControls = new TransformControls(camera, renderer.domElement)
  transformControls.setSize(0.5)
  transformControls.attach(point)
  scene.add(transformControls.getHelper())

  transformControls.addEventListener('objectChange', () => {
    geometryStoreSetter(point.position.x, point.position.y, point.position.z)
    projectionRefs.projectionA.position.copy(projectionRefs.projectionA.position)
    projectionRefs.projectionB.position.copy(projectionRefs.projectionB.position)

    updateGui()
  })

  transformControls.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  return transformControls
}
