import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import habitsRoutes from './routes/habits.js'
import gamesRoutes from './routes/games.js'
import tokensRoutes from './routes/tokens.js'

dotenv.config()

const app = express()

// ─────────────────────────────────────────────
// CORS FIX
// ─────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://iteration2.ta31brainboost.me',
    'https://iteration3.ta31brainboost.me',
    'https://ta31brainboost.me'
  ],
  credentials: true
}))

// Handle preflight requests
app.options('*', cors())

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(express.json())

// ─────────────────────────────────────────────
// Health check route
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BrainBoost API running'
  })
})

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/habits', habitsRoutes)
app.use('/api/games', gamesRoutes)
app.use('/api/tokens', tokensRoutes)

// ─────────────────────────────────────────────
// Root route
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('BrainBoost backend is running')
})

// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err)

  res.status(500).json({
    error: 'Server error',
    message: err.message
  })
})

// ─────────────────────────────────────────────
// Railway PORT FIX
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})