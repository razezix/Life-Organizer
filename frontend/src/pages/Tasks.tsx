import { useEffect, useState } from 'react'
import { tasksApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useT } from '../i18n/useT'

type Priority = 'low' | 'medium' | 'high'
type Status = 'todo' | 'done'
type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly'

interface Task {
  id: number
  title: string
  description?: string
  scheduled_date?: string
  scheduled_time?: string
  reminder_minutes_before?: number
  recurrence: Recurrence
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
  const t = useT()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [reminder, setReminder] = useState<number | undefined>()
  const [recurrence, setRecurrence] = useState<Recurrence>('none')

  const load = async () => {
    setLoading(true)
    const data = await apiCall(() => tasksApi.list())
    if (data) setTasks(data.items)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await apiCall(() => tasksApi.create({
      title, priority,
      category: category || undefined,
      scheduled_date: scheduledDate || undefined,
      scheduled_time: scheduledTime || undefined,
      reminder_minutes_before: reminder,
      recurrence,
    }))
    setTitle(''); setCategory(''); setScheduledDate(''); setScheduledTime('')
    setReminder(undefined); setRecurrence('none'); setShowAdvanced(false)
    load()
  }

  const toggle = async (task: Task) => {
    await apiCall(() => tasksApi.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' }))
    load()
  }

  const remove = async (id: number) => {
    await apiCall(() => tasksApi.remove(id))
    load()
  }

  const priorityLabels: Record<Priority, string> = {
    low: t('priorityLow'), medium: t('priorityMedium'), high: t('priorityHigh'),
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('navTasks')}</h1>

        <form onSubmit={create} className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('newTask')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="flex gap-3">
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1">
              <option value="low">{t('priorityLow')}</option>
              <option value="medium">{t('priorityMedium')}</option>
              <option value="high">{t('priorityHigh')}</option>
            </select>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder={t('category')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1" />
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
              className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">
              {showAdvanced ? '−' : '⏰'}
            </button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              {t('add')}
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('date')}</label>
                <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('time')}</label>
                <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('remindBefore')}</label>
                <select value={reminder ?? ''} onChange={e => setReminder(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">{t('noReminder')}</option>
                  <option value="5">5 {t('minutes')}</option>
                  <option value="15">15 {t('minutes')}</option>
                  <option value="30">30 {t('minutes')}</option>
                  <option value="60">1 {t('hour')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('recurrence')}</label>
                <select value={recurrence} onChange={e => setRecurrence(e.target.value as Recurrence)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="none">{t('recurNone')}</option>
                  <option value="daily">{t('recurDaily')}</option>
                  <option value="weekly">{t('recurWeekly')}</option>
                  <option value="monthly">{t('recurMonthly')}</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-4">
                <input type="checkbox" checked={task.status === 'done'} onChange={() => toggle(task)}
                  className="w-4 h-4 accent-indigo-600" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <div className="flex gap-3 mt-0.5">
                    {task.category && <p className="text-xs text-gray-400">{task.category}</p>}
                    {task.scheduled_date && (
                      <p className="text-xs text-indigo-500">
                        📅 {task.scheduled_date}{task.scheduled_time && ` ${task.scheduled_time.slice(0, 5)}`}
                      </p>
                    )}
                    {task.recurrence !== 'none' && <p className="text-xs text-purple-500">🔁 {task.recurrence}</p>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
                <button onClick={() => remove(task.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">{t('noTasks')}</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
