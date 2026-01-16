// client/src/services/post.service.ts
import api from './api'
import type { Post, PostQueryParams, ApiResponse } from '@/types/post'

const postService = {
  // 获取帖子列表
  async getPosts(params: PostQueryParams): Promise<ApiResponse> {
    const response = await api.get('/posts', { params })
    return response
  },

  // 获取单个帖子
  async getPostById(id: string, incrementView = false): Promise<ApiResponse> {
    const response = await api.get(`/posts/${id}`, { params: { view: incrementView } })
    return response
  },

  // 创建帖子
  async createPost(data: { title: string; content: string; tags: string[]; images?: string[] }): Promise<ApiResponse> {
    const response = await api.post('/posts', data)
    return response
  },

  // 更新帖子
  async updatePost(id: string, data: { title?: string; content?: string; tags?: string[]; images?: string[] }): Promise<ApiResponse> {
    const response = await api.put(`/posts/${id}`, data)
    return response
  },

  // 删除帖子
  async deletePost(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/posts/${id}`)
    return response
  },

  // 点赞帖子 - 简化处理
async likePost(postId: string): Promise<any> {
  try {
    console.log(`📤 点赞请求: ${postId}`)
    const response = await api.post(`/posts/${postId}/like`)
    
    console.log('📥 API响应:', response)
    
    // ✅ 直接返回API响应，不处理success字段
    return response
  } catch (error: any) {
    console.error('❌ 点赞失败:', error)
    throw error
  }
},

  // 检查帖子点赞状态
  async checkPostLike(postId: string): Promise<ApiResponse> {
    const response = await api.get(`/posts/${postId}/like/check`)
    return response
  },

  // 获取热门标签
  async getPopularTags(limit = 10): Promise<ApiResponse> {
    const response = await api.get('/posts/tags/popular', { params: { limit } })
    return response
  },
}

export default postService