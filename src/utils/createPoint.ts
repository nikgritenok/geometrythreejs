import * as THREE from 'three'

export const createPoint = (radius: number, color: number) => {
  return new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshBasicMaterial({ color }))
}
