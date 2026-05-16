import pool from '../db.js'

// Middleware: verify wearable token from X-Wearable-Token header or body.
// Looks up token in user_tokens and sets req.userId if valid.
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
