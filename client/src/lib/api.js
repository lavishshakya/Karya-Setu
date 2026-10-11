// Thin fetch client for the Express API (Member 3).
//
// The UI runs on mock data from src/data until VITE_API_URL is set (see .env.example).
// To wire a screen to the backend, replace its mock import with an `api()` call, e.g.
//   const jobs = await api('/jobs?near=26.9,75.8&radius=10')

export const AUTH_STORAGE_KEY = 'ks_auth'

const BASE_URL = import.meta.env.VITE_API_URL
export const isMockMode = !BASE_URL

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

function getToken() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.token ?? null
  } catch {
    return null
  }
}

export async function api(path, { method = 'GET', body, headers, ...init } = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(data?.message ?? res.statusText, res.status, data)
  return data
}
