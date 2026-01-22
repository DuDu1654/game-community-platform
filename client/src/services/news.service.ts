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

  

  // client/src/services/news.service.ts
async getNewsById(id: string, incrementView = false) {
  console.log('📡 [service] 获取新闻详情，ID:', id, 'incrementView:', incrementView)
  try {
    const response = await api.get(`/news/${id}`, {
      params: { view: incrementView }
    })
    
    console.log('📄 [service] API原始响应:', {
      data: response.data,
      success: response.data?.success
    })
    
    // 🔥 关键修复：API返回的是 {success: true, data: {...}} 格式
    if (response.data && typeof response.data === 'object') {
      // 如果API返回了 {success: true, data: {...}}
      if (response.data.success === true) {
        console.log('✅ [service] API返回格式正确')
        return {
          success: true,
          data: response.data.data,  // 🔥 返回 data 字段
          error: null
        }
      }
      // 如果API直接返回新闻对象
      else if (response.data.id) {
        console.log('✅ [service] API直接返回新闻对象')
        return {
          success: true,
          data: response.data,  // 🔥 直接返回整个对象
          error: null
        }
      }
    }
    
    console.error('❌ [service] API返回格式异常:', response.data)
    return {
      success: false,
      data: null,
      error: 'API返回格式异常'
    }
    
  } catch (error: any) {
    console.error('❌ [service] 获取新闻详情失败:', error)
    
    return {
      success: false,
      data: null,
      error: error.response?.data?.error || error.message || '获取新闻详情失败'
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
  
  // 获取相关新闻
  async getRelatedNews(newsId: string, limit = 2) {
  console.log('📡 尝试获取相关新闻，当前新闻ID:', newsId)
  
  try {
    // 先获取所有新闻
    const allNewsResponse = await this.getNews({ limit: 20 })
    console.log('📄 获取到的所有新闻数量:', allNewsResponse.data?.length || 0)
    
    if (allNewsResponse.success && allNewsResponse.data) {
      // 过滤掉当前新闻
      const otherNews = allNewsResponse.data.filter((news: any) => news.id !== newsId)
      
      if (otherNews.length === 0) {
        console.log('📭 没有找到其他相关新闻')
        return {
          success: true,
          data: []
        }
      }
      
      // 智能推荐逻辑
      const relatedNews = this.getIntelligentRelatedNews(otherNews, newsId, limit)
      
      console.log('✅ 生成相关新闻成功:', relatedNews.length, '条')
      return {
        success: true,
        data: relatedNews
      }
    }
    
    return {
      success: false,
      error: '获取新闻列表失败',
      data: []
    }
    
  } catch (error: any) {
    console.error('❌ 获取相关新闻失败:', error)
    return {
      success: true,  // 🔥 注意：这里返回 success: true，避免触发错误处理
      data: [],
      error: '相关新闻服务暂时不可用'
    }
  }
}



// 在 NewsService 类中添加这个方法
private getIntelligentRelatedNews(
  newsList: any[], 
  currentNewsId: string, 
  limit: number
) {
  console.log('🤖 智能推荐相关新闻')
  
  // 1. 从store获取当前新闻详情
  const currentNews = newsList.find(news => news.id === currentNewsId)
  
  if (!currentNews) {
    console.log('⚠️ 未找到当前新闻，返回随机新闻')
    return this.getRandomNews(newsList, limit)
  }
  
  // 2. 按相关度排序
  const scoredNews = newsList
    .filter(news => news.id !== currentNewsId)
    .map(news => {
      let score = 0
      
      // 标签匹配（最高权重）
      if (currentNews.tags && news.tags) {
        const currentTags = currentNews.tags
        const otherTags = Array.isArray(news.tags) ? news.tags : []
        const commonTags = currentTags.filter((tag: string) => 
          otherTags.includes(tag)
        ).length
        score += commonTags * 10
      }
      
      // 标题关键词匹配
      if (currentNews.title && news.title) {
        const currentWords = currentNews.title.split(/[,\s]+/)
        const otherWords = news.title.split(/[,\s]+/)
        const commonWords = currentWords.filter((word: string) =>
          otherWords.includes(word) && word.length > 1
        ).length
        score += commonWords * 5
      }
      
      // 发布时间相近（较新新闻优先）
      if (currentNews.createdAt && news.createdAt) {
        const currentTime = new Date(currentNews.createdAt).getTime()
        const otherTime = new Date(news.createdAt).getTime()
        const timeDiff = Math.abs(currentTime - otherTime)
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
        
        // 3天内 +5分，7天内 +3分，30天内 +1分
        if (daysDiff <= 3) score += 5
        else if (daysDiff <= 7) score += 3
        else if (daysDiff <= 30) score += 1
      }
      
      // 热门新闻加分
      if (news.isFeatured) score += 3
      if (news.viewCount && news.viewCount > 1000) score += 2
      
      return { ...news, score }
    })
    .sort((a, b) => b.score - a.score)  // 按得分降序排列
    .slice(0, limit)  // 取前 limit 条
    .map(({ score, ...news }) => news)  // 移除分数字段
  
  console.log('📊 智能推荐结果:', scoredNews.map(n => ({
    id: n.id,
    title: n.title,
    score: scoredNews.find(sn => sn.id === n.id)?.score
  })))
  
  return scoredNews.length > 0 
    ? scoredNews 
    : this.getRandomNews(newsList, limit)  // 如果没有匹配的，返回随机
}

// 随机获取新闻
private getRandomNews(newsList: any[], limit: number) {
  const shuffled = [...newsList].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, limit)
}
}

export default new NewsService()
