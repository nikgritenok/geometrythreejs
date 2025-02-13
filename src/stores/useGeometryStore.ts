import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as THREE from 'three'

// Создаем хранилище для геометрических объектов
export const useGeometryStore = defineStore('geometry', () => {
  // Точки A и B (3D векторы)
  const pointA = ref(new THREE.Vector3(-1, 0, 0))
  const pointB = ref(new THREE.Vector3(1, 1, 1))

  // Проекции точек A и B на плоскость XY (z = 0)
  const projectionA = ref(new THREE.Vector3(pointA.value.x, pointA.value.y, 0))
  const projectionB = ref(new THREE.Vector3(pointB.value.x, pointB.value.y, 0))

  // Цвета точек A и B, радиусы точек, цвет линии и толщина линии
  const pointAColor = ref('#ff0000')
  const pointBColor = ref('#0000ff')
  const pointARadius = ref(0.1)
  const pointBRadius = ref(0.1)
  const lineColor = ref('#ffffff')
  const lineThickness = ref(2)

  // Углы между точками
  const angle = ref(0)
  const azimuth = ref(0)

  // Вычисляем позиции линии, которая соединяет точки A и B
  const linePositions = computed(() => [
    pointA.value.x,
    pointA.value.y,
    pointA.value.z,
    pointB.value.x,
    pointB.value.y,
    pointB.value.z,
  ])

  // Функция для обновления углов между точками
  function updateAngles() {
    // Вектор AB
    const AB = new THREE.Vector3(
      pointB.value.x - pointA.value.x,
      pointB.value.y - pointA.value.y,
      pointB.value.z - pointA.value.z,
    )

    // Горизонтальная длина вектора AB (XY-плоскость)
    const horizontalLength = Math.sqrt(AB.x * AB.x + AB.y * AB.y)

    // Вычисление угла между точками (по вертикали и по азимуту)
    angle.value = Math.atan2(AB.z, horizontalLength) * (180 / Math.PI) // Угол наклона относительно горизонтали
    azimuth.value = Math.atan2(AB.y, AB.x) * (180 / Math.PI) // Азимут (угол относительно оси X)
  }

  // Функция для обновления проекций точек на плоскость XY
  function updateProjections() {
    projectionA.value.set(pointA.value.x, pointA.value.y, 0)
    projectionB.value.set(pointB.value.x, pointB.value.y, 0)
  }

  // Устанавливаем новую позицию для точки A и обновляем углы и проекции
  function setPointAPosition(x: number, y: number, z: number) {
    pointA.value.set(x, y, z)
    updateAngles()
    updateProjections()
  }

  // Устанавливаем новую позицию для точки B и обновляем углы и проекции
  function setPointBPosition(x: number, y: number, z: number) {
    pointB.value.set(x, y, z)
    updateAngles()
    updateProjections()
  }

  // Возвращаем данные, которые будут использоваться в компоненте
  return {
    pointA,
    pointB,
    projectionA,
    projectionB,
    pointAColor,
    pointBColor,
    pointARadius,
    pointBRadius,
    lineColor,
    lineThickness,
    angle,
    azimuth,
    linePositions,
    setPointAPosition,
    setPointBPosition,
    updateAngles,
    updateProjections,
  }
})
