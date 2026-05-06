import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import './Game.css'

const API = import.meta.env.VITE_API_URL || 'https://brainhealth-iteration2-production.up.railway.app/api'
const ICONS = ['🧠', '⚡', '🎯', '🔥', '💡', '🌙', '⭐', '🎮']

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

const OtherGames = ({ onBack }) => (
  <div className="other-games">
    <div className="other-games-label">Try more games</div>
    <div className="other-games-row">
      <button className="other-game-card" onClick={onBack}>
        <div className="other-game-card-icon" style={{ background: '#2563eb15', border: '1px solid #2563eb30' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div className="other-game-card-info">
          <div className="other-game-card-name">Reaction Test</div>
          <div className="other-game-card-skill" style={{ color: '#2563eb' }}>Processing Speed</div>
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

function createCards() {
  return shuffle([...ICONS, ...ICONS]).map((icon, i) => ({ id: i, icon, flipped: false, matched: false }))
}

function MemoryGame({ onBack }) {
  const { getToken } = useAuth()
  const [cards, setCards] = useState(createCards())
  const [selected, setSelected] = useState([])
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [showIntro,  setShowIntro]  = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [locked, setLocked] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (done || showIntro) return
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => clearInterval(interval)
  }, [done, showIntro])

  useEffect(() => {
    if (cards.every(c => c.matched) && cards.length > 0) {
      setDone(true)
      saveScore()
    }
  }, [cards])

  async function saveScore() {
    try {
      const token = await getToken()
      if (!token) return
      const finalMoves = moves
      const finalTime = Math.floor((Date.now() - startTime) / 1000)
      await fetch(`${API}/games`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: 'memory',
          score: finalMoves,
          metadata: { time_seconds: finalTime }
        })
      })
      setSaved(true)
    } catch (err) {
      console.error(err)
    }
  }

  function handleCardClick(card) {
    if (locked || card.flipped || card.matched) return
    if (selected.length === 1 && selected[0].id === card.id) return
    const newCards = cards.map(c => c.id === card.id ? { ...c, flipped: true } : c)
    const newSelected = [...selected, card]
    setCards(newCards)
    setSelected(newSelected)
    if (newSelected.length === 2) {
      setMoves(m => m + 1)
      setLocked(true)
      if (newSelected[0].icon === newSelected[1].icon) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === newSelected[0].id || c.id === newSelected[1].id ? { ...c, matched: true } : c
          ))
          setSelected([])
          setLocked(false)
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === newSelected[0].id || c.id === newSelected[1].id ? { ...c, flipped: false } : c
          ))
          setSelected([])
          setLocked(false)
        }, 1000)
      }
    }
  }

  function reset() {
    setCards(createCards())
    setSelected([])
    setMoves(0)
    setDone(false)
    setElapsed(0)
    setLocked(false)
    setSaved(false)
    setShowIntro(true)
  }

  const formatTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  function getRating() {
    if (moves <= 12) return { label: 'Exceptional Memory!', desc: 'Outstanding — your working memory is top tier.', color: '#16a34a' }
    if (moves <= 16) return { label: 'Great Job!', desc: 'Strong memory performance — well above average.', color: '#2563eb' }
    if (moves <= 20) return { label: 'Good Effort!', desc: 'Solid performance with room to improve.', color: '#7c3aed' }
    return { label: 'Keep Practicing!', desc: 'Practice regularly to sharpen your memory.', color: '#d97706' }
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="game-back" onClick={onBack}>← Back</button>
        <div className="game-title-area">
          <h1>Memory Match</h1>
          <span className="game-skill">Working Memory</span>
        </div>
        <div className="game-rounds">{formatTime(elapsed)}</div>
      </div>

      {showIntro && !done && (
        <div className="stroop-intro-card">
          <div className="stroop-intro-demo">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[0,1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={{ width: 48, height: 48, borderRadius: 12, background: [1,5,7].includes(i) ? '#7c3aed' : '#f3e8ff', border: `2px solid ${[1,5,7].includes(i) ? '#7c3aed' : '#e9d5ff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {i === 1 ? '🧠' : i === 5 ? '⭐' : i === 7 ? '🧠' : ''}
                </div>
              ))}
            </div>
            <div className="stroop-demo-arrow">→</div>
            <div className="stroop-demo-answer">
              <span>Find pairs</span>
              <div className="stroop-demo-chip" style={{ background: '#f3e8ff', color: '#7c3aed', border: '2px solid #7c3aed' }}>Match!</div>
            </div>
          </div>
          <div className="stroop-intro-rules">
            <div className="stroop-rule"><span className="stroop-rule-icon">🔍</span><span>Flip two cards to reveal the icons underneath</span></div>
            <div className="stroop-rule"><span className="stroop-rule-icon">🧠</span><span>Remember where each icon is — find <strong>matching pairs</strong></span></div>
            <div className="stroop-rule"><span className="stroop-rule-icon">🎯</span><span>Match all <strong>8 pairs</strong> in as few moves as possible</span></div>
            <div className="stroop-rule"><span className="stroop-rule-icon">📊</span><span>Fewer moves = better score — challenge your memory!</span></div>
          </div>
          <button className="stroop-start-btn" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}
            onClick={() => { setStartTime(Date.now()); setShowIntro(false) }}>
            Start Game →
          </button>
        </div>
      )}

      {!showIntro && !done ? (
        <>
          <div className="memory-stats">
            <span>Moves: <strong>{moves}</strong></span>
            <span>Matched: <strong>{cards.filter(c => c.matched).length / 2} / {ICONS.length}</strong></span>
          </div>
          <div className="memory-grid">
            {cards.map(card => (
              <div key={card.id} className={`memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`} onClick={() => handleCardClick(card)}>
                <div className="memory-card-inner">
                  <div className="memory-card-front">?</div>
                  <div className="memory-card-back">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="reaction-results">
          <h2>Well Done!</h2>
          <div className="result-avg">
            <div className="result-avg-num">{moves}<span>moves</span></div>
            <div className="result-avg-label">Completed in {formatTime(elapsed)}</div>
            <div className="result-rating" style={{ color: getRating().color }}>{getRating().label}</div>
            <div className="result-desc">{getRating().desc}</div>
          </div>
          {saved && <div className="result-saved">Score saved to your profile!</div>}
          <div className="result-actions">
            <button className="mg-play-btn" style={{ background: '#7c3aed' }} onClick={reset}>Play Again</button>
            <button className="game-back-btn" onClick={onBack}>Back to Games</button>
          </div>
        </div>
      )}
      <OtherGames onBack={onBack} />
    </div>
  )
}

export default MemoryGame
