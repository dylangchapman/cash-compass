/**
 * Local storage cache utilities
 */

export const getCached = (key) => {
  try {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

export const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}
