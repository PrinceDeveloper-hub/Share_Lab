import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ApiResponse<T> {
  data: T
  message: string
  errors?: Record<string, string[]>
  meta?: {
    page?: number
    per_page?: number
    total?: number
    last_page?: number
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

export interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

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

const defaultBaseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export class ApiClient {
  private axiosInstance: AxiosInstance

  constructor(baseURL = defaultBaseURL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
      timeout: 20_000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.axiosInstance.get(url, config)
    return response.data
  }

  async post<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<ApiResponse<TResponse>> = await this.axiosInstance.post(
      url,
      data,
      config,
    )
    return response.data
  }

  async patch<TBody = unknown, TResponse = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<ApiResponse<TResponse>> = await this.axiosInstance.patch(
      url,
      data,
      config,
    )
    return response.data
  }

  async delete<TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response: AxiosResponse<ApiResponse<TResponse>> = await this.axiosInstance.delete(
      url,
      config,
    )
    return response.data
  }
}

const api = new ApiClient()

export { api }
