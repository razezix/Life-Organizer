import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import { useT } from '../i18n/useT'

export default function ForgotPassword() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = await apiCall(() => authApi.forgotPassword(email))
    if (data) setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('resetPassword')}</h1>
        {sent ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">{t('resetEmailSent')}</p>
            <Link to="/login" className="text-indigo-600 text-sm hover:underline">{t('back')} → {t('signIn')}</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              {t('send')}
            </button>
            <p className="text-sm text-center text-gray-500">
              <Link to="/login" className="text-indigo-600 hover:underline">{t('back')} → {t('signIn')}</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
