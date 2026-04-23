import { Link, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import './Navbar.css'
import { getSnapshot, hasCompletedOnboarding } from '../utils/recommendations'

function Navbar() {
  const location = useLocation()
  const snapshot = getSnapshot()
  const canAccessProtectedPages = hasCompletedOnboarding(snapshot)

  return (
    <nav className="navbar">
      <div className="navbar-logo">Brain<span>Boost</span></div>
      <div className="navbar-tabs">
        <Link to="/onboarding" className={`nav-tab ${location.pathname === '/onboarding' ? 'active' : ''}`}>Onboarding</Link>
        <Link to={canAccessProtectedPages ? '/dashboard' : '/onboarding'} className={`nav-tab ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
        <Link to={canAccessProtectedPages ? '/habits' : '/onboarding'} className={`nav-tab ${location.pathname === '/habits' ? 'active' : ''}`}>Habit Tracker</Link>
        <Link to="/games" className={`nav-tab ${location.pathname === '/games' ? 'active' : ''}`}>Mini Games</Link>
        <Link to={canAccessProtectedPages ? '/progress' : '/onboarding'} className={`nav-tab ${location.pathname === '/progress' ? 'active' : ''}`}>Progress</Link>
        <Link to={canAccessProtectedPages ? '/articles' : '/onboarding'} className={`nav-tab ${location.pathname === '/articles' ? 'active' : ''}`}>Article Hub</Link>
      </div>
      <UserButton />
    </nav>
  )
}

export default Navbar
