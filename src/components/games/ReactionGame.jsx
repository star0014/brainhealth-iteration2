import { useState, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import './Game.css'

const API = import.meta.env.VITE_API_URL || 'https://brainhealth-iteration2-production.up.railway.app/api'
const STATES = { WAITING: 'waiting', READY: 'ready', GO: 'go', RESULT: 'result', TOOSOON: 'toosoon' }

const OtherGames = ({ onBack }) => (
  <div className="other-games">
    <div className="other-games-label">Try more games</div>
    <div className="other-games-row">
      <button className="other-game-card" onClick={onBack}>
        <div className="other-game-card-icon" style={{ background: '#7c3aed15', border: '1px solid #7c3aed30' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        </div>
        <div className="other-game-card-info">
          <div className="other-game-card-name">Memory Match</div>
          <div className="other-game-card-skill" style={{ color: '#7c3aed' }}>Working Memory</div>
        </div>
        <div className="other-game-card-arrow">→</div>
      </button>
      <button className="other-game-card" onClick={onBack}>
        <div className="other-game-card-icon" style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="other-game-card-info">
          <div className="other-game-card-name">Stroop Test</div>
          <div className="other-game-card-skill" style={{ color: '#f59e0b' }}>Attention Control</div>
        </div>
        <div className="other-game-card-arrow">→</div>
      </button>
    </div>
  </div>
)

function ReactionGame({ onBack }) {
  const { getToken } = useAuth()
  const [state, setState] = useState(STATES.WAITING)
  const [reactionTime, setReactionTime] = useState(null)
  const [results, setResults] = useState([])
  const [round, setRound] = useState(0)
  const [saved, setSaved] = useState(false)
  const startTime = useRef(null)
  const timer = useRef(null)
  const TOTAL_ROUNDS = 5

  function startRound() {
    setState(STATES.READY)
    const delay = 2000 + Math.random() * 3000
    timer.current = setTimeout(() => {
      setState(STATES.GO)
      startTime.current = Date.now()
    }, delay)
  }

  async function saveScore(avgMs, allResults) {
    try {
      const token = await getToken()
      if (!token) return
      await fetch(`${API}/games`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: 'reaction',
          score: avgMs,
          metadata: { rounds: allResults }
        })
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
    }
  }

  function handleClick() {
    if (state === STATES.WAITING) {
      startRound()
    } else if (state === STATES.READY) {
      clearTimeout(timer.current)
      setState(STATES.TOOSOON)
    } else if (state === STATES.GO) {
      const rt = Date.now() - startTime.current
      setReactionTime(rt)
      const newResults = [...results, rt]
      setResults(newResults)
      const newRound = round + 1
      setRound(newRound)
      setState(STATES.RESULT)
      if (newRound >= TOTAL_ROUNDS) {
        const avg = Math.round(newResults.reduce((a, b) => a + b, 0) / newResults.length)
        saveScore(avg, newResults)
      }
    } else if (state === STATES.RESULT || state === STATES.TOOSOON) {
      if (round >= TOTAL_ROUNDS) return
      startRound()
    }
  }

  function reset() {
    clearTimeout(timer.current)
    setState(STATES.WAITING)
    setResults([])
    setRound(0)
    setReactionTime(null)
    setSaved(false)
    setShowIntro(true)
  }

  const avg = results.length > 0 ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : null
  const done = round >= TOTAL_ROUNDS

  function getRating(ms) {
    if (ms < 200) return { label: 'Exceptional!', desc: 'Your processing speed is in the top tier.', color: '#16a34a' }
    if (ms < 250) return { label: 'Great!', desc: 'Your reaction time is well above average.', color: '#2563eb' }
    if (ms < 300) return { label: 'Good', desc: 'Your reaction speed is solid.', color: '#7c3aed' }
    if (ms < 350) return { label: 'Average', desc: 'Room to improve with regular practice.', color: '#d97706' }
    return { label: 'Keep Practicing', desc: 'Try again after a good night\'s sleep!', color: '#94a3b8' }
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="game-back" onClick={onBack}>← Back</button>
        <div className="game-title-area">
          <h1>Reaction Test</h1>
          <span className="game-skill">Processing Speed</span>
        </div>
        <div className="game-rounds">{round} / {TOTAL_ROUNDS}</div>
      </div>

      {showIntro && !done && (
        <div className="stroop-intro-card">
          <div className="stroop-intro-demo">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#16a34a' }}>TAP!</div>
            </div>
            <div className="stroop-demo-arrow">→</div>
            <div className="stroop-demo-answer">
              <span>As fast as</span>
              <div className="stroop-demo-chip" style={{ background: '#eff6ff', color: '#2563eb', border: '2px solid #2563eb' }}>243ms</div>
            </div>
          </div>
          <div className="stroop-intro-rules">
            <div className="stroop-rule"><span className="stroop-rule-icon">👀</span><span>Watch the screen — it will turn <strong>green</strong></span></div>
            <div className="stroop-rule"><span className="stroop-rule-icon">⚡</span><span>Tap as <strong>fast as possible</strong> the moment it turns green</span></div>
            <div className="stroop-rule"><span className="stroop-rule-icon">⛔</span><span>Don't tap early — wait for green or it won't count!</span></div>
            <div className="stroop-rule"><span className="stroop-rule-icon">🔁</span><span>You get <strong>5 rounds</strong> — your average time is your score</span></div>
          </div>
          <button className="stroop-start-btn" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }} onClick={() => setShowIntro(false)}>
            Start Game →
          </button>
        </div>
      )}

      {!showIntro && !done ? (
        <div className={`reaction-box ${state}`} onClick={handleClick}>
          {state === STATES.WAITING && (
            <div className="reaction-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <p>Tap to Start</p>
              <span>React as fast as you can when the screen turns green</span>
            </div>
          )}
          {state === STATES.READY && (
            <div className="reaction-content">
              <div className="reaction-dots"><span/><span/><span/></div>
              <p>Wait for green...</p>
              <span>Don't tap yet!</span>
            </div>
          )}
          {state === STATES.GO && (
            <div className="reaction-content">
              <p className="reaction-go">TAP!</p>
            </div>
          )}
          {state === STATES.RESULT && (
            <div className="reaction-content">
              <div className="reaction-time">{reactionTime}<span>ms</span></div>
              <p>{getRating(reactionTime).label}</p>
              <span>Tap to continue</span>
            </div>
          )}
          {state === STATES.TOOSOON && (
            <div className="reaction-content">
              <p>Too soon!</p>
              <span>Wait for green. Tap to try again.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="reaction-results">
          <h2>Your Results</h2>
          <div className="result-avg">
            <div className="result-avg-num">{avg}<span>ms</span></div>
            <div className="result-avg-label">Average Reaction Time</div>
            <div className="result-rating" style={{ color: getRating(avg).color }}>{getRating(avg).label}</div>
            <div className="result-desc">{getRating(avg).desc}</div>
          </div>
          <div className="result-rounds">
            {results.map((r, i) => (
              <div key={i} className="result-round">
                <span>Round {i + 1}</span>
                <span style={{ color: getRating(r).color }}>{r}ms — {getRating(r).label}</span>
              </div>
            ))}
          </div>
          {saved && <div className="result-saved">Score saved to your profile!</div>}
          <div className="result-actions">
            <button className="mg-play-btn" style={{ background: '#2563eb' }} onClick={reset}>Play Again</button>
            <button className="game-back-btn" onClick={onBack}>Back to Games</button>
          </div>
        </div>
      )}
      <OtherGames onBack={onBack} />
    </div>
  )
}

export default ReactionGame
