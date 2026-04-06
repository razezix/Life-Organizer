import api from './client'

// Auth
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
}

// Tasks
export const tasksApi = {
  list: (params?: { status?: string; category?: string }) =>
    api.get('/tasks', { params }),
  create: (data: { title: string; description?: string; due_date?: string; priority?: string; category?: string }) =>
    api.post('/tasks', data),
  update: (id: number, data: object) => api.put(`/tasks/${id}`, data),
  remove: (id: number) => api.delete(`/tasks/${id}`),
}

// Habits
export const habitsApi = {
  list: () => api.get('/habits'),
  create: (data: { title: string; description?: string; frequency?: string }) =>
    api.post('/habits', data),
  update: (id: number, data: object) => api.put(`/habits/${id}`, data),
  remove: (id: number) => api.delete(`/habits/${id}`),
  log: (id: number, log_date: string, completed = true) =>
    api.post(`/habits/${id}/log`, { log_date, completed }),
}

// Goals
export const goalsApi = {
  list: () => api.get('/goals'),
  create: (data: { title: string; description?: string; target_date?: string }) =>
    api.post('/goals', data),
  update: (id: number, data: object) => api.put(`/goals/${id}`, data),
  remove: (id: number) => api.delete(`/goals/${id}`),
  addMilestone: (goalId: number, title: string) =>
    api.post(`/goals/${goalId}/milestones`, { title }),
  updateMilestone: (goalId: number, milestoneId: number, data: object) =>
    api.put(`/goals/${goalId}/milestones/${milestoneId}`, data),
  removeMilestone: (goalId: number, milestoneId: number) =>
    api.delete(`/goals/${goalId}/milestones/${milestoneId}`),
}

// Dashboard
export const dashboardApi = {
  get: () => api.get('/dashboard'),
}
