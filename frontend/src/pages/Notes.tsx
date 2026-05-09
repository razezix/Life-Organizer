import { useEffect, useState } from 'react'
import { notesApi } from '../api/endpoints'
import { apiCall } from '../hooks/useApi'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useT } from '../i18n/useT'
import { usePrefs } from '../i18n/store'

interface Note {
  id: number; title: string; content?: string
  is_journal: boolean; mood?: number; tags?: string; pinned: boolean
  created_at: string; updated_at: string
}

const moodEmoji = ['😢', '😟', '😐', '🙂', '😄']

export default function Notes() {
  const t = useT()
  const { lang } = usePrefs()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number | undefined>()
  const [isJournal, setIsJournal] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await apiCall(() => notesApi.list({ search: search || undefined }))
    if (data) setNotes(data.items)
    setLoading(false)
  }

  useEffect(() => { load() }, [search])

  const startNew = () => {
    setEditing({ id: 0, title: '', is_journal: false, pinned: false, created_at: '', updated_at: '' })
    setTitle(''); setContent(''); setMood(undefined); setIsJournal(false)
  }

  const startEdit = (n: Note) => {
    setEditing(n)
    setTitle(n.title); setContent(n.content || ''); setMood(n.mood); setIsJournal(n.is_journal)
  }

  const save = async () => {
    if (!title.trim()) return
    if (editing && editing.id) {
      await apiCall(() => notesApi.update(editing.id, { title, content, mood, is_journal: isJournal }))
    } else {
      await apiCall(() => notesApi.create({ title, content, mood, is_journal: isJournal }))
    }
    setEditing(null)
    load()
  }

  const togglePin = async (n: Note) => {
    await apiCall(() => notesApi.update(n.id, { pinned: !n.pinned }))
    load()
  }

  const remove = async (id: number) => {
    await apiCall(() => notesApi.remove(id))
    if (editing?.id === id) setEditing(null)
    load()
  }

  return (
    <Layout>
      <div className="flex gap-6 h-[calc(100vh-100px)]">
        <div className="w-72 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">{t('notes')}</h1>
            <button onClick={startNew} className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-indigo-700">+</button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchNotes')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {loading ? <LoadingSpinner /> : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {notes.map(n => (
                <div key={n.id} onClick={() => startEdit(n)}
                  className={`bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow ${editing?.id === n.id ? 'ring-2 ring-indigo-500' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {n.pinned && <span className="text-xs">📌</span>}
                    {n.mood && <span>{moodEmoji[n.mood - 1]}</span>}
                    <p className="font-medium text-sm text-gray-800 flex-1 truncate">{n.title}</p>
                  </div>
                  {n.content && <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.updated_at).toLocaleDateString(lang === 'ru' ? 'ru' : 'en')}</p>
                </div>
              ))}
              {notes.length === 0 && <p className="text-gray-400 text-sm text-center py-8">{t('noNotes')}</p>}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm">
          {editing ? (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('noteTitle')}
                  className="text-xl font-bold flex-1 focus:outline-none" />
                {editing.id > 0 && (
                  <>
                    <button onClick={() => togglePin(editing)} className="text-lg">{editing.pinned ? '📌' : '📍'}</button>
                    <button onClick={() => remove(editing.id)} className="text-red-500 text-sm">{t('delete')}</button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isJournal} onChange={e => setIsJournal(e.target.checked)} className="accent-indigo-600" />
                  {t('journalMode')}
                </label>
                {isJournal && (
                  <div className="flex gap-1">
                    {moodEmoji.map((emo, i) => (
                      <button key={i} onClick={() => setMood(i + 1)}
                        className={`text-2xl ${mood === i + 1 ? 'scale-125' : 'opacity-50'} transition-transform`}>
                        {emo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={t('contentMd')}
                className="flex-1 resize-none focus:outline-none text-gray-700 leading-relaxed" />
              <button onClick={save} className="self-end bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                {t('save')}
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              {t('selectOrCreate')}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
