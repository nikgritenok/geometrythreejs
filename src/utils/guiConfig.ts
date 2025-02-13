// src/utils/guiConfig.ts
import * as dat from 'dat.gui'
import * as THREE from 'three'
import type { Mesh } from 'three'
import type { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { useGeometryStore } from '@/stores/useGeometryStore'

interface GuiConfigParams {
  pointA: Mesh
  pointB: Mesh
  projectionA: Mesh
  projectionB: Mesh
  line: Line2
}

export function setupDatGui({ pointA, pointB, projectionA, projectionB, line }: GuiConfigParams) {
  const geometryStore = useGeometryStore()

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

  const gui = new dat.GUI()

  // Папка с цветами
  const colorsFolder = gui.addFolder('Цвета')
  colorsFolder.addColor(params, 'pointAColor').onChange((color: string) => {
    geometryStore.pointAColor = color
    pointA.material.color.set(color)
  })
  colorsFolder.addColor(params, 'pointBColor').onChange((color: string) => {
    geometryStore.pointBColor = color
    pointB.material.color.set(color)
  })
  colorsFolder.addColor(params, 'projectionAColor').onChange((color: string) => {
    projectionA.material.color.set(color)
  })
  colorsFolder.addColor(params, 'projectionBColor').onChange((color: string) => {
    projectionB.material.color.set(color)
  })
  colorsFolder.addColor(params, 'lineColor').onChange((color: string) => {
    geometryStore.lineColor = color
    line.material.color.set(color)
  })

  // Папка с размерами
  const sizeFolder = gui.addFolder('Размеры')
  sizeFolder.add(params, 'pointARadius', 0.01, 1).onChange((size: number) => {
    geometryStore.pointARadius = size
    pointA.geometry = new THREE.SphereGeometry(size)
  })
  sizeFolder.add(params, 'pointBRadius', 0.01, 1).onChange((size: number) => {
    geometryStore.pointBRadius = size
    pointB.geometry = new THREE.SphereGeometry(size)
  })
  sizeFolder.add(params, 'projectionARadius', 0.01, 1).onChange((size: number) => {
    projectionA.geometry = new THREE.SphereGeometry(size)
  })
  sizeFolder.add(params, 'projectionBRadius', 0.01, 1).onChange((size: number) => {
    projectionB.geometry = new THREE.SphereGeometry(size)
  })

  // Папка с позициями
  const positionFolder = gui.addFolder('Позиции')
  const PointA = positionFolder.addFolder('Точка A')
  const PointB = positionFolder.addFolder('Точка B')
  PointA.add(pointA.position, 'x', -10, 10).onChange(() => geometryStore.updateAngles())
  PointA.add(pointA.position, 'y', -10, 10).onChange(() => geometryStore.updateAngles())
  PointA.add(pointA.position, 'z', -10, 10).onChange(() => geometryStore.updateAngles())
  PointB.add(pointB.position, 'x', -10, 10).onChange(() => geometryStore.updateAngles())
  PointB.add(pointB.position, 'y', -10, 10).onChange(() => geometryStore.updateAngles())
  PointB.add(pointB.position, 'z', -10, 10).onChange(() => geometryStore.updateAngles())
  positionFolder.open()

  // Папка для линии
  const lineFolder = gui.addFolder('Линия')
  lineFolder.add(params, 'lineThickness', 1, 10).onChange((thickness: number) => {
    geometryStore.lineThickness = thickness
    line.material.linewidth = thickness
  })
}
