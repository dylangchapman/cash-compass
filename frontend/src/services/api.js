import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const financialAPI = {
  // Transactions
  getTransactions: async (limit = 100) => {
    const response = await api.get(`/api/transactions?limit=${limit}`)
    return response.data
  },

  // Dashboard
  getDashboardSummary: async () => {
    const response = await api.get('/api/dashboard/summary')
    return response.data
  },

  // Spending Insights
  getSpendingInsights: async () => {
    const response = await api.get('/api/insights/spending')
    return response.data
  },

  // Subscriptions
  getSubscriptionInsights: async () => {
    const response = await api.get('/api/insights/subscriptions')
    return response.data
  },

  // Goals
  analyzeGoals: async (goals) => {
    const response = await api.post('/api/insights/goals', goals)
    return response.data
  },

  // Coach Chat
  chatWithCoach: async (message, context = null) => {
    const response = await api.post('/api/coach', { message, context })
    return response.data
  },

  // Portfolio
  getPortfolio: async () => {
    const response = await api.get('/api/portfolio')
    return response.data
  },

  refreshPortfolio: async () => {
    const response = await api.post('/api/portfolio/refresh')
    return response.data
  },

  // Net Worth
  getNetWorth: async () => {
    const response = await api.get('/api/networth')
    return response.data
  },

  analyzeNetWorthGoal: async (goalAmount) => {
    const response = await api.post(`/api/networth/goal?goal_amount=${goalAmount}`)
    return response.data
  },
}

export default api
