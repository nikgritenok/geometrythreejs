import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export const setupScene = () => {
  // Создание сцены
  const scene = new THREE.Scene()

  // Создание камеры
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 2, 5)

  // Создание рендера
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Добавление освещения
  const light = new THREE.AmbientLight(0xffffff, 1)
  scene.add(light)

  // Вспомогательные элементы
  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // Управление камерой
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = false

  // Обработчик изменения размеров окна
  const onWindowResize = () => {
    console.log('resize')
    const width = window.innerWidth
    const height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
  }

  window.addEventListener('resize', onWindowResize)

  return { scene, camera, renderer, controls, onWindowResize }
}
