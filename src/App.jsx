import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
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

// Clears all guest localStorage data when a real user signs in
function ClearGuestDataOnSignIn() {
  const { isSignedIn, user } = useUser()
  useEffect(() => {
    if (isSignedIn && user) {
      localStorage.removeItem('bb_is_guest')
      localStorage.removeItem('bb_guest_habits')
      localStorage.removeItem('bb_total_checkins')
      localStorage.removeItem('bb_guest_id')
      // Keep brainboostSnapshot so onboarding answers are preserved
    }
  }, [isSignedIn, user?.id])
  return null
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
      <ClearGuestDataOnSignIn />
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
