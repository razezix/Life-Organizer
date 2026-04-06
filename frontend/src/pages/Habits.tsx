import { useEffect, useState } from 'react'
import { habitsApi } from '../api/endpoints'
import Layout from '../components/Layout'

interface Habit {
  id: number
  title: string
  description?: string
  frequency: 'daily' | 'weekly'
  streak: number
  created_at: string
}

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')

  const load = () => habitsApi.list().then((r) => setHabits(r.data))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await habitsApi.create({ title, frequency })
    setTitle('')
    load()
  }

  const markToday = async (id: number) => {
    const today = new Date().toISOString().split('T')[0]
    await habitsApi.log(id, today, true)
    load()
  }

  const remove = async (id: number) => {
    await habitsApi.remove(id)
    load()
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Привычки</h1>

        <form onSubmit={create} className="bg-white rounded-xl shadow-sm p-5 mb-6 flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Новая привычка..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
          </select>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Добавить
          </button>
        </form>

        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{habit.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {habit.frequency === 'daily' ? 'Ежедневно' : 'Еженедельно'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-indigo-600">{habit.streak}</p>
                <p className="text-xs text-gray-400">streak</p>
              </div>
              <button
                onClick={() => markToday(habit.id)}
                className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
              >
                ✓ Сегодня
              </button>
              <button
                onClick={() => remove(habit.id)}
                className="text-gray-300 hover:text-red-400 text-lg transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          {habits.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Нет привычек. Начни отслеживать!</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
