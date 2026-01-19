// src/services/like.service.ts
import api from './api'

// 点赞相关的接口类型定义
interface LikeResponse {
  success: boolean
  data?: any
  error?: string
}

interface LikeRequest {
  targetId: string
  targetType: 'post' | 'comment' | 'reply'
  userId?: string
}

interface UserLikesParams {
  page?: number
  limit?: number
  targetType?: 'all' | 'post' | 'comment'
}

export default {
  /**
   * 获取用户的点赞列表
   * @param userId 用户ID
   * @param params 查询参数
   */
  async getUserLikes(userId: string, params?: UserLikesParams): Promise<LikeResponse> {
    try {
      const response = await api.get(`/likes/user/${userId}`, { params })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error: any) {
      console.error('获取用户点赞失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '获取点赞记录失败' 
      }
    }
  },

  /**
   * 获取帖子的点赞列表
   * @param postId 帖子ID
   * @param params 查询参数
   */
  async getPostLikes(postId: string, params?: { page?: number; limit?: number }): Promise<LikeResponse> {
    try {
      const response = await api.get(`/likes/post/${postId}`, { params })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error: any) {
      console.error('获取帖子点赞失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '获取帖子点赞失败' 
      }
    }
  },

  /**
   * 添加点赞
   * @param targetId 目标ID（帖子/评论）
   * @param targetType 目标类型
   */
  async addLike(targetId: string, targetType: 'post' | 'comment' | 'reply'): Promise<LikeResponse> {
    try {
      const response = await api.post('/likes', {
        targetId,
        targetType
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error: any) {
      console.error('添加点赞失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '点赞失败' 
      }
    }
  },

  /**
   * 取消点赞
   * @param likeId 点赞记录ID
   */
  async removeLike(likeId: string): Promise<LikeResponse> {
    try {
      const response = await api.delete(`/likes/${likeId}`)
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error: any) {
      console.error('取消点赞失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '取消点赞失败' 
      }
    }
  },

  /**
   * 切换点赞状态（点赞/取消点赞）
   * @param targetId 目标ID
   * @param targetType 目标类型
   */
  async toggleLike(targetId: string, targetType: 'post' | 'comment' | 'reply'): Promise<LikeResponse> {
    try {
      const response = await api.post('/likes/toggle', {
        targetId,
        targetType
      })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error: any) {
      console.error('切换点赞状态失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '操作失败' 
      }
    }
  },

  /**
   * 检查是否已点赞
   * @param targetId 目标ID
   * @param targetType 目标类型
   * @param userId 用户ID（可选，默认当前用户）
   */
  async checkLike(targetId: string, targetType: 'post' | 'comment' | 'reply', userId?: string): Promise<LikeResponse> {
    try {
      const params: any = { targetId, targetType }
      if (userId) params.userId = userId
      
      const response = await api.get('/likes/check', { params })
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error: any) {
      console.error('检查点赞状态失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '检查点赞状态失败' 
      }
    }
  },

  /**
   * 获取点赞统计
   * @param targetId 目标ID
   * @param targetType 目标类型
   */
  async getLikeStats(targetId: string, targetType: 'post' | 'comment' | 'reply'): Promise<LikeResponse> {
    try {
      const response = await api.get(`/likes/stats/${targetType}/${targetId}`)
      return { 
        success: true, 
        data: response.data 
      }
    } catch (error: any) {
      console.error('获取点赞统计失败:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || '获取点赞统计失败' 
      }
    }
  }
}