import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useT } from '../i18n/useT'
import { usePrefs } from '../i18n/store'
import NotificationBell from './NotificationBell'

export default function Layout({ children }: { children: React.ReactNode }) {
  const t = useT()
  const { lang, setLang } = usePrefs()
  const { clearTokens } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const logout = () => { clearTokens(); navigate('/login') }

  const sections = [
    {
      title: t('navPlanning'),
      links: [
        { to: '/', label: t('navDashboard') },
        { to: '/tasks', label: t('navTasks') },
        { to: '/calendar', label: t('navCalendar') },
        { to: '/pomodoro', label: t('navPomodoro') },
      ],
    },
    {
      title: t('navHabitsGoals'),
      links: [
        { to: '/habits', label: t('navHabits') },
        { to: '/goals', label: t('navGoals') },
      ],
    },
    {
      title: t('navFinance'),
      links: [
        { to: '/finance', label: t('navTransactions') },
        { to: '/finance/analytics', label: t('navAnalytics') },
      ],
    },
    {
      title: t('navHealth'),
      links: [
        { to: '/health', label: t('navHealthTracker') },
        { to: '/mood', label: t('navMood') },
      ],
    },
    {
      title: t('navNotes'),
      links: [
        { to: '/notes', label: t('navNotes') },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white shadow-sm flex flex-col overflow-y-auto">
        <div className="px-6 py-5 border-b">
          <Link to="/" className="font-bold text-lg text-indigo-600">{t('appName')}</Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-5">
          {sections.map((s) => (
            <div key={s.title}>
              <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.title}</p>
              <div className="space-y-0.5">
                {s.links.map((l) => (
                  <Link key={l.to} to={l.to}
                    className={`block px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      pathname === l.to ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t px-3 py-3 space-y-1">
          <Link to="/profile"
            className={`block px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === '/profile' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {t('navProfile')}
          </Link>
          <button onClick={logout}
            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
            {t('logout')}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b flex items-center justify-end px-6 gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium uppercase"
            title="Switch language">
            {lang === 'en' ? 'EN' : 'RU'}
          </button>
          <NotificationBell />
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
