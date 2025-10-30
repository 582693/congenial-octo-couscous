import React, { useRef } from 'react'

export default function UploadMaterial({ onUploaded, uploadToServer = true }) {
  const fileRef = useRef()

  const handleFileChange = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (uploadToServer) {
      const form = new FormData()
      form.append('file', f)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data = await res.json()
        if (data.url) onUploaded({ url: data.url, name: f.name })
      } catch (err) {
        console.error('上传失败', err)
        readAsDataURL(f)
      }
    } else {
      readAsDataURL(f)
    }
  }

  const readAsDataURL = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      onUploaded({ url: reader.result, name: file.name })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 8 }}>
        上传材质贴图：
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  )
}