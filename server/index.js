const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const UPLOADS_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const name = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`
    cb(null, name)
  }
})
const upload = multer({ storage })

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file' })
  const url = `/uploads/${req.file.filename}`
  return res.json({ url })
})

app.use('/uploads', express.static(UPLOADS_DIR))

const scenes = new Map()
function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

app.post('/api/saveScene', (req, res) => {
  const config = req.body
  const id = makeId()
  scenes.set(id, config)
  const url = `${req.protocol}://${req.get('host')}/s/${id}`
  res.json({ id, url })
})

app.get('/s/:id', (req, res) => {
  const id = req.params.id
  if (!scenes.has(id)) return res.status(404).send('Not found')
  const config = scenes.get(id)
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(config, null, 2))
})

app.listen(PORT, () => {
  console.log(`VR demo backend run at http://localhost:${PORT}`)
  console.log('上传目录：', UPLOADS_DIR)
})