// client/src/services/comment.service.ts
import api from './api'
import type { Comment, ApiResponse } from '@/types/post'

const commentService = {
  // 创建评论
  async createComment(postId: string, data: { content: string; parentId?: string; images?: string[] }): Promise<ApiResponse> {
    const response = await api.post(`/posts/${postId}/comments`, data)
    return response
  },

  // 获取评论回复
  async getCommentReplies(commentId: string, page = 1, limit = 20): Promise<ApiResponse> {
    const response = await api.get(`/comments/${commentId}/replies`, { params: { page, limit } })
    return response
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