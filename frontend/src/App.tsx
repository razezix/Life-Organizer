import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Profile from './pages/Profile'
import Calendar from './pages/Calendar'
import Finance from './pages/Finance'
import FinanceAnalytics from './pages/FinanceAnalytics'
import Pomodoro from './pages/Pomodoro'
import Notes from './pages/Notes'
import Health from './pages/Health'
import Mood from './pages/Mood'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore()
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/habits" element={<PrivateRoute><Habits /></PrivateRoute>} />
        <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
        <Route path="/finance" element={<PrivateRoute><Finance /></PrivateRoute>} />
        <Route path="/finance/analytics" element={<PrivateRoute><FinanceAnalytics /></PrivateRoute>} />
        <Route path="/pomodoro" element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
        <Route path="/health" element={<PrivateRoute><Health /></PrivateRoute>} />
        <Route path="/mood" element={<PrivateRoute><Mood /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
