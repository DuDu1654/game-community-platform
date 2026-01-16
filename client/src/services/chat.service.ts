// client/src/services/chat.service.ts
import api from './api'
import type { ApiResponse } from '@/types/chat'

const chatService = {
  // 获取聊天室列表
  async getChatRooms(page = 1, limit = 20): Promise<ApiResponse> {
    const response = await api.get('/chat/rooms', { params: { page, limit } })
    return response
  },

  // 获取聊天室详情
  async getChatRoom(roomId: string): Promise<ApiResponse> {
    const response = await api.get(`/chat/rooms/${roomId}`)
    return response
  },

  // 获取聊天室消息
  async getRoomMessages(roomId: string, page = 1, limit = 50): Promise<ApiResponse> {
    const response = await api.get(`/chat/rooms/${roomId}/messages`, { params: { page, limit } })
    return response
  },

  // 发送消息
  async sendMessage(roomId: string, data: { content: string; images?: string[] }): Promise<ApiResponse> {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, data)
    return response
  },

  // 创建聊天室
  async createChatRoom(data: { name: string; description?: string }): Promise<ApiResponse> {
    const response = await api.post('/chat/rooms', data)
    return response
  },

  // 获取未读消息数
  async getUnreadCount(roomId: string, lastReadAt?: string): Promise<ApiResponse> {
    const response = await api.get('/chat/unread/count', { params: { roomId, lastReadAt } })
    return response
  },
}

export default chatService