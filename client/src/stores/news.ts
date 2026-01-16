// client/src/stores/news.ts
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import newsService from '@/services/news.service'

export const useNewsStore = defineStore('news', () => {
  // 状态
  const news = ref<any[]>([])  // 使用 any[] 避免类型错误
  const currentNews = ref<any>(null)
  const featuredNews = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // 获取新闻列表
 // client/src/stores/news.ts
// 只需要修改 fetchNews 方法，其他不变
const fetchNews = async (params = {}) => {
  console.log('🔍 store: 开始获取新闻列表，参数:', params)
  isLoading.value = true
  error.value = null

  try {
    const response = await newsService.getNews(params)
    console.log('📰 store: newsService.getNews 返回:', response)
    
    if (response?.success) {
      console.log('✅ store: 接口调用成功，数据:', response.data)
      
      // 现在 response.data 就是数组
      news.value = Array.isArray(response.data) ? response.data : []
      
      // 处理分页
      if (response.pagination) {
        console.log('📄 store: 设置分页信息:', response.pagination)
        Object.assign(pagination, response.pagination)
      }
      
      console.log(`✅ store: 获取新闻列表成功，共 ${news.value.length} 条`)
      console.log('📄 store: 新闻数据前2条:', news.value.slice(0, 2))
    } else {
      console.error('❌ store: 接口调用失败:', response?.error)
      error.value = response?.error || '获取新闻列表失败'
    }
  } catch (err: any) {
    console.error('❌ store: 获取新闻列表异常:', err)
    console.error('❌ store: 异常详情:', err.message)
    error.value = err.message || '获取新闻列表失败'
  } finally {
    isLoading.value = false
    console.log('🔍 store: fetchNews 完成，isLoading:', isLoading.value)
  }
}

  // 获取热门新闻
  const fetchFeaturedNews = async (limit = 5) => {
    try {
      console.log('🔥 store: 开始获取热门新闻，limit:', limit)
      const response = await newsService.getFeaturedNews(limit)
      console.log('🌟 store: 热门新闻响应:', response)
      
      if (response?.success && response.data) {
        console.log('✅ store: 热门新闻接口成功')
        
        if (Array.isArray(response.data)) {
          featuredNews.value = response.data
        } else if (response.data && typeof response.data === 'object') {
          // 尝试在对象中查找数组
          const keys = Object.keys(response.data)
          for (const key of keys) {
            if (Array.isArray(response.data[key])) {
              featuredNews.value = response.data[key]
              break
            }
          }
        }
        
        console.log(`✅ store: 获取热门新闻成功，共 ${featuredNews.value.length} 条`)
        return { success: true, data: featuredNews.value }
      } else {
        const errorMsg = response?.error || '获取热门新闻失败'
        console.error('❌ store: 获取热门新闻失败:', errorMsg)
        return { success: false, error: errorMsg }
      }
    } catch (err: any) {
      const errorMsg = err.message || '获取热门新闻失败'
      console.error('❌ store: 获取热门新闻异常:', err)
      return { success: false, error: errorMsg }
    }
  }

  // 其他方法保持不变...
  const fetchNewsById = async (id: string, incrementView = false) => {
    console.log('📄 store: 开始获取新闻详情:', id)
    isLoading.value = true
    error.value = null

    try {
      const response = await newsService.getNewsById(id, incrementView)
      console.log('📄 store: 新闻详情响应:', response)
      
      if (response?.success && response.data) {
        currentNews.value = response.data
        console.log('✅ store: 获取新闻详情成功:', currentNews.value?.title)
      } else {
        error.value = response?.error || '获取新闻失败'
        console.error('❌ store: 获取新闻详情失败:', response?.error)
      }
    } catch (err: any) {
      error.value = err.message || '获取新闻失败'
      console.error('❌ store: 获取新闻详情异常:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createNews = async (data: any) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await newsService.createNews(data)
      if (response?.success && response.data) {
        news.value.unshift(response.data)
        return { success: true, data: response.data }
      } else {
        error.value = response?.error || '创建新闻失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || '创建新闻失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateNews = async (id: string, data: any) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await newsService.updateNews(id, data)
      if (response?.success && response.data) {
        if (currentNews.value && currentNews.value.id === id) {
          currentNews.value = { ...currentNews.value, ...data }
        }
        const index = news.value.findIndex(item => item.id === id)
        if (index !== -1) {
          news.value[index] = { ...news.value[index], ...data }
        }
        return { success: true, data: response.data }
      } else {
        error.value = response?.error || '更新新闻失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || '更新新闻失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const deleteNews = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await newsService.deleteNews(id)
      if (response?.success) {
        news.value = news.value.filter(newsItem => newsItem.id !== id)
        if (currentNews.value && currentNews.value.id === id) {
          currentNews.value = null
        }
        return { success: true }
      } else {
        error.value = response?.error || '删除新闻失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.message || '删除新闻失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchNewsStats = async () => {
    try {
      const response = await newsService.getNewsStats()
      if (response?.success && response.data) {
        return { success: true, stats: response.data }
      } else {
        return { success: false, error: response?.error || '获取新闻统计失败' }
      }
    } catch (err: any) {
      return { success: false, error: err.message || '获取新闻统计失败' }
    }
  }

  const clearState = () => {
    news.value = []
    currentNews.value = null
    featuredNews.value = []
    error.value = null
    Object.assign(pagination, {
      page: 1,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false,
    })
  }

  return {
    news,
    currentNews,
    featuredNews,
    isLoading,
    error,
    pagination,
    fetchNews,
    fetchNewsById,
    createNews,
    updateNews,
    deleteNews,
    fetchFeaturedNews,
    fetchNewsStats,
    clearState,
  }
})