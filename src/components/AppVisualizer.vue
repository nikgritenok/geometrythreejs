<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, watch } from 'vue'
import { useGeometryStore } from '@/stores/useGeometryStore'
import { setupDatGui } from '@/utils/guiConfig'
import { setupScene, startAnimationLoop } from '@/utils/sceneSetup'
import { setupTransformControls } from '@/utils/setupTransformControls'
import { createPoint } from '@/utils/createPoint'
import { createLine } from '@/utils/createLine'

// Подключаем хранилище геометрии
const geometryStore = useGeometryStore()

const { scene, camera, renderer, controls } = setupScene()

// Создание точек и их проекций на плоскость
const pointA = createPoint(
  geometryStore.pointARadius,
  new THREE.Color(geometryStore.pointAColor).getHex(),
)
const pointB = createPoint(
  geometryStore.pointBRadius,
  new THREE.Color(geometryStore.pointBColor).getHex(),
)
const projectionA = createPoint(0.05, 0xff8800)
const projectionB = createPoint(0.05, 0xff8800)

// Создание линии между точками
const line = createLine(
  geometryStore.linePositions,
  new THREE.Color(geometryStore.lineColor).getHex(),
)

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

  // Добавление объектов на сцену
  scene.add(pointA, pointB, line, projectionA, projectionB)

  // Настраиваем трансформации для точек
  setupTransformControls(
    camera,
    renderer,
    controls,
    pointA,
    geometryStore.setPointAPosition,
    { projectionA, projectionB },
    scene,
  )
  setupTransformControls(
    camera,
    renderer,
    controls,
    pointB,
    geometryStore.setPointBPosition,
    { projectionA, projectionB },
    scene,
  )

  // Настройка панели управления
  setupDatGui({ pointA, pointB, projectionA, projectionB, line })
}

// Хук для монтирования компонента
onMounted(() => {
  // Загрузка сохраненных настроек
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
    line.geometry.setPositions(geometryStore.linePositions)
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

  startAnimationLoop(renderer, scene, camera)

  // Наблюдение за изменениями позиций линий
  watch(
    () => geometryStore.linePositions,
    (positions) => {
      line.geometry.setPositions(positions)
      projectionA.position.copy(geometryStore.projectionA)
      projectionB.position.copy(geometryStore.projectionB)
    },
    { deep: true },
  )
})
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
