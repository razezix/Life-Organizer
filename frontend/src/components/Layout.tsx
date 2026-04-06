import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/tasks', label: 'Задачи' },
  { to: '/habits', label: 'Привычки' },
  { to: '/goals', label: 'Цели' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { clearTokens } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const logout = () => {
    clearTokens()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white shadow-sm flex flex-col">
        <div className="px-6 py-5 border-b">
          <span className="font-bold text-lg text-indigo-600">Life Organizer</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mx-3 mb-4 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md text-left transition-colors"
        >
          Выйти
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
