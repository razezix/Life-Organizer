import { useEffect, useState } from 'react'
import { notificationsApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import { useT } from '../i18n/useT'
import { usePrefs } from '../i18n/store'

interface Notification { id: number; title: string; body?: string; type: string; read: boolean; created_at: string }

export default function NotificationBell() {
  const t = useT()
  const { lang } = usePrefs()
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])

  const loadCount = async () => {
    try {
      const r = await notificationsApi.unreadCount()
      setUnread(r.data.count)
    } catch { /* ignore */ }
  }

  const loadList = async () => {
    const data = await apiCall(() => notificationsApi.list({ limit: 10 }))
    if (data) setItems(data.items)
  }

  useEffect(() => {
    loadCount()
    const t = setInterval(loadCount, 30000)
    return () => clearInterval(t)
  }, [])

  const toggle = () => {
    if (!open) loadList()
    setOpen(!open)
  }

  const markAllRead = async () => {
    await apiCall(() => notificationsApi.markAllRead())
    loadCount(); loadList()
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="relative p-2 hover:bg-gray-100 rounded-lg">
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <p className="font-semibold text-sm">{t('notifications')}</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">{t('markAllRead')}</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('noNotifications')}</p>
            ) : items.map(n => (
              <div key={n.id} className={`px-4 py-3 border-b last:border-b-0 ${!n.read ? 'bg-indigo-50' : ''}`}>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString(lang === 'ru' ? 'ru' : 'en')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
