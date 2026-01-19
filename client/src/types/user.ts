// client/src/types/user.ts
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  isActive?: boolean  // 添加这行
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
  message?: string
  error?: string
}

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}