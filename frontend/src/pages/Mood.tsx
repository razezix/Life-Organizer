import { useEffect, useState } from 'react'
import { moodApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import { useT } from '../i18n/useT'
import { usePrefs } from '../i18n/store'

interface MoodEntry { id: number; mood: number; energy?: number; note?: string; logged_at: string }
interface HeatmapPoint { date: string; mood: number }

const moodEmoji = ['😢', '😟', '😐', '🙂', '😄']
const moodColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export default function Mood() {
  const t = useT()
  const { lang } = usePrefs()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [heatmap, setHeatmap] = useState<HeatmapPoint[]>([])
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [note, setNote] = useState('')

  const load = async () => {
    const [e, h] = await Promise.all([
      apiCall(() => moodApi.list()),
      apiCall(() => moodApi.heatmap()),
    ])
    if (e) setEntries(e)
    if (h) setHeatmap(h)
  }

  useEffect(() => { load() }, [])

  const log = async () => {
    await apiCall(() => moodApi.log({ mood, energy, note: note || undefined }))
    setNote('')
    load()
  }

  const heatmapMap = Object.fromEntries(heatmap.map(p => [p.date, p.mood]))
  const locale = lang === 'ru' ? 'ru' : 'en'

  // Last 30 days grid
  const days: { date: string; mood?: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    days.push({ date: ds, mood: heatmapMap[ds] })
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('moodTitle')}</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">{t('howFeel')}</p>
          <div className="flex justify-around mb-4">
            {moodEmoji.map((e, i) => (
              <button key={i} onClick={() => setMood(i + 1)}
                className={`text-4xl transition-transform ${mood === i + 1 ? 'scale-150' : 'opacity-40'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">{t('energy')}: {energy}/5</p>
            <input type="range" min={1} max={5} value={energy} onChange={e => setEnergy(Number(e.target.value))}
              className="w-full accent-indigo-600" />
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder={t('noteOptional')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button onClick={log} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            {t('log')}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('last30Days')}</h2>
          <div className="grid grid-cols-10 gap-1.5">
            {days.map((d, i) => (
              <div key={i} className="aspect-square rounded"
                style={{
                  backgroundColor: d.mood ? moodColors[Math.round(d.mood) - 1] : '#f3f4f6',
                  opacity: d.mood ? 0.3 + (d.mood / 5) * 0.7 : 1,
                }}
                title={`${d.date}${d.mood ? `: ${d.mood.toFixed(1)}` : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('history')}</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.length === 0 && <p className="text-gray-400 text-sm text-center py-4">{t('noMoodEntries')}</p>}
            {entries.map(e => (
              <div key={e.id} className="border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">{moodEmoji[e.mood - 1]}</span>
                <div className="flex-1">
                  {e.note && <p className="text-sm text-gray-700">{e.note}</p>}
                  <p className="text-xs text-gray-400">{new Date(e.logged_at).toLocaleString(locale)}</p>
                </div>
                {e.energy && <span className="text-xs text-gray-500">⚡ {e.energy}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
