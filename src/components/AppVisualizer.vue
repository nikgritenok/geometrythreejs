<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onMounted, ref } from 'vue'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
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

const lineGeometry = new LineGeometry()
lineGeometry.setPositions([
  pointA.position.x,
  pointA.position.y,
  pointA.position.z,
  pointB.position.x,
  pointB.position.y,
  pointB.position.z,
])

const lineMaterial = new LineMaterial({
  color: 0xffffff,
  linewidth: 5,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
})

const line = new Line2(lineGeometry, lineMaterial)

const angle = ref(0)
const azimuth = ref(0)

pointA.position.set(-1, 0, 0)
pointB.position.set(1, 1, 1)
updateLine()

function updateLine() {
  lineGeometry.setPositions([
    pointA.position.x,
    pointA.position.y,
    pointA.position.z,
    pointB.position.x,
    pointB.position.y,
    pointB.position.z,
  ])
  line.geometry = lineGeometry

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
    lineThickness: 2,
    pointARadius: 0.1,
    pointBRadius: 0.1,
    projectionARadius: 0.05,
    projectionBRadius: 0.05,
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

  const sizeFolder = gui.addFolder('Размеры')

  sizeFolder.add(params, 'pointARadius', 0.01, 1).onChange((size) => {
    pointA.geometry = new THREE.SphereGeometry(size)
  })
  sizeFolder.add(params, 'pointBRadius', 0.01, 1).onChange((size) => {
    pointB.geometry = new THREE.SphereGeometry(size)
  })
  sizeFolder.add(params, 'projectionARadius', 0.01, 1).onChange((size) => {
    projectionA.geometry = new THREE.SphereGeometry(size)
  })
  sizeFolder.add(params, 'projectionBRadius', 0.01, 1).onChange((size) => {
    projectionB.geometry = new THREE.SphereGeometry(size)
  })

  const positionFolder = gui.addFolder('Позиции')

  const PointA = positionFolder.addFolder('Точка A')
  const PointB = positionFolder.addFolder('Точка B')

  PointA.add(pointA.position, 'x', -10, 10).onChange(updateLine)
  PointA.add(pointA.position, 'y', -10, 10).onChange(updateLine)
  PointA.add(pointA.position, 'z', -10, 10).onChange(updateLine)
  PointB.add(pointB.position, 'x', -10, 10).onChange(updateLine)
  PointB.add(pointB.position, 'y', -10, 10).onChange(updateLine)
  PointB.add(pointB.position, 'z', -10, 10).onChange(updateLine)
  positionFolder.open()

  const lineFolder = gui.addFolder('Линия')

  lineFolder.add(params, 'lineThickness', 1, 10).onChange((thickness) => {
    line.material.linewidth = thickness
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
