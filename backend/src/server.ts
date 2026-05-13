import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

// ─────────────────────────────────────────────────────────
// Initialize Express App
// ─────────────────────────────────────────────────────────

const app = express()
const PORT = process.env.PORT || 3001

// ─────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes will be imported here
// import authRoutes from './routes/auth'
// import usersRoutes from './routes/users'
// import bookingsRoutes from './routes/bookings'
// import roomsRoutes from './routes/rooms'

// app.use('/api/auth', authRoutes)
// app.use('/api/users', usersRoutes)
// app.use('/api/bookings', bookingsRoutes)
// app.use('/api/rooms', roomsRoutes)

// ─────────────────────────────────────────────────────────
// Error Handler Middleware
// ─────────────────────────────────────────────────────────

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  })
})

// ─────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// ─────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 Health check: http://localhost:${PORT}/health`)
})
