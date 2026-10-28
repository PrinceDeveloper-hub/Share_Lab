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

export interface AuthResponse {
  user: User
  token: string
}

export class ApiClient {
  private axiosInstance: AxiosInstance | null = null

  private get instance(): AxiosInstance {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    return this.axiosInstance
  }

  constructor(baseURL?: string, token?: string) {
    if (baseURL) {
      this.axiosInstance = axios.create({
        baseURL,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
    }
  }

  setAuthToken(token: string) {
    const instance = this.instance
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  removeAuthToken() {
    const instance = this.instance
    delete instance.defaults.headers.common['Authorization']
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.instance.get(url, config)
    return response.data
  }

  async post<T, R = any>(url: string, data?: T, config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    const response: AxiosResponse<ApiResponse<R>> = await this.instance.post(url, data, config)
    return response.data
  }

  async patch<T, R = any>(url: string, data?: T, config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    const response: AxiosResponse<ApiResponse<R>> = await this.instance.patch(url, data, config)
    return response.data
  }

  async delete<R = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<R>> {
    const response: AxiosResponse<ApiResponse<R>> = await this.instance.delete(url, config)
    return response.data
  }

  // Unwraps the API envelope and handles auth errors
  protected async request<T>(fn: Promise<T>): Promise<T> {
    try {
      return await fn
    } catch (error: any) {
      if (error?.response?.status === 401) {
        this.removeAuthToken()
        // Trigger logout - would dispatch in real implementation
        console.log('Session expired, logging out...')
      }
      throw error
    }
  }
}

const apiInstance = new ApiClient()

export const api = {
  ...apiInstance,
  setAuthToken: (token: string) => apiInstance.setAuthToken(token),
  removeAuthToken: () => apiInstance.removeAuthToken(),
}

export { apiInstance }