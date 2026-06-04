const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function setToken(token: string): void {
  localStorage.setItem('token', token)
}

export function removeToken(): void {
  localStorage.removeItem('token')
}

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
