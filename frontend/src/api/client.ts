import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const { refreshToken, setTokens, clearTokens } = useAuthStore.getState()
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refresh_token: refreshToken })
          setTokens(data.access_token, data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          clearTokens()
        }
      } else {
        clearTokens()
      }
    }
    return Promise.reject(error)
  }
)

export default api
