import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Habits from './pages/Habits'
import Goals from './pages/Goals'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore()
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/habits" element={<PrivateRoute><Habits /></PrivateRoute>} />
        <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
