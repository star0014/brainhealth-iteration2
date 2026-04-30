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

const isGuestUser = () => localStorage.getItem('bb_is_guest') === 'true'
const guestHasOnboarded = () => {
  const snapshot = getSnapshot()
  return hasCompletedOnboarding(snapshot)
}

function RequireAuth({ children }) {
  if (isGuestUser()) return children
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  )
}

function RequireCompletedOnboarding({ children }) {
  const { isSignedIn } = useUser()
  const snapshot = getSnapshot()
  const isCompleted = hasCompletedOnboarding(snapshot)
  if (!isCompleted && !isSignedIn && !isGuestUser()) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

// Guests who've already completed onboarding get redirected to dashboard
function OnboardingRoute() {
  if (isGuestUser() && guestHasOnboarded()) {
    return <Navigate to="/dashboard" replace />
  }
  return <><Navbar /><GuestBanner /><Onboarding /></>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/dashboard" element={<RequireAuth><Navbar /><GuestBanner /><RequireCompletedOnboarding><Dashboard /></RequireCompletedOnboarding></RequireAuth>} />
        <Route path="/habits"    element={<RequireAuth><Navbar /><GuestBanner /><HabitTracker /></RequireAuth>} />
        <Route path="/progress"  element={<RequireAuth><Navbar /><GuestBanner /><Progress /></RequireAuth>} />
        <Route path="/games"     element={<><Navbar /><GuestBanner /><MiniGames /></>} />
        <Route path="/articles"  element={<RequireAuth><Navbar /><GuestBanner /><RequireCompletedOnboarding><ArticleHub /></RequireCompletedOnboarding></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
