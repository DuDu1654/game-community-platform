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
// client/src/stores/news.ts
// 在fetchNews方法中添加tags处理
// client/src/stores/news.ts
// 修改fetchNews方法中的tags处理部分
const fetchNews = async (params = {}) => {
  console.log('🔍 store: 开始获取新闻列表，参数:', params)
  isLoading.value = true
  error.value = null

  try {
    const response = await newsService.getNews(params)
    console.log('📰 store: newsService.getNews 返回:', response)
    
    if (response?.success) {
      console.log('✅ store: 接口调用成功，数据:', response.data)
      
      // 🔥 修复：添加正确的类型注解
      const processedNews = Array.isArray(response.data) 
        ? response.data.map((item: any) => {
            // 处理tags字段
            let tagsArray: string[] = []
            
            if (item.tags) {
              try {
                if (typeof item.tags === 'string') {
                  // 尝试解析JSON字符串
                  const parsed = JSON.parse(item.tags)
                  
                  if (Array.isArray(parsed)) {
                    // 情况1: 直接是数组 ["标签1", "标签2"]
                    tagsArray = parsed.filter((tag: any) => 
                      tag && typeof tag === 'string' && tag.trim()
                    )
                  } else if (parsed && typeof parsed === 'object' && parsed.tags && Array.isArray(parsed.tags)) {
                    // 情况2: 对象包含tags字段 {tags: ["标签1", "标签2"]}
                    tagsArray = parsed.tags.filter((tag: any) => 
                      tag && typeof tag === 'string' && tag.trim()
                    )
                  } else if (typeof parsed === 'string') {
                    // 情况3: 是逗号分隔的字符串
                    tagsArray = parsed.split(',')
                      .map((tag: string) => tag.trim())
                      .filter((tag: string) => tag)
                  } else {
                    tagsArray = []
                  }
                } else if (Array.isArray(item.tags)) {
                  // 情况4: 已经是数组
                  tagsArray = item.tags.filter((tag: any) => 
                    tag && typeof tag === 'string' && tag.trim()
                  )
                }
              } catch (error) {
                console.warn('解析tags失败，尝试其他格式:', error)
                
                // 尝试逗号分隔
                if (typeof item.tags === 'string' && item.tags.includes(',')) {
                  tagsArray = item.tags.split(',')
                    .map((tag: string) => tag.trim())
                    .filter((tag: string) => tag)
                } else if (typeof item.tags === 'string') {
                  // 单个标签
                  const trimmedTag = item.tags.trim()
                  if (trimmedTag) {
                    tagsArray = [trimmedTag]
                  }
                }
              }
            }
            
            console.log('处理tags结果:', {
              id: item.id,
              originalTags: item.tags,
              processedTags: tagsArray
            })
            
            return {
              ...item,
              tags: tagsArray,  // 替换为处理后的数组
              viewCount: Number(item.viewCount) || 0
            }
          })
        : []
      
      news.value = processedNews
      
      // 处理分页
      if (response.pagination) {
        console.log('📄 store: 设置分页信息:', response.pagination)
        Object.assign(pagination, response.pagination)
      }
      
      console.log(`✅ store: 获取新闻列表成功，共 ${news.value.length} 条`)
      console.log('📄 store: 处理后新闻数据:', news.value.slice(0, 2))
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
  // client/src/stores/news.ts
// client/src/stores/news.ts
// 只修改 fetchNewsById 方法，其他保持原样
const fetchNewsById = async (id: string, incrementView = false) => {
  console.log('📄 [store] 开始获取新闻详情，ID:', id)
  isLoading.value = true
  error.value = null
  currentNews.value = null

  try {
    console.log('📡 [store] 调用 newsService.getNewsById')
    
    // 🔥 关键修复：使用 try-catch 捕获底层错误
    const response = await newsService.getNewsById(id, incrementView)
    console.log('📄 [store] newsService返回:', {
      success: response?.success,
      data: response?.data,
      error: response?.error
    })
    
    if (response?.success) {
      // 🔥 修复：直接使用 response.data
      let newsData = response.data
      
      console.log('🔍 [store] 处理前数据:', {
        type: typeof newsData,
        isArray: Array.isArray(newsData),
        data: newsData
      })
      
      // 处理可能的数组情况
      if (Array.isArray(newsData)) {
        console.warn('⚠️ [store] data是数组，取第一个')
        if (newsData.length > 0) {
          newsData = newsData[0]
        } else {
          throw new Error('新闻数据为空数组')
        }
      }
      
      if (!newsData) {
        throw new Error('新闻数据为空')
      }
      
      // 简化tags处理
      if (newsData.tags) {
        if (typeof newsData.tags === 'string') {
          try {
            const parsed = JSON.parse(newsData.tags)
            if (Array.isArray(parsed)) {
              newsData.tags = parsed
            } else if (parsed && parsed.tags && Array.isArray(parsed.tags)) {
              newsData.tags = parsed.tags
            } else {
              newsData.tags = []
            }
          } catch {
            // 修改后（修复错误）：
if (newsData.tags.includes(',')) {
  newsData.tags = newsData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
} else {
  newsData.tags = [newsData.tags.trim()]
}
          }
        } else if (!Array.isArray(newsData.tags)) {
          newsData.tags = []
        }
      } else {
        newsData.tags = []
      }
      
      // 确保数值字段
      newsData.viewCount = Number(newsData.viewCount) || 0
      
      console.log('✅ [store] 设置currentNews:', {
        id: newsData.id,
        title: newsData.title,
        tags: newsData.tags
      })
      
      currentNews.value = newsData
      error.value = null
      
    } else {
  // 🔥 修复：response对象没有message属性
  const errorMsg = response?.error || '获取新闻失败'  // 去掉 response?.message
  console.error('❌ [store] API返回失败:', errorMsg, response)
  throw new Error(errorMsg)
}
    
  } catch (err: any) {
    // 🔥 关键：捕获并记录所有错误
    console.error('❌ [store] 获取新闻详情异常:', err)
    
    // 记录完整的错误信息
    if (err.response) {
      console.error('❌ [store] 响应状态:', err.response.status)
      console.error('❌ [store] 响应数据:', err.response.data)
    }
    
    if (err.message) {
      console.error('❌ [store] 错误消息:', err.message)
    }
    
    if (err.stack) {
      console.error('❌ [store] 错误堆栈:', err.stack)
    }
    
    // 设置错误信息
    error.value = err.message || '获取新闻详情失败'
    currentNews.value = null
    
    // 🔥 自动重试机制
    console.log('🔄 [store] 尝试自动重试...')
    setTimeout(async () => {
      try {
        console.log('🔄 [store] 自动重试中...')
        const retryResponse = await fetch(`/api/news/${id}`)
        const retryData = await retryResponse.json()
        
        if (retryData.success && retryData.data) {
          console.log('✅ [store] 自动重试成功')
          let retryNews = retryData.data
          if (Array.isArray(retryNews)) {
            retryNews = retryNews[0]
          }
          currentNews.value = retryNews
          error.value = null
        }
      } catch (retryErr) {
        console.error('❌ [store] 自动重试失败:', retryErr)
      }
    }, 1000)
    
  } finally {
    isLoading.value = false
    console.log('🏁 [store] fetchNewsById 完成', {
      hasCurrentNews: !!currentNews.value,
      error: error.value
    })
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