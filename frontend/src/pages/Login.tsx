import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AxiosError } from 'axios'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import { useT } from '../i18n/useT'
import { usePrefs, type Lang } from '../i18n/store'

function extractMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const detail = err.response?.data?.detail
    if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg || '').filter(Boolean).join(', ')
    if (typeof detail === 'string') return detail
  }
  return fallback
}

export default function Login() {
  const t = useT()
  const { lang, setLang } = usePrefs()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setTokens } = useAuthStore()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      setTokens(data.access_token, data.refresh_token)
      navigate('/')
    } catch (err) {
      setError(extractMessage(err, t('invalidCredentials')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('signIn')}</h1>
          <button onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium uppercase">
            {lang === 'en' ? 'EN' : 'RU'}
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>
        <p className="mt-3 text-sm text-center">
          <Link to="/forgot-password" className="text-gray-400 hover:underline">{t('forgotPassword')}</Link>
        </p>
        <p className="mt-2 text-sm text-center text-gray-500">
          {t('noAccount')}{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">{t('signUp')}</Link>
        </p>
      </div>
    </div>
  )
}
