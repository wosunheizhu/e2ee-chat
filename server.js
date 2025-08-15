import express from "express"
import http from "http"
import { Server } from "socket.io"
import bcrypt from "bcryptjs"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

app.use(express.static(path.join(__dirname, "public")))
app.use(express.json({ limit: "256kb" }))

const rooms = new Map()
let registryStore = {}
let roomStore = {}
const dataFile = path.join(__dirname, "data.json")
if (fs.existsSync(dataFile)) {
  try { 
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8") || "{}")
    registryStore = data.registry || {}
    roomStore = data.rooms || {}
    Object.entries(roomStore).forEach(([roomName, roomData]) => {
      rooms.set(roomName, { hash: roomData.hash, users: new Set() })
    })
  } catch (_) {}
}

function saveData() {
  try { 
    const data = {
      registry: registryStore,
      rooms: roomStore
    }
    fs.writeFileSync(dataFile, JSON.stringify(data)) 
  } catch (_) {}
}

app.get("/registry/:room", (req, res) => {
  const room = req.params.room
  const v = registryStore[room]
  if (!v) return res.status(404).json({ ok: false })
  res.json({ ok: true, ciphertext: v.ciphertext, updatedAt: v.updatedAt })
})

app.post("/registry/:room", (req, res) => {
  const room = req.params.room
  const { ciphertext } = req.body || {}
  if (typeof ciphertext !== "string" || ciphertext.length === 0) return res.status(400).json({ ok: false })
  registryStore[room] = { ciphertext, updatedAt: Date.now() }
  saveData()
  res.json({ ok: true })
})

app.get("/room/:room/exists", (req, res) => {
  const room = req.params.room
  const exists = rooms.has(room)
  res.json({ exists })
})

io.on("connection", socket => {
  socket.on("join", async ({ room, name, joinToken, create }, cb) => {
    if (!room || !name || !joinToken) return cb({ ok: false, error: "missing" })
    
    if (create) {
      if (rooms.has(room)) return cb({ ok: false, error: "exists" })
      const hash = await bcrypt.hash(joinToken, 10)
      rooms.set(room, { hash, users: new Set() })
      roomStore[room] = { hash, createdAt: Date.now() }
      saveData()
    } else {
      if (!rooms.has(room)) return cb({ ok: false, error: "notfound" })
    }
    
    const r = rooms.get(room)
    const ok = await bcrypt.compare(joinToken, r.hash)
    if (!ok) return cb({ ok: false, error: "auth" })
    socket.data.room = room
    socket.data.name = name
    r.users.add(socket.id)
    socket.join(room)
    io.to(room).emit("system", `${name} 加入`)
    cb({ ok: true })
  })

  socket.on("pubkey", payload => {
    const room = socket.data.room
    if (!room) return
    io.to(room).emit("pubkey", payload)
  })

  socket.on("groupkey", payload => {
    const room = socket.data.room
    if (!room) return
    // 转发群组密钥给指定设备
    io.to(room).emit("groupkey", payload)
  })

  socket.on("msg", payload => {
    const room = socket.data.room
    if (!room) return
    io.to(room).emit("msg", payload)
  })

  socket.on("ready", payload => {
    const room = socket.data.room
    if (!room) return
    io.to(room).emit("ready", payload)
  })

  socket.on("disconnect", () => {
    const room = socket.data.room
    const name = socket.data.name
    if (!room) return
    const r = rooms.get(room)
    if (!r) return
    r.users.delete(socket.id)
    io.to(room).emit("system", `${name} 退出`)
    if (r.users.size === 0) rooms.delete(room)
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`E2EE Chat server running on port ${PORT}`)
})
