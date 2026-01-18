console.log('🚀 news.service.ts 文件被加载了!')
console.log('📁 文件路径:', import.meta.url || 'unknown')

// client/src/services/news.service.ts
import api from './api'


// 🔥 添加 NewsItem 类型定义
export interface NewsItem {
  id: string
  title: string
  content?: string
  summary?: string
  coverImage?: string
  tags?: string[]
  isFeatured?: boolean
  viewCount?: number
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  author?: string
  category?: string
  // 其他你需要的字段...
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

class NewsService {
  // 获取新闻列表
  // client/src/services/news.service.ts
async getNews(params: any = {}): Promise<ApiResponse> {
    try {
      console.log('📡 调用新闻接口...')
      
      // 使用 any 类型绕过 TypeScript 检查
      const response: any = await api.get('/news', { params })
      console.log('✅ 接口返回:', response)
      
      // 情况1: 直接返回 {news: []}
      if (response && response.news && Array.isArray(response.news)) {
        console.log(`✅ 从 news 字段获取 ${response.news.length} 条数据`)
        return {
          success: true,
          data: response.news as NewsItem[],
          message: response.message || '获取成功',
          pagination: response.pagination
        }
      }
      
      // 情况2: 返回 {data: {news: []}}
      if (response && response.data && response.data.news && Array.isArray(response.data.news)) {
        console.log(`✅ 从 data.news 获取 ${response.data.news.length} 条数据`)
        return {
          success: true,
          data: response.data.news as NewsItem[],
          message: response.message || '获取成功',
          pagination: response.pagination
        }
      }
      
      // 情况3: 返回 {success: true, data: []}
      if (response && response.success === true && response.data && Array.isArray(response.data)) {
        console.log(`✅ 从 data 获取 ${response.data.length} 条数据`)
        return {
          success: true,
          data: response.data as NewsItem[],
          message: response.message || '获取成功',
          pagination: response.pagination
        }
      }
      
      // 情况4: 返回空数据
      console.log('📭 无数据或格式不符，返回空数组')
      return {
        success: true,
        data: [],
        message: '暂无数据',
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
      
    } catch (error: any) {
      console.error('❌ 获取新闻失败:', error)
      
      // 修复 error 类型
      const errorMessage: string = error?.response?.data?.message || 
                                   error?.response?.data?.error || 
                                   error?.message || 
                                   '获取新闻列表失败'
      
      return {
        success: false,
        error: errorMessage,
        data: []
      }
    }
  }

  

  // 获取新闻详情
  async getNewsById(id: string, incrementView = false): Promise<ApiResponse> {
    try {
      console.log('📡 获取新闻详情:', id)
      const response = await api.get(`/news/${id}`, {
        params: { view: incrementView }
      })
      
      console.log('✅ 新闻详情响应:', response.data)
      
      if (!response.data) {
        return {
          success: false,
          error: 'API 响应为空',
          data: null
        }
      }
      
      const { success, data, error, message } = response.data
      
      if (!success) {
        return {
          success: false,
          error: error || message || '获取新闻失败',
          data: null
        }
      }
      
      // 提取 news 对象
      const newsData = data?.news || data || null
      
      return {
        success: true,
        data: newsData
      }
    } catch (error: any) {
      console.error('❌ 获取新闻失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message || '获取新闻失败',
        data: null
      }
    }
  }

  // 获取热门新闻
  async getFeaturedNews(limit = 5): Promise<ApiResponse> {
    try {
      console.log('📡 调用热门新闻接口，limit:', limit)
      const response = await api.get('/news/featured/recent', { params: { limit } })
      console.log('✅ 热门新闻接口响应:', response.data)
      
      if (!response.data) {
        return {
          success: false,
          error: 'API 响应为空',
          data: []
        }
      }
      
      const { success, data, error, message } = response.data
      
      if (!success) {
        return {
          success: false,
          error: error || message || '获取热门新闻失败',
          data: []
        }
      }
      
      // 提取 news 数组
      const newsData = data?.news || data || []
      
      return {
        success: true,
        data: newsData
      }
    } catch (error: any) {
      console.error('❌ 获取热门新闻失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message || '获取热门新闻失败',
        data: []
      }
    }
  }

  // 获取新闻统计
  async getNewsStats(): Promise<ApiResponse> {
    try {
      const response = await api.get('/news/stats/all')
      
      if (!response.data) {
        return {
          success: false,
          error: 'API 响应为空',
          data: null
        }
      }
      
      const { success, data, error, message } = response.data
      
      if (!success) {
        return {
          success: false,
          error: error || message || '获取新闻统计失败',
          data: null
        }
      }
      
      return {
        success: true,
        data: data?.stats || data
      }
    } catch (error: any) {
      console.error('❌ 获取新闻统计失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message || '获取新闻统计失败',
        data: null
      }
    }
  }

  // 创建新闻
  async createNews(data: any): Promise<ApiResponse> {
    try {
      const response = await api.post('/news', data)
      
      if (!response.data) {
        return {
          success: false,
          error: 'API 响应为空'
        }
      }
      
      const { success, data: responseData, error, message } = response.data
      
      if (!success) {
        return {
          success: false,
          error: error || message || '创建新闻失败'
        }
      }
      
      return {
        success: true,
        data: responseData?.news || responseData,
        message
      }
    } catch (error: any) {
      console.error('❌ 创建新闻失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message || '创建新闻失败'
      }
    }
  }

  // 更新新闻
  async updateNews(id: string, data: any): Promise<ApiResponse> {
    try {
      const response = await api.put(`/news/${id}`, data)
      
      if (!response.data) {
        return {
          success: false,
          error: 'API 响应为空'
        }
      }
      
      const { success, data: responseData, error, message } = response.data
      
      if (!success) {
        return {
          success: false,
          error: error || message || '更新新闻失败'
        }
      }
      
      return {
        success: true,
        data: responseData?.news || responseData,
        message
      }
    } catch (error: any) {
      console.error('❌ 更新新闻失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message || '更新新闻失败'
      }
    }
  }

  // 删除新闻
  async deleteNews(id: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(`/news/${id}`)
      
      if (!response.data) {
        return {
          success: false,
          error: 'API 响应为空'
        }
      }
      
      const { success, error, message } = response.data
      
      if (!success) {
        return {
          success: false,
          error: error || message || '删除新闻失败'
        }
      }
      
      return {
        success: true,
        message
      }
    } catch (error: any) {
      console.error('❌ 删除新闻失败:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message || '删除新闻失败'
      }
    }
  }
}

export default new NewsService()
