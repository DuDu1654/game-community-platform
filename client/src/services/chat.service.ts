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
  // client/src/services/chat.service.ts
// 修改 getRoomMessages 方法
// 获取聊天室消息
 // client/src/services/chat.service.ts
async getRoomMessages(roomId: string, page = 1, limit = 50): Promise<ApiResponse> {
  try {
    console.log(`📥 获取房间消息: ${roomId}, page=${page}, limit=${limit}`)
    
    const response = await api.get(`/chat/rooms/${roomId}/messages`, { 
      params: { page, limit } 
    })
    
    console.log('📤 消息API响应:', {
      数据长度: Array.isArray(response.data) ? response.data.length : '非数组',
      数据类型: typeof response.data,
      数据: response.data
    })
    
    // ✅ 后端现在直接返回数组
    if (Array.isArray(response.data)) {
      return {
        success: true,
        data: {
          messages: response.data, // 直接使用返回的数组
          page,
          limit,
          total: response.data.length,
          pages: 1,
          hasMore: false
        }
      }
    }
    
    // 如果还是对象格式，尝试提取 messages
    if (response.data && response.data.messages) {
      return {
        success: true,
        data: {
          messages: response.data.messages,
          page: response.data.page || page,
          limit: response.data.limit || limit,
          total: response.data.total || response.data.messages.length,
          pages: response.data.pages || 1,
          hasMore: response.data.hasMore || false
        }
      }
    }
    
    // 如果是其他格式
    console.warn('⚠️ 未知响应格式:', response.data)
    return {
      success: false,
      error: '未知的响应格式',
      data: {
        messages: [],
        page,
        limit,
        total: 0,
        pages: 0,
        hasMore: false
      }
    }
    
  } catch (error: any) {
    console.error('❌ 获取消息失败:', error)
    return {
      success: false,
      error: error.response?.data?.error || error.message || '获取消息失败',
      data: {
        messages: [],
        page,
        limit,
        total: 0,
        pages: 0,
        hasMore: false
      }
    }
  }
},


  // 发送消息 - 修复这里
 // client/src/services/chat.service.ts
// 修改 sendMessage 方法
async sendMessage(roomId: string, data: { content: string; images?: string[] }): Promise<ApiResponse> {
  try {
    console.log('🚀 发送消息到API:', { roomId, data })
    
    // 确保 data 是正确的格式
    const payload = {
      content: data.content || '',
      images: data.images || []  // 确保数组
    }
    
    console.log('📤 发送的负载:', payload)
    
    const response = await api.post(`/chat/rooms/${roomId}/messages`, payload)
    
    console.log('✅ API响应:', response.data)
    
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    console.error('❌ 发送消息失败:', {
      error: error.response?.data || error.message,
      status: error.response?.status,
      roomId,
      data
    })
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    }
  }
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