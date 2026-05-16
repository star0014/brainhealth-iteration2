// ─────────────────────────────────────────────────────────────────────────────
// Token API routes — mounted at /api/tokens by the main Express server.
//
// Allows signed-in users to generate a personal API token for use with the
// Apple Watch Shortcut integration. Each user gets one stable token stored
// in the user_tokens table.
//
// Database table (auto-created on first request):
//   user_tokens (id, user_id, token, created_at)
//   user_id TEXT UNIQUE — Clerk user ID
//   token   TEXT        — UUID-based random token
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import crypto from 'crypto'

const router = express.Router()

// Ensure the user_tokens table exists — runs once on startup harmlessly.
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
ensureTable().catch(console.error)

// ── GET /api/tokens ───────────────────────────────────────────────────────────
// Returns the current user's token, creating one if it doesn't exist yet.
router.get('/', requireAuth, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT token FROM user_tokens WHERE user_id = $1',
      [req.userId]
    )
    if (existing.rows.length > 0) {
      return res.json({ token: existing.rows[0].token })
    }
    // Generate a new token
    const token = crypto.randomUUID()
    await pool.query(
      'INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)',
      [req.userId, token]
    )
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/tokens/regenerate ───────────────────────────────────────────────
// Replaces the user's existing token with a new one (e.g. if it was leaked).
router.post('/regenerate', requireAuth, async (req, res) => {
  try {
    const token = crypto.randomUUID()
    await pool.query(
      `INSERT INTO user_tokens (user_id, token)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET token = $2`,
      [req.userId, token]
    )
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Middleware: verify wearable token ─────────────────────────────────────────
// Used by the /api/habits/wearable endpoint.
// Looks up the token in user_tokens and sets req.userId if valid.
export async function requireWearableToken(req, res, next) {
  try {
    const token = req.headers['x-wearable-token'] || req.body?.token
    if (!token) return res.status(401).json({ error: 'Missing wearable token' })

    const result = await pool.query(
      'SELECT user_id FROM user_tokens WHERE token = $1',
      [token]
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.userId = result.rows[0].user_id
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export default router
