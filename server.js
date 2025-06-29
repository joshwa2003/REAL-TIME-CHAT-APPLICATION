const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  // Store messages in memory (in production, you'd use a database)
  let messages = []

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Send existing messages to newly connected user
    socket.emit('previous-messages', messages)

    // Handle user joining with username
    socket.on('user-join', (data) => {
      const { username } = data
      
      // Create system message for user joining
      const joinMessage = {
        id: Date.now(),
        text: `${username} joined the chat`,
        user: 'System',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
      
      messages.push(joinMessage)
      
      // Broadcast join message to all clients
      io.emit('receive-message', joinMessage)
      
      console.log(`${username} joined the chat`)
    })

    // Handle new messages
    socket.on('send-message', (data) => {
      const message = {
        id: Date.now(),
        text: data.text,
        user: data.user,
        timestamp: new Date().toISOString(),
        type: 'message'
      }
      
      messages.push(message)
      
      // Broadcast message to all connected clients
      io.emit('receive-message', message)
    })

    // Handle user typing
    socket.on('typing', (data) => {
      socket.broadcast.emit('user-typing', data)
    })

    socket.on('stop-typing', (data) => {
      socket.broadcast.emit('user-stop-typing', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
