<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onMounted } from 'vue'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })

const pointA = new THREE.Mesh(
  new THREE.SphereGeometry(0.1),
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
)
const pointB = new THREE.Mesh(
  new THREE.SphereGeometry(0.1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff }),
)

const lineGeometry = new THREE.BufferGeometry()
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
const line = new THREE.Line(lineGeometry, lineMaterial)

pointA.position.set(-1, 0, 0)
pointB.position.set(1, 1, 1)
updateLine()

function updateLine() {
  const positions = new Float32Array([
    pointA.position.x,
    pointA.position.y,
    pointA.position.z,
    pointB.position.x,
    pointB.position.y,
    pointB.position.z,
  ])
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  lineGeometry.attributes.position.needsUpdate = true

  calculateAngleAndAzimuth()
}

function calculateAngleAndAzimuth() {
  const AB = new THREE.Vector3(
    pointB.position.x - pointA.position.x,
    pointB.position.y - pointA.position.y,
    pointB.position.z - pointA.position.z,
  )

  const normal = new THREE.Vector3(0, 0, 1)

  const cosTheta = AB.dot(normal) / (AB.length() * normal.length())
  const angle = Math.acos(cosTheta) * (180 / Math.PI)

  const azimuth = Math.atan2(AB.y, AB.x) * (180 / Math.PI)

  console.log(`Угол наклона: ${angle.toFixed(2)}°`)
  console.log(`Азимут: ${azimuth.toFixed(2)}°`)
}

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.getElementById('three-container')?.appendChild(renderer.domElement)

  camera.position.set(0, 2, 5)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const light = new THREE.AmbientLight(0xffffff, 1)
  scene.add(light)

  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  scene.add(pointA, pointB, line)

  const transformControlsA = new TransformControls(camera, renderer.domElement)
  transformControlsA.attach(pointA)
  scene.add(transformControlsA.getHelper())

  transformControlsA.addEventListener('objectChange', updateLine)
  transformControlsA.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  const transformControlsB = new TransformControls(camera, renderer.domElement)
  transformControlsB.attach(pointB)
  scene.add(transformControlsB.getHelper())

  transformControlsB.addEventListener('objectChange', updateLine)
  transformControlsB.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })
}

const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

onMounted(() => {
  init()
  animate()
})
</script>

<template>
  <div id="three-container"></div>
</template>

<style scoped>
#three-container {
  width: 100vw;
  height: 100vh;
}
</style>
