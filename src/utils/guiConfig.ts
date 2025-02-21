import * as dat from 'dat.gui'
import * as THREE from 'three'
import type { Mesh } from 'three'
import type { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { useGeometryStore } from '@/stores/useGeometryStore'

interface GuiConfigParams {
  pointA: Mesh // Точка A
  pointB: Mesh // Точка B
  projectionA: Mesh // Проекция A
  projectionB: Mesh // Проекция B
  line: Line2 // Линия, соединяющая точки
}

// Функция для настройки интерфейса с помощью dat.GUI
export function setupDatGui({ pointA, pointB, projectionA, projectionB, line }: GuiConfigParams) {
  // Получаем доступ к хранилищу данных о геометрии
  const geometryStore = useGeometryStore()

  // Параметры, которые будут отображаться в интерфейсе
  const params = {
    pointAColor: geometryStore.pointAColor, // Цвет точки A
    pointBColor: geometryStore.pointBColor, // Цвет точки B
    projectionAColor: '#ff8800', // Цвет проекции A
    projectionBColor: '#ff8800', // Цвет проекции B
    lineColor: geometryStore.lineColor, // Цвет линии
    lineThickness: geometryStore.lineThickness, // Толщина линии
    pointARadius: geometryStore.pointARadius, // Радиус точки A
    pointBRadius: geometryStore.pointBRadius, // Радиус точки B
    projectionARadius: 0.05, // Радиус проекции A
    projectionBRadius: 0.05, // Радиус проекции B
  }

  const gui = new dat.GUI()

  // Папка для настройки цветов
  const colorsFolder = gui.addFolder('Цвета')
  colorsFolder.addColor(params, 'pointAColor').onChange((color: string) => {
    geometryStore.pointAColor = color
    ;(pointA.material as THREE.MeshBasicMaterial).color.set(color) // Обновление цвета точки A
  })
  colorsFolder.addColor(params, 'pointBColor').onChange((color: string) => {
    geometryStore.pointBColor = color
    ;(pointB.material as THREE.MeshBasicMaterial).color.set(color) // Обновление цвета точки B
  })
  colorsFolder.addColor(params, 'projectionAColor').onChange((color: string) => {
    ;(projectionA.material as THREE.MeshBasicMaterial).color.set(color) // Обновление цвета проекции A
  })
  colorsFolder.addColor(params, 'projectionBColor').onChange((color: string) => {
    ;(projectionB.material as THREE.MeshBasicMaterial).color.set(color) // Обновление цвета проекции B
  })
  colorsFolder.addColor(params, 'lineColor').onChange((color: string) => {
    geometryStore.lineColor = color
    line.material.color.set(color) // Обновление цвета линии
  })

  // Папка для настройки размеров
  const sizeFolder = gui.addFolder('Размеры')
  sizeFolder.add(params, 'pointARadius', 0.01, 1).onChange((size: number) => {
    geometryStore.pointARadius = size
    pointA.geometry = new THREE.SphereGeometry(size) // Обновление размера точки A
  })
  sizeFolder.add(params, 'pointBRadius', 0.01, 1).onChange((size: number) => {
    geometryStore.pointBRadius = size
    pointB.geometry = new THREE.SphereGeometry(size) // Обновление размера точки B
  })
  sizeFolder.add(params, 'projectionARadius', 0.01, 1).onChange((size: number) => {
    projectionA.geometry = new THREE.SphereGeometry(size) // Обновление размера проекции A
  })
  sizeFolder.add(params, 'projectionBRadius', 0.01, 1).onChange((size: number) => {
    projectionB.geometry = new THREE.SphereGeometry(size) // Обновление размера проекции B
  })

  // Папка для настройки позиций
  const positionFolder = gui.addFolder('Позиции')
  const PointA = positionFolder.addFolder('Точка A')
  const PointB = positionFolder.addFolder('Точка B')

  // Функции для обновления позиции точек
  const updatePointA = () => {
    geometryStore.setPointAPosition(pointA.position.x, pointA.position.y, pointA.position.z)
  }
  const updatePointB = () => {
    geometryStore.setPointBPosition(pointB.position.x, pointB.position.y, pointB.position.z)
  }

  // Функция обновления всех зависимостей
  function updateScene() {
    updatePointA()
    updatePointB()
    geometryStore.updateProjections()
  }

  // Добавление настроек для позиции точки A
  PointA.add(pointA.position, 'x', -10, 10).onChange(updateScene)
  PointA.add(pointA.position, 'y', -10, 10).onChange(updateScene)
  PointA.add(pointA.position, 'z', -10, 10).onChange(updateScene)

  // Добавление настроек для позиции точки B
  PointB.add(pointB.position, 'x', -10, 10).onChange(updateScene)
  PointB.add(pointB.position, 'y', -10, 10).onChange(updateScene)
  PointB.add(pointB.position, 'z', -10, 10).onChange(updateScene)

  positionFolder.open()

  // Папка для настройки линии
  const lineFolder = gui.addFolder('Линия')
  lineFolder.add(params, 'lineThickness', 1, 10).onChange((thickness: number) => {
    geometryStore.lineThickness = thickness
    line.material.linewidth = thickness // Обновление толщины линии
  })

  // Папка для настроек сохранения и сброса
  const settingsFolder = gui.addFolder('Настройки')
  const settingsParams = {
    save: () => {
      // Сохранение настроек в localStorage
      const settings = {
        pointAColor: geometryStore.pointAColor,
        pointBColor: geometryStore.pointBColor,
        pointARadius: geometryStore.pointARadius,
        pointBRadius: geometryStore.pointBRadius,
        lineColor: geometryStore.lineColor,
        lineThickness: geometryStore.lineThickness,
        pointA: { x: pointA.position.x, y: pointA.position.y, z: pointA.position.z },
        pointB: { x: pointB.position.x, y: pointB.position.y, z: pointB.position.z },
      }
      localStorage.setItem('threeSettings', JSON.stringify(settings))
      console.log(settings)
      console.log('Настройки сохранены')
    },
    reset: () => {
      // Сброс настроек из localStorage
      localStorage.removeItem('threeSettings')

      geometryStore.setPointAPosition(-1, 0, 0)
      geometryStore.setPointBPosition(1, 1, 1)
      geometryStore.pointAColor = '#ff0000'
      geometryStore.pointBColor = '#0000ff'
      geometryStore.pointARadius = 0.1
      geometryStore.pointBRadius = 0.1
      geometryStore.lineColor = '#ffffff'
      geometryStore.lineThickness = 2
      ;(pointA.material as THREE.MeshBasicMaterial).color.set(geometryStore.pointAColor)
      ;(pointB.material as THREE.MeshBasicMaterial).color.set(geometryStore.pointBColor)
      pointA.geometry = new THREE.SphereGeometry(geometryStore.pointARadius)
      pointB.geometry = new THREE.SphereGeometry(geometryStore.pointBRadius)
      line.material.color.set(geometryStore.lineColor)
      line.material.linewidth = geometryStore.lineThickness

      pointA.position.copy(geometryStore.pointA)
      pointB.position.copy(geometryStore.pointB)
      geometryStore.updateProjections()
      projectionA.position.copy(geometryStore.projectionA)
      projectionB.position.copy(geometryStore.projectionB)

      console.log('Настройки сброшены')
    },
  }
  settingsFolder.add(settingsParams, 'save').name('Сохранить настройки')
  settingsFolder.add(settingsParams, 'reset').name('Сбросить настройки')
}
