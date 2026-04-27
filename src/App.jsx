import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react'
import Navbar from './components/Navbar'
import GuestBanner from './components/GuestBanner'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import ArticleHub from './pages/ArticleHub'
import HabitTracker from './pages/HabitTracker'
import Progress from './pages/Progress'
import MiniGames from './pages/MiniGames'
import { getSnapshot, hasCompletedOnboarding } from './utils/recommendations'

function RequireAuth({ children }) {
  const isGuest = localStorage.getItem('bb_is_guest') === 'true'
  if (isGuest) return children
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  )
}

function RequireCompletedOnboarding({ children }) {
  const { isSignedIn } = useUser()
  const isGuest = localStorage.getItem('bb_is_guest') === 'true'
  const snapshot = getSnapshot()
  const isCompleted = hasCompletedOnboarding(snapshot)
  if (!isCompleted && !isSignedIn && !isGuest) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<><Navbar /><GuestBanner /><Onboarding /></>} />
        <Route path="/dashboard" element={<RequireAuth><Navbar /><GuestBanner /><RequireCompletedOnboarding><Dashboard /></RequireCompletedOnboarding></RequireAuth>} />
        <Route path="/habits" element={<RequireAuth><Navbar /><GuestBanner /><HabitTracker /></RequireAuth>} />
        <Route path="/progress" element={<RequireAuth><Navbar /><GuestBanner /><Progress /></RequireAuth>} />
        <Route path="/games" element={<><Navbar /><GuestBanner /><MiniGames /></>} />
        <Route path="/articles" element={<RequireAuth><Navbar /><GuestBanner /><RequireCompletedOnboarding><ArticleHub /></RequireCompletedOnboarding></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
