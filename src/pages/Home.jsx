import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const { isSignedIn } = useUser()

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
              Go to App →
            </button>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      <div className="home-hero">
        <div className="home-hero-left">
          <div className="home-badge">
            <span className="badge-dot" />
            SDG 3 · Brain Health Platform
          </div>
          <h1 className="home-title">
            Your brain health,<br />
            <span className="gradient-text">finally visible.</span>
          </h1>
          <p className="home-subtitle">
            Built for university students who want to understand
            how daily habits shape their cognitive performance.
          </p>
          <div className="home-cta">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-hero">Get Started Free →</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="btn-hero-ghost">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button className="btn-hero" onClick={handleGoToApp}>
                Go to Dashboard →
              </button>
            </SignedIn>
          </div>
        </div>

        <div className="home-hero-right">
          <div className="brain-visual">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="brain-svg">
              <defs>
                <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#eff6ff" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="200" cy="200" r="170" fill="url(#bgGlow)" />
              <path
                d="M200,120 C215,108 235,105 252,110 C270,115 285,128 292,145 C300,163 298,182 295,195 C305,205 310,220 305,235 C300,250 288,260 275,263 C268,272 258,278 245,278 C232,278 222,272 215,265 C210,268 205,270 200,270"
                fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" fillOpacity="0.5"/>
              <path d="M252,118 C258,130 255,145 248,150" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M280,135 C288,148 287,163 278,168" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M295,175 C305,183 306,198 297,205" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M290,228 C298,238 295,252 285,255" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M232,255 C240,260 242,270 235,273" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path
                d="M200,120 C185,108 165,105 148,110 C130,115 115,128 108,145 C100,163 102,182 105,195 C95,205 90,220 95,235 C100,250 112,260 125,263 C132,272 142,278 155,278 C168,278 178,272 185,265 C190,268 195,270 200,270"
                fill="#dbeafe" stroke="#3b82f6" strokeWidth="2.5" fillOpacity="0.5"/>
              <path d="M148,118 C142,130 145,145 152,150" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M120,135 C112,148 113,163 122,168" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M105,175 C95,183 94,198 103,205" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M110,228 C102,238 105,252 115,255" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <path d="M168,255 C160,260 158,270 165,273" fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.5"/>
              <line x1="200" y1="120" x2="200" y2="270" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5,4" strokeOpacity="0.6"/>
              <path d="M185,270 C185,285 190,295 200,298 C210,295 215,285 215,270" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.6"/>
              <circle cx="160" cy="155" r="4" fill="#2563eb" opacity="0.8">
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="240" cy="155" r="4" fill="#2563eb" opacity="0.8">
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="140" cy="205" r="4" fill="#3b82f6" opacity="0.7">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="260" cy="205" r="4" fill="#3b82f6" opacity="0.7">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="200" cy="145" r="5" fill="#1d4ed8" opacity="0.9">
                <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
              </circle>
              <line x1="200" y1="145" x2="160" y2="155" stroke="#93c5fd" strokeWidth="1.2" strokeOpacity="0.5">
                <animate attributeName="strokeOpacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/>
              </line>
              <line x1="200" y1="145" x2="240" y2="155" stroke="#93c5fd" strokeWidth="1.2" strokeOpacity="0.5">
                <animate attributeName="strokeOpacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/>
              </line>
              <line x1="160" y1="155" x2="140" y2="205" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.4">
                <animate attributeName="strokeOpacity" values="0.4;0.8;0.4" dur="1.8s" repeatCount="indefinite"/>
              </line>
              <line x1="240" y1="155" x2="260" y2="205" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.4">
                <animate attributeName="strokeOpacity" values="0.4;0.8;0.4" dur="2.2s" repeatCount="indefinite"/>
              </line>
              <g transform="translate(18, 130)">
                <rect width="88" height="38" rx="10" fill="white" opacity="0.92"/>
                <rect width="88" height="38" rx="10" fill="none" stroke="#dbeafe" strokeWidth="1"/>
                <text x="12" y="15" fontSize="8" fill="#1e40af" fontWeight="600">Sleep</text>
                <text x="12" y="29" fontSize="11" fill="#2563eb" fontWeight="700">7.5 hrs</text>
              </g>
              <g transform="translate(294, 120)">
                <rect width="88" height="38" rx="10" fill="white" opacity="0.92"/>
                <rect width="88" height="38" rx="10" fill="none" stroke="#dbeafe" strokeWidth="1"/>
                <text x="12" y="15" fontSize="8" fill="#1e40af" fontWeight="600">Activity</text>
                <text x="12" y="29" fontSize="11" fill="#2563eb" fontWeight="700">Active ✓</text>
              </g>
              <g transform="translate(18, 275)">
                <rect width="88" height="38" rx="10" fill="white" opacity="0.92"/>
                <rect width="88" height="38" rx="10" fill="none" stroke="#dbeafe" strokeWidth="1"/>
                <text x="12" y="15" fontSize="8" fill="#1e40af" fontWeight="600">Score</text>
                <text x="12" y="29" fontSize="11" fill="#2563eb" fontWeight="700">82 / 100</text>
              </g>
              <g transform="translate(294, 270)">
                <rect width="88" height="38" rx="10" fill="white" opacity="0.92"/>
                <rect width="88" height="38" rx="10" fill="none" stroke="#dbeafe" strokeWidth="1"/>
                <text x="12" y="15" fontSize="8" fill="#1e40af" fontWeight="600">Streak</text>
                <text x="12" y="29" fontSize="11" fill="#2563eb" fontWeight="700">5 days</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="home-tagline">
        <p>"Built for students who want to understand their brain —<br />not just track their steps."</p>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-num">5 <span>min</span></div>
          <div className="stat-label">Daily check-in time</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">3 <span>domains</span></div>
          <div className="stat-label">Sleep · Screen · Activity</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">100<span>%</span></div>
          <div className="stat-label">Free for students</div>
        </div>
      </div>

      <div className="home-final-cta">
        <h2>Ready to understand your brain?</h2>
        <p>Take the 5-minute assessment and get your personalised brain health score.</p>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="btn-hero">Start for Free →</button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <button className="btn-hero" onClick={handleGoToApp}>
            Go to Dashboard →
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
