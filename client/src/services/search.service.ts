// client/src/services/search.service.ts
import api from './api'

export interface SearchResult {
  id: string
  type: 'post' | 'news' | 'user'
  title: string
  content?: string
  author?: {
    id: string
    username: string
    avatar: string
  }
  createdAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  // 用户特定字段
  username?: string
  // 帖子/资讯特定字段
  images?: string[]
  tags?: string[]
  isPinned?: boolean
  isFeatured?: boolean
}

export interface SearchResponse {
  posts: SearchResult[]
  news: SearchResult[]
  users: SearchResult[]
  total: number
}

export interface SearchParams {
  keyword: string
  page?: number
  limit?: number
  type?: 'all' | 'post' | 'news' | 'user'
}

class SearchService {
  // 搜索功能
  async search(params: SearchParams): Promise<SearchResponse> {
    try {
      const response = await api.get('/search', { params })
      return response.data
    } catch (error) {
      console.error('搜索失败:', error)
      throw error
    }
  }

  // 快速搜索（只返回少量结果）
  async quickSearch(keyword: string): Promise<SearchResponse> {
    return this.search({
      keyword,
      limit: 5,
      type: 'all'
    })
  }
}

export default new SearchService()