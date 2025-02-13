import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as THREE from 'three'

export const useGeometryStore = defineStore('geometry', () => {
  const pointA = ref(new THREE.Vector3(-1, 0, 0))
  const pointB = ref(new THREE.Vector3(1, 1, 1))
  const pointAColor = ref('#ff0000')
  const pointBColor = ref('#0000ff')
  const pointARadius = ref(0.1)
  const pointBRadius = ref(0.1)

  const lineColor = ref('#ffffff')
  const lineThickness = ref(2)

  const angle = ref(0)
  const azimuth = ref(0)

  const linePositions = computed(() => [
    pointA.value.x,
    pointA.value.y,
    pointA.value.z,
    pointB.value.x,
    pointB.value.y,
    pointB.value.z,
  ])

  function setPointAPosition(x: number, y: number, z: number) {
    pointA.value.set(x, y, z)
    updateAngles()
  }

  function setPointBPosition(x: number, y: number, z: number) {
    pointB.value.set(x, y, z)
    updateAngles()
  }

  function updateAngles() {
    const AB = new THREE.Vector3(
      pointB.value.x - pointA.value.x,
      pointB.value.y - pointA.value.y,
      pointB.value.z - pointA.value.z,
    )

    const normal = new THREE.Vector3(0, 0, 1)

    const cosTheta = AB.dot(normal) / (AB.length() * normal.length())
    angle.value = Math.acos(cosTheta) * (180 / Math.PI)

    azimuth.value = Math.atan2(AB.y, AB.x) * (180 / Math.PI)
  }

  return {
    pointA,
    pointB,
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
  }
})
