import React from 'react'

const SAMPLE_MODELS = [
  { id: 'sofa', name: 'Sofa (GLB)', url: 'https://threejs.org/examples/models/gltf/Flamingo.glb' },
  { id: 'chair', name: 'DamagedHelmet (gltf)', url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf' }
]

export default function FurnitureLibrary({ onAdd }) {
  return (
    <div>
      <h3>家具库</h3>
      <ul style={{ paddingLeft: 12 }}>
        {SAMPLE_MODELS.map(m => (
          <li key={m.id} style={{ marginBottom: 8 }}>
            <button onClick={() => onAdd(m.url)}>{m.name}</button>
          </li>
        ))}
      </ul>
      <small>演示模型来自 threejs.org 示例，真实生产应使用 CDN + 模型转换与压缩。</small>
    </div>
  )
}