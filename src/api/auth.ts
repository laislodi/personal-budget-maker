import { ApiError } from './errors'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'))
    throw new ApiError('Session expired. Please log in again.', 401)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError((body as { detail?: string }).detail ?? 'Something went wrong', res.status)
  }
  return res.json() as Promise<T>
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  email: string
  name: string
  created_at: string
}

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse<TokenResponse>(res)
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return handleResponse<UserResponse>(res)
}
