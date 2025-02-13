<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onMounted, watch } from 'vue'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import * as dat from 'dat.gui'
import { useGeometryStore } from '@/stores/useGeometryStore'

const geometryStore = useGeometryStore()

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })

const pointA = new THREE.Mesh(
  new THREE.SphereGeometry(geometryStore.pointARadius),
  new THREE.MeshBasicMaterial({ color: geometryStore.pointAColor }),
)
const pointB = new THREE.Mesh(
  new THREE.SphereGeometry(geometryStore.pointBRadius),
  new THREE.MeshBasicMaterial({ color: geometryStore.pointBColor }),
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
lineGeometry.setPositions(geometryStore.linePositions)

const lineMaterial = new LineMaterial({
  color: geometryStore.lineColor,
  linewidth: geometryStore.lineThickness,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
})

const line = new Line2(lineGeometry, lineMaterial)

geometryStore.setPointAPosition(-1, 0, 0)
geometryStore.setPointBPosition(1, 1, 1)
pointA.position.copy(geometryStore.pointA)
pointB.position.copy(geometryStore.pointB)
geometryStore.updateAngles()

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

  transformControlsA.addEventListener('objectChange', () => {
    geometryStore.setPointAPosition(pointA.position.x, pointA.position.y, pointA.position.z)
  })
  transformControlsA.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  const transformControlsB = new TransformControls(camera, renderer.domElement)
  transformControlsB.setSize(0.5)
  transformControlsB.attach(pointB)
  scene.add(transformControlsB.getHelper())

  transformControlsB.addEventListener('objectChange', () => {
    geometryStore.setPointBPosition(pointB.position.x, pointB.position.y, pointB.position.z)
  })
  transformControlsB.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  const gui = new dat.GUI()

  const params = {
    pointAColor: geometryStore.pointAColor,
    pointBColor: geometryStore.pointBColor,
    projectionAColor: '#ff8800',
    projectionBColor: '#ff8800',
    lineColor: geometryStore.lineColor,
    lineThickness: geometryStore.lineThickness,
    pointARadius: geometryStore.pointARadius,
    pointBRadius: geometryStore.pointBRadius,
    projectionARadius: 0.05,
    projectionBRadius: 0.05,
  }

  const colorsFolder = gui.addFolder('Цвета')
  colorsFolder.addColor(params, 'pointAColor').onChange((color) => {
    geometryStore.pointAColor = color
    pointA.material.color.set(color)
    console.log(geometryStore.pointAColor)
  })
  colorsFolder.addColor(params, 'pointBColor').onChange((color) => {
    geometryStore.pointBColor = color
    pointB.material.color.set(color)
  })
  colorsFolder.addColor(params, 'projectionAColor').onChange((color) => {
    projectionA.material.color.set(color)
  })
  colorsFolder.addColor(params, 'projectionBColor').onChange((color) => {
    projectionB.material.color.set(color)
  })
  colorsFolder.addColor(params, 'lineColor').onChange((color) => {
    geometryStore.lineColor = color
    line.material.color.set(color)
  })

  const sizeFolder = gui.addFolder('Размеры')
  sizeFolder.add(params, 'pointARadius', 0.01, 1).onChange((size) => {
    geometryStore.pointARadius = size
    pointA.geometry = new THREE.SphereGeometry(size)
  })
  sizeFolder.add(params, 'pointBRadius', 0.01, 1).onChange((size) => {
    geometryStore.pointBRadius = size
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
  PointA.add(pointA.position, 'x', -10, 10).onChange(geometryStore.updateAngles)
  PointA.add(pointA.position, 'y', -10, 10).onChange(geometryStore.updateAngles)
  PointA.add(pointA.position, 'z', -10, 10).onChange(geometryStore.updateAngles)
  PointB.add(pointB.position, 'x', -10, 10).onChange(geometryStore.updateAngles)
  PointB.add(pointB.position, 'y', -10, 10).onChange(geometryStore.updateAngles)
  PointB.add(pointB.position, 'z', -10, 10).onChange(geometryStore.updateAngles)
  positionFolder.open()

  const lineFolder = gui.addFolder('Линия')
  lineFolder.add(params, 'lineThickness', 1, 10).onChange((thickness) => {
    geometryStore.lineThickness = thickness
    line.material.linewidth = thickness
    console.log(geometryStore.lineThickness)
  })
}

onMounted(() => {
  init()
  animate()

  watch(
    () => geometryStore.linePositions,
    (positions) => {
      lineGeometry.setPositions(positions)
    },
    { deep: true },
  )
})

const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
</script>

<template>
  <div id="three-container"></div>
  <div class="info">
    <p>Угол наклона: {{ geometryStore.angle.toFixed(2) }}°</p>
    <p>Азимут: {{ geometryStore.azimuth.toFixed(2) }}°</p>
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
