import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const financialAPI = {
  // Authentication
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },

  register: async (email, password, name) => {
    const response = await api.post('/api/auth/register', { email, password, name })
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

  // Backtesting
  getBacktestPresets: async () => {
    const response = await api.get('/api/backtest/presets')
    return response.data
  },

  compareStrategies: async (symbol = 'SPY', years = 5, initialCapital = 10000) => {
    const response = await api.get(`/api/backtest/compare?symbol=${symbol}&years=${years}&initial_capital=${initialCapital}`)
    return response.data
  },

  backtestAllocation: async (preset = '60_40', years = 5, initialCapital = 10000) => {
    const response = await api.get(`/api/backtest/allocation?preset=${preset}&years=${years}&initial_capital=${initialCapital}`)
    return response.data
  },

  backtestCustomAllocation: async (allocation, years = 5, initialCapital = 10000) => {
    const response = await api.post('/api/backtest/custom', { allocation, years, initial_capital: initialCapital })
    return response.data
  },

  // Time Machine
  getTimeMachineBaseline: async () => {
    const response = await api.get('/api/time-machine/baseline')
    return response.data
  },

  projectTimeMachine: async (scenario) => {
    const response = await api.post('/api/time-machine/project', scenario)
    return response.data
  },
}

export default api
