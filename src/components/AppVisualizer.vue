<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onMounted, watch } from 'vue'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { useGeometryStore } from '@/stores/useGeometryStore'
import { setupDatGui } from '@/utils/guiConfig'

// Подключаем хранилище геометрии
const geometryStore = useGeometryStore()

// Создание сцены, камеры и рендера
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })

// Создаем точки A и B с настройками из хранилища
const pointA = new THREE.Mesh(
  new THREE.SphereGeometry(geometryStore.pointARadius),
  new THREE.MeshBasicMaterial({ color: geometryStore.pointAColor }),
)
const pointB = new THREE.Mesh(
  new THREE.SphereGeometry(geometryStore.pointBRadius),
  new THREE.MeshBasicMaterial({ color: geometryStore.pointBColor }),
)

// Создание проекций точек
const projectionA = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({ color: 0xff8800 }),
)
const projectionB = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({ color: 0xff8800 }),
)

// Создание линии между точками
const lineGeometry = new LineGeometry()
lineGeometry.setPositions(geometryStore.linePositions)

const lineMaterial = new LineMaterial({
  color: geometryStore.lineColor,
  linewidth: 2,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
})

const line = new Line2(lineGeometry, lineMaterial)

// Установка начальных позиций точек
geometryStore.setPointAPosition(-1, 0, 0)
geometryStore.setPointBPosition(1, 1, 1)
pointA.position.copy(geometryStore.pointA)
pointB.position.copy(geometryStore.pointB)
geometryStore.updateAngles()

// Функция инициализации сцены
const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.getElementById('three-container')?.appendChild(renderer.domElement)

  camera.position.set(0, 2, 5)

  // Добавление управления камерой
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = false

  // Добавление освещения
  const light = new THREE.AmbientLight(0xffffff, 1)
  scene.add(light)

  // Вспомогательные элементы: сетка и оси
  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // Добавление объектов на сцену
  scene.add(pointA, pointB, line, projectionA, projectionB)

  // Управление трансформацией точки A
  const transformControlsA = new TransformControls(camera, renderer.domElement)
  transformControlsA.setSize(0.5)
  transformControlsA.attach(pointA)
  scene.add(transformControlsA.getHelper())

  transformControlsA.addEventListener('objectChange', () => {
    geometryStore.setPointAPosition(pointA.position.x, pointA.position.y, pointA.position.z)
    projectionA.position.copy(geometryStore.projectionA)
    projectionB.position.copy(geometryStore.projectionB)
  })
  transformControlsA.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  // Управление трансформацией точки B
  const transformControlsB = new TransformControls(camera, renderer.domElement)
  transformControlsB.setSize(0.5)
  transformControlsB.attach(pointB)
  scene.add(transformControlsB.getHelper())

  transformControlsB.addEventListener('objectChange', () => {
    geometryStore.setPointBPosition(pointB.position.x, pointB.position.y, pointB.position.z)
    projectionA.position.copy(geometryStore.projectionA)
    projectionB.position.copy(geometryStore.projectionB)
  })
  transformControlsB.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })

  // Настройка панели управления
  setupDatGui({ pointA, pointB, projectionA, projectionB, line })

  // Адаптация рендера под изменения размера окна
  const onWindowResize = () => {
    const width = window.innerWidth
    const height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  window.addEventListener('resize', onWindowResize)
}

// Хук для монтирования компонента
onMounted(() => {
  // Загрузка сохраненных настроек

  console.log('onMounted')
  const savedSettings = localStorage.getItem('threeSettings')
  if (savedSettings) {
    const settings = JSON.parse(savedSettings)

    geometryStore.pointAColor = settings.pointAColor
    geometryStore.pointBColor = settings.pointBColor
    geometryStore.pointARadius = settings.pointARadius
    geometryStore.pointBRadius = settings.pointBRadius
    geometryStore.lineColor = settings.lineColor
    geometryStore.lineThickness = settings.lineThickness

    geometryStore.setPointAPosition(settings.pointA.x, settings.pointA.y, settings.pointA.z)
    geometryStore.setPointBPosition(settings.pointB.x, settings.pointB.y, settings.pointB.z)
    lineGeometry.setPositions(geometryStore.linePositions)
  }

  init()

  // Обновление позиций и цветов объектов
  pointA.position.copy(geometryStore.pointA)
  pointB.position.copy(geometryStore.pointB)
  ;(pointA.material as THREE.MeshBasicMaterial).color.set(geometryStore.pointAColor)
  ;(pointB.material as THREE.MeshBasicMaterial).color.set(geometryStore.pointBColor)

  geometryStore.updateProjections()
  projectionA.position.copy(geometryStore.projectionA)
  projectionB.position.copy(geometryStore.projectionB)

  animate()

  // Наблюдение за изменениями позиций линий
  watch(
    () => geometryStore.linePositions,
    (positions) => {
      lineGeometry.setPositions(positions)
      line.geometry = lineGeometry
    },
    { deep: true },
  )
})

// Функция анимации сцены
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
