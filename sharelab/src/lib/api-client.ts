import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

export interface ApiResponse<T> {
  data: T
  message: string
  errors?: Record<string, string[]>
  meta?: {
    success?: boolean
    page?: number
    per_page?: number
    total?: number
    last_page?: number
    [key: string]: unknown
  }
}

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'owner' | 'manager' | 'admin'
  avatar?: string
}

export interface AuthSession {
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

/** Fired when a refresh attempt fails and the session is truly gone. */
export const AUTH_EXPIRED_EVENT = 'sharelab:auth-expired'

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data
    if (data?.message) return data.message
    if (error.message) return error.message
  }

  if (error instanceof Error && error.message) return error.message

  return fallback
}

export const getApiFieldErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return {}

  const fieldErrors = error.response?.data.errors
  if (!fieldErrors) return {}

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? (messages[0] ?? '') : String(messages),
    ]),
  )
}

export const unwrapResponse = <T>(response: ApiResponse<T>): T => response.data
export const handleValidationErrors = (
  error: unknown,
): Record<string, string> => getApiFieldErrors(error)

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const isAuthEndpoint = (url: string) =>
  ['/login', '/register', '/refresh'].some((endpoint) => url.endsWith(endpoint))

// On Vercel the SPA and /api share an origin: vercel.json rewrites /api/* to
// the API container, so the relative default keeps the auth cookies first-party
// (SameSite=Lax works). VITE_API_URL is for pointing a build straight at a
// cross-origin API, e.g. VITE_API_URL=https://api.example.com/api.
const defaultBaseURL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api'

const absoluteApiBase = /^https?:\/\//i.test(defaultBaseURL) ? defaultBaseURL : ''

/**
 * The API answers with root-relative asset paths (`/storage/...`, signed
 * credential downloads). Those must resolve against the API origin: the same
 * origin as the SPA by default (Vite proxy / Vercel rewrite), or the explicit
 * VITE_API_URL host for a cross-origin build. Absolute URLs pass through.
 */
export const resolveApiUrl = (url: string): string => {
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || !absoluteApiBase) return url

  return new URL(url, absoluteApiBase).toString()
}

/**
 * The API answers with `{ data, message, errors, meta }`. Anything else (an
 * HTML page from a misrouted request, an empty body, a proxy error) must fail
 * loudly here instead of reaching components as `undefined` and crashing the
 * render tree.
 */
const unwrapEnvelope = <T>(
  body: unknown,
  url: string | undefined,
): ApiResponse<T> => {
  if (typeof body === 'object' && body !== null && 'data' in body) {
    return body as ApiResponse<T>
  }

  const kind = Array.isArray(body)
    ? 'an array'
    : body === null
      ? 'an empty body'
      : typeof body === 'string'
        ? 'a non-JSON body'
        : `a ${typeof body}`

  throw new Error(
    `Unexpected API response from ${url ?? 'the API'}: expected a JSON envelope but received ${kind}. Check the /api rewrite in vercel.json (or VITE_API_URL) and that the API is reachable.`,
  )
}

const baseConfig = {
  baseURL: defaultBaseURL,
  withCredentials: true,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
} as const

export class ApiClient {
  private axiosInstance: AxiosInstance

  private refreshClient: AxiosInstance

  private refreshPromise: Promise<boolean> | null = null

  constructor(baseURL = defaultBaseURL) {
    this.axiosInstance = axios.create({ ...baseConfig, baseURL })
    this.refreshClient = axios.create({ ...baseConfig, baseURL })

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as RetryableConfig | undefined
        const status = error.response?.status
        const url = original?.url ?? ''

        if (
          status !== 401 ||
          !original ||
          original._retry ||
          isAuthEndpoint(url)
        ) {
          return Promise.reject(error)
        }

        original._retry = true
        const refreshed = await this.refreshSession()

        if (refreshed) {
          return this.axiosInstance.request(original)
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
        }

        return Promise.reject(error)
      },
    )
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<unknown> = await this.axiosInstance.get(
      url,
      config,
    )
    return unwrapEnvelope<T>(response.data, url)
  }

  async post<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<unknown> = await this.axiosInstance.post(
      url,
      data,
      config,
    )
    return unwrapEnvelope<TResponse>(response.data, url)
  }

  async postForm<TResponse = unknown>(
    url: string,
    data: FormData,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<ApiResponse<TResponse>> =
      await this.axiosInstance.post(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      })
    return response.data
  }

  async patch<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<unknown> = await this.axiosInstance.patch(
      url,
      data,
      config,
    )
    return unwrapEnvelope<TResponse>(response.data, url)
  }

  async patchForm<TResponse = unknown>(
    url: string,
    data: FormData,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<ApiResponse<TResponse>> =
      await this.axiosInstance.post(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PATCH',
        },
      })
    return unwrapEnvelope<TResponse>(response.data, url)
  }

  async delete<TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<unknown> =
      await this.axiosInstance.delete(url, config)
    return unwrapEnvelope<TResponse>(response.data, url)
  }

  /**
   * Exchange the HttpOnly refresh cookie for a fresh access cookie.
   * Concurrent 401s share one request instead of stampeding the endpoint.
   */
  async refreshSession(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshClient
        .post('/refresh')
        .then(() => true)
        .catch(() => false)
        .finally(() => {
          this.refreshPromise = null
        })
    }

    return this.refreshPromise
  }
}

const api = new ApiClient()

export { api }
