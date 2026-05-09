import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

function extractError(err: unknown): string {
  if (err instanceof AxiosError) {
    const detail = err.response?.data?.detail
    if (Array.isArray(detail)) {
      return detail.map((d: { msg?: string }) => d.msg || '').filter(Boolean).join(', ') || err.message
    }
    if (typeof detail === 'string') return detail
    return err.message
  }
  return 'Произошла ошибка'
}

export function useApi<T>(apiFn: (...args: unknown[]) => Promise<{ data: T }>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFn(...args)
        setData(res.data)
        return res.data
      } catch (err) {
        const msg = extractError(err)
        setError(msg)
        toast.error(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFn]
  )

  return { data, loading, error, execute }
}

export async function apiCall<T>(fn: () => Promise<{ data: T }>, successMsg?: string): Promise<T | null> {
  try {
    const res = await fn()
    if (successMsg) toast.success(successMsg)
    return res.data
  } catch (err) {
    toast.error(extractError(err))
    return null
  }
}
