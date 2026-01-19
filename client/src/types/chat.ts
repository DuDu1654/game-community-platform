// client/src/types/chat.ts
import type { User } from './user'

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string | null
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }

  // ✅ 添加这些字段
  room?: any
  rooms?: any[]
 
}

export interface ChatMessage {
  id: string
  content: string
  roomId: string
  author: User
  images: string[]
  createdAt: string
  updatedAt?: string
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  members: string[]
  createdAt: string
  updatedAt?: string
  unreadCount?: number
  lastMessage?: ChatMessage
}

// 聊天室列表响应
export interface ChatListResponse {
  rooms: ChatRoom[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// 消息列表响应
export interface MessagesResponse {
  messages: ChatMessage[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}