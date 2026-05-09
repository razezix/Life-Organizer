import { useEffect, useState } from 'react'
import { dashboardApi, insightsApi, reviewsApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useT } from '../i18n/useT'
import { usePrefs, formatMoney } from '../i18n/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface DashboardData {
  tasks: { total: number; done: number; this_week_total: number; this_week_done: number }
  habits: { total: number; top_streak: number; streaks: { id: number; title: string; streak: number }[] }
  goals: { active: number; completed: number; avg_progress: number }
  weekly_chart: { date: string; completed: number }[]
}

interface Insight { icon: string; title: string; text: string }

interface Review {
  tasks: { total: number; done: number }
  finance: { expense: number; income: number; balance: number }
  mood: { avg: number }
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const t = useT()
  const { currency } = usePrefs()
  const [data, setData] = useState<DashboardData | null>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [review, setReview] = useState<Review | null>(null)

  useEffect(() => {
    apiCall(() => dashboardApi.get()).then(d => d && setData(d))
    apiCall(() => insightsApi.weekly()).then(d => d && setInsights(d))
    apiCall(() => reviewsApi.weekly()).then(d => d && setReview(d))
  }, [])

  if (!data) return <Layout><LoadingSpinner /></Layout>

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={t('tasksDone')} value={`${data.tasks.done}/${data.tasks.total}`} sub={t('total')} />
        <StatCard label={t('thisWeek')} value={`${data.tasks.this_week_done}/${data.tasks.this_week_total}`} sub={t('tasks').toLowerCase()} />
        <StatCard label={t('bestStreak')} value={data.habits.top_streak} sub={t('inARow')} />
        <StatCard label={t('goalsProgress')} value={`${data.goals.avg_progress}%`} sub={`${data.goals.active} ${t('active')}`} />
      </div>

      {insights.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('aiInsights')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 flex gap-3">
                <span className="text-2xl">{ins.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{ins.title}</p>
                  <p className="text-xs text-gray-500">{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('completedTasks7d')}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.weekly_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('habitStreaks')}</h2>
          {data.habits.streaks.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('noHabits')}</p>
          ) : (
            <div className="space-y-3">
              {data.habits.streaks.map(h => (
                <div key={h.id} className="flex items-center gap-3">
                  <p className="text-sm text-gray-700 flex-1 truncate">{h.title}</p>
                  <span className="text-indigo-600 font-bold">{h.streak}</span>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${Math.min(h.streak * 5, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {review && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('weekReview')}</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">{t('tasks')}</p>
              <p className="text-xl font-bold text-gray-900">{review.tasks.done}/{review.tasks.total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('income')}</p>
              <p className="text-xl font-bold text-green-600">{formatMoney(review.finance.income, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('expense')}</p>
              <p className="text-xl font-bold text-red-600">{formatMoney(review.finance.expense, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('mood')}</p>
              <p className="text-xl font-bold text-gray-900">{review.mood.avg ? review.mood.avg.toFixed(1) : '—'}/5</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
