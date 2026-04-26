import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import './Game.css'

const API = 'http://localhost:3001/api'

const COLORS = [
  { name: 'RED',    hex: '#ef4444' },
  { name: 'BLUE',   hex: '#3b82f6' },
  { name: 'GREEN',  hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
]

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRound() {
  const word = getRandomItem(COLORS)
  let color = getRandomItem(COLORS)
  // 50% chance of mismatch
  if (Math.random() > 0.5) {
    const others = COLORS.filter(c => c.name !== word.name)
    color = getRandomItem(others)
  }
  return { word, color }
}

function StroopGame({ onBack }) {
  const { getToken } = useAuth()
  const [phase, setPhase] = useState('intro') // intro, playing, done
  const [round, setRound] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'
  const [timeLeft, setTimeLeft] = useState(60)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'playing') {
      setRound(generateRound())
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setPhase('done')
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  useEffect(() => {
    if (phase === 'done') saveScore()
  }, [phase])

  async function saveScore() {
    try {
      const token = await getToken()
      if (!token) return
      await fetch(`${API}/games`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: 'stroop',
          score: score,
          metadata: { total_rounds: total, accuracy: total > 0 ? Math.round((score / total) * 100) : 0 }
        })
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
    }
  }

  function handleAnswer(colorName) {
    if (!round || feedback) return
    const correct = colorName === round.color.name
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    setTotal(t => t + 1)
    setTimeout(() => {
      setFeedback(null)
      setRound(generateRound())
    }, 400)
  }

  function reset() {
    setPhase('intro')
    setScore(0)
    setTotal(0)
    setFeedback(null)
    setTimeLeft(60)
    setSaved(false)
  }

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  function getRating() {
    if (accuracy >= 90) return { label: 'Exceptional Focus!', desc: 'Your attention control is outstanding.', color: '#16a34a' }
    if (accuracy >= 75) return { label: 'Great Attention!', desc: 'Strong cognitive control — well above average.', color: '#2563eb' }
    if (accuracy >= 60) return { label: 'Good Effort!', desc: 'Solid performance with room to improve.', color: '#7c3aed' }
    return { label: 'Keep Practicing!', desc: 'Regular practice will sharpen your focus.', color: '#d97706' }
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="game-back" onClick={onBack}>← Back</button>
        <div className="game-title-area">
          <h1>Stroop Test</h1>
          <span className="game-skill">Attention Control</span>
        </div>
        <div className="game-rounds">
          {phase === 'playing' ? `${timeLeft}s` : '60s'}
        </div>
      </div>

      {phase === 'intro' && (
        <div className="stroop-intro">
          <div className="stroop-example">
            <p style={{ color: '#3b82f6', fontSize: 48, fontWeight: 800 }}>RED</p>
          </div>
          <div className="stroop-instructions">
            <h2>How to play</h2>
            <p>A word will appear on screen. Select the <strong>colour of the text</strong>, not what the word says.</p>
            <p>For example, if you see <span style={{color:'#3b82f6', fontWeight:700}}>"RED"</span> written in blue — select <strong>BLUE</strong>.</p>
            <p>You have <strong>60 seconds</strong>. Be as fast and accurate as you can!</p>
          </div>
          <button className="mg-play-btn" style={{ background: '#f59e0b', marginTop: 24 }} onClick={() => setPhase('playing')}>
            Start Game
          </button>
        </div>
      )}

      {phase === 'playing' && round && (
        <div className="stroop-game">
          <div className="stroop-progress">
            <div className="stroop-progress-bar" style={{ width: `${(timeLeft / 60) * 100}%` }} />
          </div>

          <div className="stroop-score-row">
            <span>Score: <strong>{score}</strong></span>
            <span>Accuracy: <strong>{accuracy}%</strong></span>
          </div>

          <div className={`stroop-word-box ${feedback || ''}`}>
            <p className="stroop-word" style={{ color: round.color.hex }}>
              {round.word.name}
            </p>
            <p className="stroop-hint">What colour is the text?</p>
          </div>

          <div className="stroop-options">
            {COLORS.map(c => (
              <button
                key={c.name}
                className="stroop-btn"
                style={{ borderColor: c.hex, color: c.hex }}
                onClick={() => handleAnswer(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="reaction-results">
          <h2>Time's Up!</h2>
          <div className="result-avg">
            <div className="result-avg-num">{accuracy}<span>%</span></div>
            <div className="result-avg-label">{score} correct out of {total} rounds</div>
            <div className="result-rating" style={{ color: getRating().color }}>{getRating().label}</div>
            <div className="result-desc">{getRating().desc}</div>
          </div>
          {saved && <div className="result-saved">Score saved to your profile!</div>}
          <div className="result-actions">
            <button className="mg-play-btn" style={{ background: '#f59e0b' }} onClick={reset}>Play Again</button>
            <button className="game-back-btn" onClick={onBack}>Back to Games</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StroopGame
