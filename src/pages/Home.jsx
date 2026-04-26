import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()

  function handleGoToApp() {
    const snapshot = JSON.parse(localStorage.getItem('brainboostSnapshot') || '{}')
    const completed = snapshot && Object.keys(snapshot).length > 0
    if (completed) {
      navigate('/dashboard')
    } else {
      navigate('/onboarding')
    }
  }

  return (
    <div className="home-page">
      <div className="home-blob1" />
      <div className="home-blob2" />
      <div className="home-blob3" />

      <nav className="home-nav">
        <div className="home-logo">Brain<span>Boost</span></div>
        <div className="home-nav-links">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-ghost">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary">Get Started →</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <button className="btn-primary" onClick={handleGoToApp}>
              Enter BrainBoost →
            </button>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      <div className="home-hero">
        <div className="home-hero-left">
          <div className="home-badge">
            <span className="badge-dot" />
            Free for university students
          </div>
          <h1 className="home-title">
            Is your brain<br />
            <span className="gradient-text">running on empty?</span>
          </h1>
          <p className="home-subtitle">
            Sleep less, scroll more, skip the gym — sound familiar?
            See how your daily habits are affecting your brain health right now.
          </p>
          <div className="home-cta">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-hero">Check my brain health →</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="btn-hero-ghost">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button className="btn-hero" onClick={handleGoToApp}>
                Check my brain health →
              </button>
            </SignedIn>
          </div>
          <p className="home-reassure">Takes 5 minutes · No medical knowledge needed · 100% free</p>
        </div>

        <div className="home-hero-right">
          <img
            src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&q=80q=80"
            alt="Brain health"
            className="brain-hero-img"
          />
        </div>
      </div>

      <div className="home-tagline">
        <p>"Most students don't know what's draining their focus. <strong>Now you can.</strong>"</p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-num">1 <span>in 3</span></div>
          <div className="stat-label">Students report poor focus daily</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">5 <span>min</span></div>
          <div className="stat-label">To get your personalised score</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">0 <span>cost</span></div>
          <div className="stat-label">Completely free for students</div>
        </div>
      </div>

      <div className="home-final-cta">
        <h2>Ready to understand your brain?</h2>
        <p>Join students who are taking control of their brain health — one habit at a time.</p>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="btn-hero">Check my brain health →</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <button className="btn-hero" onClick={handleGoToApp}>
            Check my brain health →
          </button>
        </SignedIn>
      </div>

      <footer className="home-footer">
        <div className="home-logo">Brain<span>Boost</span></div>
        <p>FIT5120 Team Tech N1nja · SDG 3 Good Health and Well-being</p>
      </footer>
    </div>
  )
}

export default Home
