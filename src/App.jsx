import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import ArticleHub from './pages/ArticleHub'
import HabitTracker from './pages/HabitTracker'
import Progress from './pages/Progress'
import MiniGames from './pages/MiniGames'
import { getSnapshot, hasCompletedOnboarding } from './utils/recommendations'

function RequireAuth({ children }) {
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
  if (!isCompleted && !isSignedIn) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<><Navbar /><Onboarding /></>} />
        <Route path="/dashboard" element={<RequireAuth><Navbar /><RequireCompletedOnboarding><Dashboard /></RequireCompletedOnboarding></RequireAuth>} />
        <Route path="/habits" element={<RequireAuth><Navbar /><HabitTracker /></RequireAuth>} />
        <Route path="/progress" element={<RequireAuth><Navbar /><Progress /></RequireAuth>} />
        <Route path="/games" element={<><Navbar /><MiniGames /></>} />
        <Route path="/articles" element={<RequireAuth><Navbar /><RequireCompletedOnboarding><ArticleHub /></RequireCompletedOnboarding></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
