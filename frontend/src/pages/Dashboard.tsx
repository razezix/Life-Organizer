import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/endpoints'
import Layout from '../components/Layout'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface DashboardData {
  tasks: { total: number; done: number; this_week_total: number; this_week_done: number }
  habits: { total: number; top_streak: number; streaks: { id: number; title: string; streak: number }[] }
  goals: { active: number; completed: number; avg_progress: number }
  weekly_chart: { date: string; completed: number }[]
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
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    dashboardApi.get().then((r) => setData(r.data))
  }, [])

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-400">Загрузка...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Задач выполнено"
          value={`${data.tasks.done}/${data.tasks.total}`}
          sub="всего"
        />
        <StatCard
          label="За эту неделю"
          value={`${data.tasks.this_week_done}/${data.tasks.this_week_total}`}
          sub="задач"
        />
        <StatCard
          label="Лучший streak"
          value={data.habits.top_streak}
          sub="дней подряд"
        />
        <StatCard
          label="Прогресс целей"
          value={`${data.goals.avg_progress}%`}
          sub={`${data.goals.active} активных`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Выполненные задачи (7 дней)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.weekly_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Streaks привычек</h2>
          {data.habits.streaks.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет привычек</p>
          ) : (
            <div className="space-y-3">
              {data.habits.streaks.map((h) => (
                <div key={h.id} className="flex items-center gap-3">
                  <p className="text-sm text-gray-700 flex-1 truncate">{h.title}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-indigo-600 font-bold">{h.streak}</span>
                    <span className="text-xs text-gray-400">дней</span>
                  </div>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(h.streak * 5, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
