import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import { useT } from '../i18n/useT'

export default function ResetPassword() {
  const t = useT()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = await apiCall(() => authApi.resetPassword(token, password))
    if (data) setDone(true)
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">{t('invalidResetLink')}</p>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('newPassword')}</h1>
        {done ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">{t('passwordChanged')}</p>
            <Link to="/login" className="text-indigo-600 text-sm hover:underline">{t('signIn')}</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-gray-400 mt-1">{t('passwordHint')}</p>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              {t('changePassword')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
