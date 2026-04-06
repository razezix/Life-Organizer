import { useEffect, useState } from 'react'
import { tasksApi } from '../api/endpoints'
import Layout from '../components/Layout'

type Priority = 'low' | 'medium' | 'high'
type Status = 'todo' | 'done'

interface Task {
  id: number
  title: string
  description?: string
  due_date?: string
  priority: Priority
  status: Status
  category?: string
  created_at: string
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState('')

  const load = () => tasksApi.list().then((r) => setTasks(r.data))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await tasksApi.create({ title, priority, category: category || undefined })
    setTitle('')
    setCategory('')
    load()
  }

  const toggle = async (task: Task) => {
    await tasksApi.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
    load()
  }

  const remove = async (id: number) => {
    await tasksApi.remove(id)
    load()
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Задачи</h1>

        <form onSubmit={create} className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Новая задача..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
            >
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Категория"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Добавить
            </button>
          </div>
        </form>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4"
            >
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => toggle(task)}
                className="w-4 h-4 accent-indigo-600"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                {task.category && (
                  <p className="text-xs text-gray-400 mt-0.5">{task.category}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <button
                onClick={() => remove(task.id)}
                className="text-gray-300 hover:text-red-400 text-lg transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">Нет задач. Добавь первую!</p>
          )}
        </div>
      </div>
    </Layout>
  )
}
