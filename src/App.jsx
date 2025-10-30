import React, { useState } from 'react'
import Room from './Room'
import UploadMaterial from './components/UploadMaterial'
import FurnitureLibrary from './components/FurnitureLibrary'
import { saveSceneConfig } from './utils/api'

export default function App() {
  const textures = [
    { id: 'none', name: '纯色 (无贴图)', url: '' },
    { id: 'brick', name: '红砖', url: 'https://threejs.org/examples/textures/brick_diffuse.jpg' },
    { id: 'wood', name: '木纹', url: 'https://threejs.org/examples/textures/wood.jpg' },
    { id: 'floor', name: '地砖', url: 'https://threejs.org/examples/textures/terrain/grasslight-big.jpg' }
  ]

  const [wallTexture, setWallTexture] = useState(textures[0].id)
  const [floorTexture, setFloorTexture] = useState(textures[3].id)
  const [wallColor, setWallColor] = useState('#f2efe9')
  const [floorColor, setFloorColor] = useState('#c8b99b')
  const [uploadedTextures, setUploadedTextures] = useState([]) // {url,name}
  const [furnitureList, setFurnitureList] = useState([]) // 模型 url 列表
  const [shortLink, setShortLink] = useState(null)

  const findTextureUrl = (id) => textures.find(t => t.id === id)?.url || ''

  const handleUploaded = ({ url, name }) => {
    setUploadedTextures(prev => [{ url, name }, ...prev])
    // 直接选为墙面贴图示例
    setWallTexture(url) // 这里用于 Room 处理：如果传非预定义 id，则直接当作 url
  }

  const handleAddFurniture = (modelUrl) => {
    // 客户端把模型加入列表，Room 会加载并显示
    setFurnitureList(prev => [...prev, { id: `${Date.now()}`, url: modelUrl }])
  }

  const handleSaveScene = async (sceneState) => {
    try {
      const res = await saveSceneConfig(sceneState)
      setShortLink(res.url)
    } catch (err) {
      console.error('保存场景失败', err)
      alert('保存失败')
    }
  }

  return (
    <div className="app">
      <aside className="panel">
        <h2>增强版 Demo</h2>

        <section>
          <h3>墙面设置</h3>
          <label>
            颜色：
            <input type="color" value={wallColor} onChange={(e) => setWallColor(e.target.value)} />
          </label>
          <label>
            纹理：
            <select value={wallTexture} onChange={(e) => setWallTexture(e.target.value)}>
              {textures.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              {uploadedTextures.map(t => <option key={t.url} value={t.url}>{t.name || t.url}</option>)}
            </select>
          </label>

          <UploadMaterial onUploaded={handleUploaded} uploadToServer={true} />
        </section>

        <section>
          <h3>地面设置</h3>
          <label>
            颜色：
            <input type="color" value={floorColor} onChange={(e) => setFloorColor(e.target.value)} />
          </label>
          <label>
            纹理：
            <select value={floorTexture} onChange={(e) => setFloorTexture(e.target.value)}>
              {textures.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              {uploadedTextures.map(t => <option key={t.url} value={t.url}>{t.name || t.url}</option>)}
            </select>
          </label>
        </section>

        <section>
          <FurnitureLibrary onAdd={handleAddFurniture} />
        </section>

        <section>
          <h3>场景</h3>
          <p>点击右侧场景内的「导出快照」或「保存短链接」。</p>
          {shortLink && (
            <div>
              <a href={shortLink} target="_blank" rel="noreferrer">打开短链接（演示）</a>
            </div>
          )}
        </section>

        <footer>
          <small>新增：上传材质 / 家具 GLTF 加载 / 快照导出 / WebXR 入口（仅支持浏览器 WebXR）</small>
        </footer>
      </aside>

      <main className="viewport">
        <Room
          wallTextureUrl={findTextureUrl(wallTexture) || wallTexture}
          floorTextureUrl={findTextureUrl(floorTexture) || floorTexture}
          wallColor={wallColor}
          floorColor={floorColor}
          furniture={furnitureList}
          onSaveScene={handleSaveScene}
        />
      </main>
    </div>
  )
}