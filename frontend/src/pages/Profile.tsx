import { useEffect, useState } from 'react'
import { authApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useT } from '../i18n/useT'
import { usePrefs, type Lang, type Currency } from '../i18n/store'
import { TIMEZONES } from '../i18n/timezones'

interface UserProfile {
  id: number; email: string
  display_name?: string; timezone?: string
  currency?: string; language?: string
  avatar_url?: string
}

export default function Profile() {
  const t = useT()
  const { lang, currency, setLang, setCurrency } = usePrefs()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [tz, setTz] = useState('UTC')

  useEffect(() => {
    (async () => {
      const data = await apiCall(() => authApi.me())
      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || '')
        setTz(data.timezone || 'UTC')
        if (data.language) setLang(data.language as Lang)
        if (data.currency) setCurrency(data.currency as Currency)
      }
      setLoading(false)
    })()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = await apiCall(() => authApi.updateMe({
      display_name: displayName, timezone: tz, currency, language: lang,
    }))
    if (data) { setProfile(data); toast.success(t('profileUpdated')) }
  }

  if (loading) return <Layout><LoadingSpinner /></Layout>

  return (
    <Layout>
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('profile')}</h1>
        <form onSubmit={save} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('displayName')}</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('language')}</label>
            <select value={lang} onChange={e => setLang(e.target.value as Lang)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('currency')}</label>
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="KZT">Tenge (₸)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="RUB">Russian Ruble (₽)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('timezone')}</label>
            <select value={tz} onChange={e => setTz(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {TIMEZONES.map(z => (
                <option key={z.value} value={z.value}>{lang === 'ru' ? z.labelRu : z.labelEn}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            {t('save')}
          </button>
        </form>
      </div>
    </Layout>
  )
}
