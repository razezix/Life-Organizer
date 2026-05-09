import api from './client'

// Auth
export const authApi = {
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  updateMe: (data: object) => api.put('/auth/me', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) => api.post('/auth/reset-password', { token, new_password }),
}

// Tasks
export const tasksApi = {
  list: (params?: { status?: string; category?: string; skip?: number; limit?: number }) => api.get('/tasks', { params }),
  create: (data: object) => api.post('/tasks', data),
  update: (id: number, data: object) => api.put(`/tasks/${id}`, data),
  remove: (id: number) => api.delete(`/tasks/${id}`),
}

// Habits
export const habitsApi = {
  list: () => api.get('/habits'),
  create: (data: object) => api.post('/habits', data),
  update: (id: number, data: object) => api.put(`/habits/${id}`, data),
  remove: (id: number) => api.delete(`/habits/${id}`),
  log: (id: number, log_date: string, completed = true) => api.post(`/habits/${id}/log`, { log_date, completed }),
}

// Goals
export const goalsApi = {
  list: () => api.get('/goals'),
  create: (data: object) => api.post('/goals', data),
  update: (id: number, data: object) => api.put(`/goals/${id}`, data),
  remove: (id: number) => api.delete(`/goals/${id}`),
  addMilestone: (goalId: number, title: string) => api.post(`/goals/${goalId}/milestones`, { title }),
  updateMilestone: (goalId: number, milestoneId: number, data: object) => api.put(`/goals/${goalId}/milestones/${milestoneId}`, data),
  removeMilestone: (goalId: number, milestoneId: number) => api.delete(`/goals/${goalId}/milestones/${milestoneId}`),
}

// Dashboard
export const dashboardApi = { get: () => api.get('/dashboard') }

// Notifications
export const notificationsApi = {
  list: (params?: { read?: boolean; skip?: number; limit?: number }) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// Calendar
export const calendarApi = {
  events: (start: string, end: string) => api.get('/calendar/events', { params: { start, end } }),
  reschedule: (type: string, id: number, new_date: string) => api.put(`/calendar/events/${type}/${id}/reschedule`, null, { params: { new_date } }),
}

// Finance
export const financeApi = {
  // Accounts
  listAccounts: () => api.get('/finance/accounts'),
  createAccount: (data: object) => api.post('/finance/accounts', data),
  updateAccount: (id: number, data: object) => api.put(`/finance/accounts/${id}`, data),
  removeAccount: (id: number) => api.delete(`/finance/accounts/${id}`),
  // Categories
  listCategories: () => api.get('/finance/categories'),
  createCategory: (data: object) => api.post('/finance/categories', data),
  // Transactions
  listTransactions: (params?: object) => api.get('/finance/transactions', { params }),
  createTransaction: (data: object) => api.post('/finance/transactions', data),
  updateTransaction: (id: number, data: object) => api.put(`/finance/transactions/${id}`, data),
  removeTransaction: (id: number) => api.delete(`/finance/transactions/${id}`),
  // Budgets
  listBudgets: () => api.get('/finance/budgets'),
  createBudget: (data: object) => api.post('/finance/budgets', data),
  removeBudget: (id: number) => api.delete(`/finance/budgets/${id}`),
  // Savings
  listSavings: () => api.get('/finance/savings'),
  createSavings: (data: object) => api.post('/finance/savings', data),
  updateSavings: (id: number, data: object) => api.put(`/finance/savings/${id}`, data),
  removeSavings: (id: number) => api.delete(`/finance/savings/${id}`),
}

// Finance analytics
export const financeAnalyticsApi = {
  spendingByCategory: (period = 'month') => api.get('/finance/analytics/spending-by-category', { params: { period } }),
  monthlyTrends: (months = 6) => api.get('/finance/analytics/monthly-trends', { params: { months } }),
  summary: () => api.get('/finance/analytics/summary'),
  tips: () => api.get('/finance/analytics/tips'),
}

// Pomodoro
export const pomodoroApi = {
  start: (data: object) => api.post('/pomodoro/start', data),
  complete: (id: number) => api.put(`/pomodoro/${id}/complete`),
  stats: (period = 'week') => api.get('/pomodoro/stats', { params: { period } }),
}

// Notes
export const notesApi = {
  list: (params?: object) => api.get('/notes', { params }),
  create: (data: object) => api.post('/notes', data),
  update: (id: number, data: object) => api.put(`/notes/${id}`, data),
  remove: (id: number) => api.delete(`/notes/${id}`),
}

// Health
export const healthApi = {
  logWater: (amount_ml: number) => api.post('/health/water', { amount_ml }),
  waterToday: () => api.get('/health/water/today'),
  listSleep: () => api.get('/health/sleep'),
  logSleep: (data: object) => api.post('/health/sleep', data),
  listExercise: () => api.get('/health/exercise'),
  logExercise: (data: object) => api.post('/health/exercise', data),
}

// Mood
export const moodApi = {
  list: () => api.get('/mood'),
  log: (data: object) => api.post('/mood', data),
  heatmap: () => api.get('/mood/heatmap'),
}

// Insights
export const insightsApi = {
  weekly: () => api.get('/insights/weekly'),
}

// Reviews
export const reviewsApi = {
  weekly: (end?: string) => api.get('/reviews/weekly', { params: end ? { end } : undefined }),
  monthly: (end?: string) => api.get('/reviews/monthly', { params: end ? { end } : undefined }),
}
