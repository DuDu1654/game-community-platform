// client/src/services/news.service.ts
import api from './api'

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
  async getNews(params: {
    page?: number
    limit?: number
    featured?: boolean
    tag?: string
    search?: string
  } = {}): Promise<ApiResponse> {
    try {
      console.log('📡 获取新闻列表，参数:', params)
      const response = await api.get('/news', { params })
      
      console.log('✅ 新闻接口响应:', response)
      
      // 检查响应格式
      if (!response.data) {
        console.error('❌ API 响应 data 为空')
        return {
          success: false,
          error: 'API 响应为空',
          data: []
        }
      }
      
      const { success, data, error, message, pagination } = response.data
      
      console.log('📊 解析后的数据:', {
        success,
        error,
        message,
        'data 类型': typeof data,
        'data': data,
        'pagination': pagination
      })
      
      if (!success) {
        console.error('❌ 接口返回失败:', error || message)
        return {
          success: false,
          error: error || message || '获取新闻列表失败',
          data: []
        }
      }
      
      // 现在 data 应该是一个对象，包含 news 数组
      if (!data || typeof data !== 'object') {
        console.error('❌ 数据格式错误，data 不是对象:', data)
        return {
          success: false,
          error: '数据格式错误',
          data: []
        }
      }
      
      // 提取 news 数组
      const newsData = data.news || []
      console.log(`✅ 获取新闻成功，共 ${newsData.length} 条新闻`)
      console.log('📄 新闻数据前2条:', newsData.slice(0, 2))
      
      return {
        success: true,
        data: newsData,  // 直接返回数组
        error,
        message,
        pagination
      }
      
    } catch (error: any) {
      console.error('❌ 获取新闻列表失败:', error)
      console.error('错误详情:', error.response?.data)
      console.error('错误状态码:', error.response?.status)
      
      return {
        success: false,
        error: error.response?.data?.error || 
               error.response?.data?.message || 
               error.message || 
               '获取新闻列表失败',
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