import { useEffect, useState } from 'react'
import { healthApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import { useT } from '../i18n/useT'
import { usePrefs } from '../i18n/store'

interface Sleep { id: number; sleep_start: string; sleep_end: string; quality?: number }
interface Exercise { id: number; exercise_type: string; duration_minutes: number; calories?: number; logged_at: string }

export default function Health() {
  const t = useT()
  const { lang } = usePrefs()
  const [water, setWater] = useState({ total_ml: 0, goal_ml: 2000 })
  const [sleep, setSleep] = useState<Sleep[]>([])
  const [exercise, setExercise] = useState<Exercise[]>([])
  const [exType, setExType] = useState('')
  const [exDur, setExDur] = useState('')

  const load = async () => {
    const [w, s, e] = await Promise.all([
      apiCall(() => healthApi.waterToday()),
      apiCall(() => healthApi.listSleep()),
      apiCall(() => healthApi.listExercise()),
    ])
    if (w) setWater(w)
    if (s) setSleep(s)
    if (e) setExercise(e)
  }

  useEffect(() => { load() }, [])

  const addWater = async (ml: number) => {
    await apiCall(() => healthApi.logWater(ml))
    load()
  }

  const addExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exType.trim() || !exDur) return
    await apiCall(() => healthApi.logExercise({ exercise_type: exType, duration_minutes: parseInt(exDur) }))
    setExType(''); setExDur('')
    load()
  }

  const waterPct = Math.min(100, (water.total_ml / water.goal_ml) * 100)
  const locale = lang === 'ru' ? 'ru' : 'en'

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('health')}</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('water')}</h2>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-blue-500">{water.total_ml} ml</p>
            <p className="text-sm text-gray-400 mt-1">{t('ofGoal')} {water.goal_ml} ml</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
            <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${waterPct}%` }} />
          </div>
          <div className="flex gap-2 justify-center">
            {[200, 250, 500].map(ml => (
              <button key={ml} onClick={() => addWater(ml)}
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100">
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('exercise')}</h2>
          <form onSubmit={addExercise} className="flex gap-2 mb-4">
            <input value={exType} onChange={e => setExType(e.target.value)} placeholder={t('exerciseType')}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input type="number" value={exDur} onChange={e => setExDur(e.target.value)} placeholder={t('exerciseMinutes')}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">+</button>
          </form>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {exercise.length === 0 && <p className="text-gray-400 text-sm text-center py-4">{t('noExercise')}</p>}
            {exercise.map(e => (
              <div key={e.id} className="border border-gray-100 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-800">{e.exercise_type}</p>
                <p className="text-xs text-gray-400">{e.duration_minutes} {lang === 'ru' ? 'мин' : 'min'} · {new Date(e.logged_at).toLocaleDateString(locale)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('sleepRecent')}</h2>
          {sleep.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">{t('noSleep')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {sleep.slice(0, 6).map(s => {
                const start = new Date(s.sleep_start)
                const end = new Date(s.sleep_end)
                const hours = (end.getTime() - start.getTime()) / 3600000
                return (
                  <div key={s.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="font-bold text-lg text-gray-800">{hours.toFixed(1)} {t('hours')}</p>
                    <p className="text-xs text-gray-400">{start.toLocaleDateString(locale)}</p>
                    {s.quality && <p className="text-xs text-gray-500 mt-1">{t('quality')}: {'⭐'.repeat(s.quality)}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
