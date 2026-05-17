import express from 'express'
import pool from '../db.js'
import { verifyToken } from '@clerk/clerk-sdk-node'
import crypto from 'crypto'

const router = express.Router()

// Local auth middleware — same approach as auth.js, avoids full Clerk SDK init
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    })
    req.userId = payload.sub
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_tokens (
      id         SERIAL PRIMARY KEY,
      user_id    TEXT UNIQUE NOT NULL,
      token      TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}
setTimeout(() => ensureTable().catch(console.error), 2000)

router.get('/', requireAuth, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT token FROM user_tokens WHERE user_id = $1',
      [req.userId]
    )
    if (existing.rows.length > 0) return res.json({ token: existing.rows[0].token })
    const token = crypto.randomUUID()
    await pool.query('INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)', [req.userId, token])
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/regenerate', requireAuth, async (req, res) => {
  try {
    const token = crypto.randomUUID()
    await pool.query(
      `INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET token = $2`,
      [req.userId, token]
    )
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
