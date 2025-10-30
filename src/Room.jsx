import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { XRButton } from 'three/examples/jsm/webxr/XRButton'

export default function Room({ wallTextureUrl, floorTextureUrl, wallColor, floorColor, furniture = [], onSaveScene }) {
  const mountRef = useRef(null)
  const stateRef = useRef({})
  const [canXR, setCanXR] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xe8eef6)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 2, 4)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.xr.enabled = true // 启用 WebXR
    mount.appendChild(renderer.domElement)

    // WebXR 按钮
    const btn = XRButton.createButton(renderer)
    btn.style.position = 'absolute'
    btn.style.top = '8px'
    btn.style.right = '8px'
    mount.appendChild(btn)
    if (navigator.xr) {
      navigator.xr.isSessionSupported && navigator.xr.isSessionSupported('immersive-vr').then(supported => setCanXR(supported))
    }

    // 光照
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8)
    hemi.position.set(0, 10, 0)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(3, 10, 5)
    scene.add(dir)

    // 房间
    const roomSize = { w: 4, h: 2.6, d: 4 }
    const geometry = new THREE.BoxGeometry(roomSize.w, roomSize.h, roomSize.d)
    const materials = new Array(6).fill(null).map(() => new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide }))
    const roomMesh = new THREE.Mesh(geometry, materials)
    roomMesh.position.y = roomSize.h / 2
    scene.add(roomMesh)

    renderer.shadowMap.enabled = true
    dir.castShadow = true

    // 初始小家具
    const initialSofa = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
    )
    initialSofa.position.set(-0.8, 0.25, -0.6)
    initialSofa.name = 'sampleSofa'
    scene.add(initialSofa)

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.update()

    // GLTF Loader（用于加载家具）
    const gltfLoader = new GLTFLoader()

    // 存放加载的家具对象
    const placedFurniture = new Map()

    stateRef.current = { scene, camera, renderer, roomMesh, controls, gltfLoader, placedFurniture }

    // 渲染循环（支持 XR 渲染）
    let req = null
    const animate = () => {
      req = renderer.setAnimationLoop ? renderer.setAnimationLoop(() => renderer.render(scene, camera)) : requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (renderer.setAnimationLoop) renderer.setAnimationLoop(null)
      else cancelAnimationFrame(req)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      if (btn && btn.parentElement) btn.parentElement.removeChild(btn)
    }
  }, [])

  useEffect(() => {
    const { roomMesh, gltfLoader, scene, renderer } = stateRef.current
    if (!roomMesh) return

    const loader = new THREE.TextureLoader()

    const applyWall = (mapUrl, color) => {
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), side: THREE.BackSide })
      if (mapUrl) {
        loader.load(mapUrl, (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping
          tex.repeat.set(2, 1.2)
          mat.map = tex
          mat.needsUpdate = true
          [0,1,4,5].forEach(i => roomMesh.material[i] = mat)
        }, undefined, (err) => {
          console.warn('加载墙贴图失败', err)
          [0,1,4,5].forEach(i => roomMesh.material[i] = new THREE.MeshStandardMaterial({ color, side: THREE.BackSide }))
        })
      } else {
        [0,1,4,5].forEach(i => roomMesh.material[i] = new THREE.MeshStandardMaterial({ color, side: THREE.BackSide }))
      }
    }

    const applyFloor = (mapUrl, color) => {
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), side: THREE.BackSide })
      if (mapUrl) {
        loader.load(mapUrl, (tex) => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping
          tex.repeat.set(3, 3)
          mat.map = tex
          mat.needsUpdate = true
          roomMesh.material[3] = mat
        }, undefined, (err) => {
          console.warn('加载地贴图失败', err)
          roomMesh.material[3] = new THREE.MeshStandardMaterial({ color, side: THREE.BackSide })
        })
      } else {
        roomMesh.material[3] = new THREE.MeshStandardMaterial({ color, side: THREE.BackSide })
      }
    }

    applyWall(wallTextureUrl || null, wallColor)
    applyFloor(floorTextureUrl || null, floorColor)
    roomMesh.material[2] = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide })

    const currentIds = new Set(Object.keys(stateRef.current.placedFurniture || {}))
    const incomingIds = new Set(furniture.map(f => f.id))

    for (const id of currentIds) {
      if (!incomingIds.has(id)) {
        const obj = stateRef.current.placedFurniture.get(id)
        if (obj) scene.remove(obj)
        stateRef.current.placedFurniture.delete(id)
      }
    }

    furniture.forEach(item => {
      if (!stateRef.current.placedFurniture.has(item.id)) {
        stateRef.current.gltfLoader.load(item.url,
          (gltf) => {
            const root = gltf.scene || gltf.scenes?.[0] || gltf
            root.position.set(0.8, 0, 0.5 + stateRef.current.placedFurniture.size * 0.6)
            root.traverse((ch) => { if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true } })
            root.name = `furniture_${item.id}`
            scene.add(root)
            stateRef.current.placedFurniture.set(item.id, root)
          },
          undefined,
          (err) => {
            console.error('加载模型失败', err)
          })
      }
    })

    renderer.render(scene, stateRef.current.camera)
  }, [wallTextureUrl, floorTextureUrl, wallColor, floorColor, furniture])

  const handleSnapshot = () => {
    const { renderer } = stateRef.current
    if (!renderer) return
    const dataURL = renderer.domElement.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataURL
    a.download = 'scene_snapshot.png'
    a.click()
  }

  const handleSaveScene = async () => {
    const { camera, placedFurniture } = stateRef.current
    if (!onSaveScene) return
    const sceneState = {
      wallColor,
      floorColor,
      wallTextureUrl,
      floorTextureUrl,
      furniture: Array.from(placedFurniture.keys()),
      camera: { position: camera.position.toArray(), quaternion: camera.quaternion.toArray() },
      createdAt: new Date().toISOString()
    }
    onSaveScene(sceneState)
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', gap: 8 }}>
        <button onClick={handleSnapshot}>导出快照</button>
        <button onClick={handleSaveScene}>保存短链接</button>
        {canXR ? <span style={{ alignSelf: 'center' }}>WebXR 可用 (右上按钮进入)</span> : null}
      </div>
    </div>
  )
}