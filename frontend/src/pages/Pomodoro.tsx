import { useEffect, useState, useRef } from 'react'
import { pomodoroApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import toast from 'react-hot-toast'
import { useT } from '../i18n/useT'

type Mode = 'work' | 'short_break' | 'long_break'
const DURATIONS: Record<Mode, number> = { work: 25, short_break: 5, long_break: 15 }

export default function Pomodoro() {
  const t = useT()
  const LABELS: Record<Mode, string> = {
    work: t('modeWork'), short_break: t('modeShortBreak'), long_break: t('modeLongBreak'),
  }
  const [mode, setMode] = useState<Mode>('work')
  const [seconds, setSeconds] = useState(DURATIONS.work * 60)
  const [running, setRunning] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [stats, setStats] = useState<{ sessions: number; total_minutes: number } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadStats = async () => {
    const s = await apiCall(() => pomodoroApi.stats('week'))
    if (s) setStats(s)
  }

  useEffect(() => { loadStats() }, [])

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(s => s - 1), 1000)
    } else if (seconds === 0 && running) {
      setRunning(false)
      if (sessionId) {
        apiCall(() => pomodoroApi.complete(sessionId))
        setSessionId(null)
      }
      toast.success(`${LABELS[mode]} ✓`)
      loadStats()
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds])

  const start = async () => {
    if (!sessionId) {
      const data = await apiCall(() => pomodoroApi.start({ duration_minutes: DURATIONS[mode], type: mode }))
      if (data) setSessionId(data.id)
    }
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setSeconds(DURATIONS[mode] * 60)
    setSessionId(null)
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setRunning(false)
    setSeconds(DURATIONS[m] * 60)
    setSessionId(null)
  }

  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const progress = 1 - seconds / (DURATIONS[mode] * 60)
  const circumference = 2 * Math.PI * 90

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('pomodoro')}</h1>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex justify-center gap-2 mb-8">
            {(['work', 'short_break', 'long_break'] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${mode === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {LABELS[m]}
              </button>
            ))}
          </div>

          <div className="relative w-56 h-56 mx-auto mb-8">
            <svg width="224" height="224" className="-rotate-90">
              <circle cx="112" cy="112" r="90" fill="none" stroke="#f3f4f6" strokeWidth="12" />
              <circle cx="112" cy="112" r="90" fill="none" stroke="#6366f1" strokeWidth="12"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round" className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-900">{minutes}:{secs}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {!running ? (
              <button onClick={start} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700">{t('start')}</button>
            ) : (
              <button onClick={pause} className="bg-amber-500 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-amber-600">{t('pause')}</button>
            )}
            <button onClick={reset} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200">{t('reset')}</button>
          </div>
        </div>

        {stats && (
          <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('weeklyStats')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t('pomodoros')}</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.sessions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('focusTime')}</p>
                <p className="text-2xl font-bold text-indigo-600">{Math.floor(stats.total_minutes / 60)}h {stats.total_minutes % 60}m</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
