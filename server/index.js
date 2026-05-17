import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import habitRoutes from './routes/habits.js'
import gameRoutes from './routes/games.js'
import tokenRoutes from './routes/tokens.js'

const app = express()

// Simple array-based CORS — same as what was working before
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://iteration2.ta31brainboost.me',
    'https://iteration3.ta31brainboost.me',
  ]
}))

app.use(express.json())

// Health check FIRST before any auth middleware
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/habits', habitRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/tokens', tokenRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
