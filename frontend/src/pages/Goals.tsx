import { useEffect, useState } from 'react'
import { goalsApi } from '../api/endpoints'
import Layout from '../components/Layout'

interface Milestone { id: number; title: string; completed: boolean }
interface Goal {
  id: number
  title: string
  description?: string
  target_date?: string
  progress: number
  status: 'active' | 'completed' | 'abandoned'
  milestones: Milestone[]
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [title, setTitle] = useState('')
  const [milestoneInputs, setMilestoneInputs] = useState<Record<number, string>>({})

  const load = () => goalsApi.list().then((r) => setGoals(r.data))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await goalsApi.create({ title })
    setTitle('')
    load()
  }

  const updateProgress = async (id: number, progress: number) => {
    await goalsApi.update(id, { progress })
    load()
  }

  const addMilestone = async (goalId: number) => {
    const t = milestoneInputs[goalId]?.trim()
    if (!t) return
    await goalsApi.addMilestone(goalId, t)
    setMilestoneInputs((prev) => ({ ...prev, [goalId]: '' }))
    load()
  }

  const toggleMilestone = async (goalId: number, m: Milestone) => {
    await goalsApi.updateMilestone(goalId, m.id, { completed: !m.completed })
    load()
  }

  const remove = async (id: number) => {
    await goalsApi.remove(id)
    load()
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Цели</h1>

        <form onSubmit={create} className="bg-white rounded-xl shadow-sm p-5 mb-6 flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Новая цель..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Добавить
          </button>
        </form>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-800">{goal.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{goal.status}</p>
                </div>
                <button onClick={() => remove(goal.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Прогресс</span>
                  <span>{goal.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={goal.progress}
                  onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {goal.milestones.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={() => toggleMilestone(goal.id, m)}
                      className="accent-indigo-600"
                    />
                    <span className={m.completed ? 'line-through text-gray-400' : 'text-gray-700'}>{m.title}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={milestoneInputs[goal.id] || ''}
                  onChange={(e) => setMilestoneInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                  placeholder="Добавить шаг..."
                  onKeyDown={(e) => e.key === 'Enter' && addMilestone(goal.id)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  onClick={() => addMilestone(goal.id)}
                  className="text-indigo-600 text-xs font-medium hover:underline"
                >
                  + Шаг
                </button>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Нет целей. Поставь первую!</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
