import express from 'express'
import pool from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import crypto from 'crypto'

const router = express.Router()

// ── Ensure user_tokens table exists ──────────────────────────────────────────
pool.query(`
  CREATE TABLE IF NOT EXISTS user_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    TEXT UNIQUE NOT NULL,
    token      TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(console.error)

// ── Wearable token middleware ─────────────────────────────────────────────────
// Verifies X-Wearable-Token header or body.token against user_tokens table.
async function requireWearableToken(req, res, next) {
  try {
    const token = req.headers['x-wearable-token'] || req.body?.token
    if (!token) return res.status(401).json({ error: 'Missing wearable token' })
    const result = await pool.query(
      'SELECT user_id FROM user_tokens WHERE token = $1',
      [token]
    )
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid token' })
    req.userId = result.rows[0].user_id
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

// ── GET /api/habits/token ─────────────────────────────────────────────────────
// Returns existing token or creates one for the signed-in user.
router.get('/token', requireAuth, async (req, res) => {
  try {
    const existing = await pool.query(
      'SELECT token FROM user_tokens WHERE user_id = $1',
      [req.userId]
    )
    if (existing.rows.length > 0) return res.json({ token: existing.rows[0].token })
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

// ── POST /api/habits/token/regenerate ─────────────────────────────────────────
router.post('/token/regenerate', requireAuth, async (req, res) => {
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

// ── POST /api/habits/wearable ─────────────────────────────────────────────────
// Receives Apple Watch data via iOS Shortcut. Auth via wearable token.
// sleep_minutes → sleep_hours bucket, steps → physical_activity boolean.
router.post('/wearable', requireWearableToken, async (req, res) => {
  try {
    const { sleep_minutes, steps, date } = req.body
    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' })

    const mins = Number(sleep_minutes) || 0
    let sleep_hours
    if (mins < 360)      sleep_hours = '< 6'
    else if (mins < 420) sleep_hours = '6'
    else if (mins < 480) sleep_hours = '7'
    else if (mins < 540) sleep_hours = '8'
    else                 sleep_hours = '9+'

    const physical_activity = Number(steps) >= 7500
    const screen_time = '2-4h'

    const existing = await pool.query(
      'SELECT id FROM habits WHERE user_id = $1 AND date = $2',
      [req.userId, date]
    )

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE habits SET sleep_hours=$1, physical_activity=$2
         WHERE user_id=$3 AND date=$4 RETURNING *`,
        [sleep_hours, physical_activity, req.userId, date]
      )
      return res.json({ status: 'updated', habit: result.rows[0],
        mapped: { sleep_hours, physical_activity, sleep_minutes: mins, steps } })
    }

    const result = await pool.query(
      `INSERT INTO habits (user_id, sleep_hours, screen_time, physical_activity, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, sleep_hours, screen_time, physical_activity, date]
    )
    res.status(201).json({ status: 'created', habit: result.rows[0],
      mapped: { sleep_hours, physical_activity, sleep_minutes: mins, steps } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── GET /api/habits ───────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── POST /api/habits ──────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { sleep_hours, screen_time, physical_activity, date } = req.body
    const existing = await pool.query(
      'SELECT id FROM habits WHERE user_id = $1 AND date = $2',
      [req.userId, date]
    )
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already checked in today' })
    }
    const result = await pool.query(
      `INSERT INTO habits (user_id, sleep_hours, screen_time, physical_activity, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, sleep_hours, screen_time, physical_activity, date]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── PUT /api/habits/:date ─────────────────────────────────────────────────────
router.put('/:date', requireAuth, async (req, res) => {
  try {
    const { sleep_hours, screen_time, physical_activity } = req.body
    const result = await pool.query(
      `UPDATE habits SET sleep_hours=$1, screen_time=$2, physical_activity=$3
       WHERE user_id=$4 AND date=$5 RETURNING *`,
      [sleep_hours, screen_time, physical_activity, req.userId, req.params.date]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'No check-in found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

// ── GET /api/habits/streak ────────────────────────────────────────────────────
router.get('/streak', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT date FROM habits WHERE user_id = $1 ORDER BY date DESC',
      [req.userId]
    )
    const dates = result.rows.map(r => new Date(r.date).toLocaleDateString('en-CA'))
    let streak = 0
    const today = new Date().toLocaleDateString('en-CA')
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA')
    if (!dates.includes(today) && !dates.includes(yesterday)) {
      return res.json({ streak: 0, total: dates.length })
    }
    let current = dates.includes(today) ? new Date() : new Date(Date.now() - 86400000)
    for (let i = 0; i < dates.length; i++) {
      const expected = current.toLocaleDateString('en-CA')
      if (dates.includes(expected)) {
        streak++
        current = new Date(current.getTime() - 86400000)
      } else break
    }
    res.json({ streak, total: dates.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})
