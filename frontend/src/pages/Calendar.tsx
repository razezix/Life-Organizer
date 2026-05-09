import { useEffect, useState } from 'react'
import { calendarApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useT } from '../i18n/useT'
import { usePrefs } from '../i18n/store'

interface Event {
  id: string
  type: string
  title: string
  date?: string
  time?: string
  color: string
  status?: string
}

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0) }
function fmt(d: Date) { return d.toISOString().split('T')[0] }

export default function Calendar() {
  const t = useT()
  const { lang } = usePrefs()
  const [cursor, setCursor] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await apiCall(() => calendarApi.events(fmt(startOfMonth(cursor)), fmt(endOfMonth(cursor))))
    if (data) setEvents(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [cursor])

  const monthName = cursor.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })
  const firstDay = startOfMonth(cursor)
  const startWeekday = (firstDay.getDay() + 6) % 7  // Mon=0
  const daysInMonth = endOfMonth(cursor).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i))

  const eventsForDay = (d: Date) => events.filter(e => e.date === fmt(d))

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('calendar')}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-sm hover:bg-gray-50">←</button>
          <span className="font-medium text-gray-700 capitalize">{monthName}</span>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-sm hover:bg-gray-50">→</button>
          <button onClick={() => setCursor(new Date())}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">{t('today')}</button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {(lang === 'ru' ? ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map(d => (
              <div key={d} className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const isToday = d && fmt(d) === fmt(new Date())
              const evs = d ? eventsForDay(d) : []
              return (
                <div key={i} className={`min-h-[100px] border-r border-b p-2 ${!d ? 'bg-gray-50' : ''}`}>
                  {d && (
                    <>
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-600'}`}>
                        {d.getDate()}
                      </div>
                      <div className="space-y-1">
                        {evs.slice(0, 3).map(e => (
                          <div key={e.id} className="text-[10px] px-1.5 py-0.5 rounded text-white truncate"
                            style={{ backgroundColor: e.color }}>
                            {e.time && <span className="mr-1">{e.time.slice(0, 5)}</span>}
                            {e.title}
                          </div>
                        ))}
                        {evs.length > 3 && <div className="text-[10px] text-gray-400">+{evs.length - 3} {t('more')}</div>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}
