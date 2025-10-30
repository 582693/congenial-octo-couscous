// 简单的前端 API 封装：保存场景配置并请求短链接
export async function saveSceneConfig(config) {
  const res = await fetch('/api/saveScene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  })
  if (!res.ok) throw new Error('保存失败')
  return res.json() // { id, url }
}