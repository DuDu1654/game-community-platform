// stores/comment.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useCommentStore = defineStore('comment', () => {
  // 点赞评论
  const likeComment = async (commentId: string) => {
    try {
      console.log('💬 开始点赞评论:', commentId)
      
      const response = await api.post(`/comments/${commentId}/like`)
      
      console.log('💬 API响应:', response.data)
      
      if (response.data.success) {
        return {
          success: true,
          liked: response.data.liked,
          likeCount: response.data.likeCount || 0
        }
      } else {
        return {
          success: false,
          error: response.data.error || '点赞失败',
          liked: false
        }
      }
    } catch (err: any) {
      console.error('💬 点赞评论失败:', err)
      return {
        success: false,
        error: err.response?.data?.error || '点赞失败',
        liked: false
      }
    }
  }
  
  return { likeComment }
})