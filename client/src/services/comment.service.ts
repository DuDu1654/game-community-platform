// client/src/services/comment.service.ts
import api from './api'
import type { Comment, ApiResponse } from '@/types/post'

const commentService = {
  // 创建评论
  async createComment(postId: string, data: { 
    content: string; 
    parentId?: string; 
    images?: string[] 
  }): Promise<ApiResponse> {
    try {
      const response = await api.post(`/posts/${postId}/comments`, data)
      return response
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || '创建评论失败',
        data: null
      }
    }
  },

/**
   * 新增：获取用户的评论列表
   */
  async getUserComments(userId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse> {
  try {
    console.log(`🔍 调用 getUserComments: userId=${userId}`, params)
    
    const response = await api.get(`/users/${userId}/comments`, { params })
    
    console.log('✅ API 响应完整结构:', response)
    console.log('✅ response.data:', response.data)
    
    // ✅ 修复：直接返回 response.data，因为后端返回的就是 { comments: [], pagination: {} }
    return { 
      success: true, 
      data: response.data,  // ✅ 这里应该返回完整的 response.data
      message: '获取评论成功'
    }
  } catch (error: any) {
    console.error('❌ 获取用户评论失败:', error)
    console.error('请求URL:', error.config?.url)
    console.error('状态码:', error.response?.status)
    console.error('错误信息:', error.response?.data)
    
    return { 
      success: false, 
      error: error.response?.data?.error || 
             error.response?.data?.message || 
             error.message || 
             '获取用户评论失败',
      data: null
    }
  }
},

    /**
   * 新增：获取单个评论详情
   */
  async getComment(commentId: string): Promise<ApiResponse> {
    try {
      const response = await api.get(`/comments/${commentId}`)
      return response
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || '获取评论详情失败',
        data: null
      }
    }
  },

  // 更新评论
  async updateComment(commentId: string, data: { content: string; images?: string[] }): Promise<ApiResponse> {
    const response = await api.put(`/comments/${commentId}`, data)
    return response
  },

  // 删除评论
  async deleteComment(commentId: string): Promise<ApiResponse> {
    const response = await api.delete(`/comments/${commentId}`)
    return response
  },

  // 点赞评论
  async likeComment(commentId: string): Promise<ApiResponse> {
    const response = await api.post(`/comments/${commentId}/like`)
    return response
  },

  // 检查评论点赞状态
  async checkCommentLike(commentId: string): Promise<ApiResponse> {
    const response = await api.get(`/comments/${commentId}/like/check`)
    return response
  },


  
}

export default commentService