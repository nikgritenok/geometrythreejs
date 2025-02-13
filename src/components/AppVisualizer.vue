<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onMounted, ref } from 'vue'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import * as dat from 'dat.gui'

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

const projectionA = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({ color: 0xff8800 }),
)

const projectionB = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({ color: 0xff8800 }),
)

const lineGeometry = new THREE.BufferGeometry()
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
const line = new THREE.Line(lineGeometry, lineMaterial)

const angle = ref(0)
const azimuth = ref(0)

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

  projectionA.position.set(pointA.position.x, pointA.position.y, 0)
  projectionB.position.set(pointB.position.x, pointB.position.y, 0)

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
  const calculatedAngle = Math.acos(cosTheta) * (180 / Math.PI)

  const calculatedAzimuth = Math.atan2(AB.y, AB.x) * (180 / Math.PI)

  angle.value = calculatedAngle
  azimuth.value = calculatedAzimuth
}

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.getElementById('three-container')?.appendChild(renderer.domElement)

  camera.position.set(0, 2, 5)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = false

  const light = new THREE.AmbientLight(0xffffff, 1)
  scene.add(light)

  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  scene.add(pointA, pointB, line, projectionA, projectionB)

  const transformControlsA = new TransformControls(camera, renderer.domElement)
  transformControlsA.setSize(0.5)
  transformControlsA.attach(pointA)
  scene.add(transformControlsA.getHelper())

  transformControlsA.addEventListener('objectChange', updateLine)
  transformControlsA.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  const transformControlsB = new TransformControls(camera, renderer.domElement)
  transformControlsB.setSize(0.5)
  transformControlsB.attach(pointB)
  scene.add(transformControlsB.getHelper())

  transformControlsB.addEventListener('objectChange', updateLine)
  transformControlsB.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  const gui = new dat.GUI()

  const params = {
    pointAColor: '#ff0000',
    pointBColor: '#0000ff',
    projectionAColor: '#ff8800',
    projectionBColor: '#ff8800',
    lineColor: '#ffffff',
  }

  const colorsFolder = gui.addFolder('Цвета')

  colorsFolder.addColor(params, 'pointAColor').onChange((color) => {
    pointA.material.color.set(color)
  })
  colorsFolder.addColor(params, 'pointBColor').onChange((color) => {
    pointB.material.color.set(color)
  })
  colorsFolder.addColor(params, 'projectionAColor').onChange((color) => {
    projectionA.material.color.set(color)
  })
  colorsFolder.addColor(params, 'projectionBColor').onChange((color) => {
    projectionB.material.color.set(color)
  })
  colorsFolder.addColor(params, 'lineColor').onChange((color) => {
    line.material.color.set(color)
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
  <div class="info">
    <p>Угол наклона: {{ angle.toFixed(2) }}°</p>
    <p>Азимут: {{ azimuth.toFixed(2) }}°</p>
  </div>
</template>

<style scoped>
#three-container {
  width: 100vw;
  height: 100vh;
}

.info {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(117, 117, 117, 0.5);
  border-radius: 18px;
  color: white;
  padding: 10px;
  font-family: Arial, sans-serif;
  font-size: 16px;
}
</style>
