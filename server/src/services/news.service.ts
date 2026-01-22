// server/src/services/news.service.ts
import { PrismaClient, News, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateNewsInput {
  title: string
  content: string
  summary?: string
  coverImage?: string
  source?: string
  tags?: string  // 改为 string，不是 string[]
  isFeatured?: boolean
}

export interface UpdateNewsInput {
  title?: string
  content?: string
  summary?: string
  coverImage?: string
  source?: string
  tags?: string  // 改为 string
  isFeatured?: boolean
}

export interface NewsQueryParams {
  page?: number
  limit?: number
  featured?: boolean
  tag?: string
  search?: string
}

class NewsService {
  // 创建新闻
  async createNews(data: CreateNewsInput): Promise<News> {
    return await prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        summary: data.summary || null,
        coverImage: data.coverImage || null,
        source: data.source || null,
        tags: data.tags || null,  // 直接赋值字符串
        isFeatured: data.isFeatured || false,
      },
    })
  }

  // server/src/services/news.service.ts
// 修改getNewsList方法中的查询结果处理
// server/src/services/news.service.ts
// 修改getNewsList方法
async getNewsList(params: NewsQueryParams) {
  const page = params.page || 1
  const limit = params.limit || 10
  const skip = (page - 1) * limit

  // 构建查询条件
  const where: Prisma.NewsWhereInput = {}
  
  if (params.featured) {
    where.isFeatured = true
  }
  
  if (params.tag) {
    where.tags = {
      contains: params.tag as string,
    }
  }
  
  if (params.search) {
    where.OR = [
      { title: { contains: params.search as string } },
      { content: { contains: params.search as string } },
      { summary: { contains: params.search as string } },
    ]
  }

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.news.count({ where }),
  ])

  // 🔥 修复类型错误
  const processedNews = news.map((item: any) => {
    let tagsArray: string[] = []
    
    if (item.tags) {
      try {
        if (typeof item.tags === 'string') {
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
        console.warn('后端解析tags失败，ID:', item.id, error)
        
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
    
    return {
      ...item,
      tags: tagsArray,  // 替换为处理后的数组
      viewCount: Number(item.viewCount) || 0
    }
  })

  return {
    news: processedNews,  // 返回处理后的数据
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  }
}

  // server/src/services/news.service.ts
async getNewsById(id: string, incrementView = false) {
  try {
    console.log('🔍 news.service: 获取新闻详情，ID:', id)
    
    const news = await prisma.news.findUnique({
      where: { id }
    })
    
    if (!news) {
      console.log('❌ news.service: 新闻不存在，ID:', id)
      return null
    }
    
    // 🔥 修复：处理 tags 字段
    let tagsArray = []
    try {
      if (news.tags) {
        if (typeof news.tags === 'string') {
          // 如果是字符串，尝试解析JSON
          const parsed = JSON.parse(news.tags)
          // 如果解析后是对象且有 tags 数组
          if (parsed && typeof parsed === 'object') {
            tagsArray = Array.isArray(parsed.tags) ? parsed.tags : 
                       Array.isArray(parsed) ? parsed : []
          } else if (Array.isArray(parsed)) {
            tagsArray = parsed
          } else if (typeof parsed === 'string') {
            // 如果是逗号分隔的字符串
            tagsArray = parsed.split(',').map(tag => tag.trim()).filter(tag => tag)
          }
        } else if (Array.isArray(news.tags)) {
          tagsArray = news.tags
        }
      }
    } catch (parseError) {
      console.error('❌ 解析tags失败:', parseError)
      tagsArray = []
    }
    
    // 增加浏览量
    if (incrementView) {
      console.log('📈 news.service: 增加新闻浏览量，ID:', id)
      await prisma.news.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      })
    }
    
    const result = {
      ...news,
      tags: tagsArray  // 使用处理后的数组
    }
    
    console.log('✅ news.service: 返回新闻数据:', {
      id: result.id,
      title: result.title,
      tags: result.tags,
      tagsType: typeof result.tags
    })
    
    return result
  } catch (error) {
    console.error('❌ news.service: 获取新闻详情错误:', error)
    throw error
  }
}

  // 更新新闻
  async updateNews(id: string, data: UpdateNewsInput) {
    // 手动构建更新数据
    const updateData: any = {
      updatedAt: new Date(),
    }
    
    if (data.title !== undefined) {
      updateData.title = data.title
    }
    
    if (data.content !== undefined) {
      updateData.content = data.content
    }
    
    if (data.summary !== undefined) {
      updateData.summary = data.summary
    }
    
    if (data.coverImage !== undefined) {
      updateData.coverImage = data.coverImage
    }
    
    if (data.source !== undefined) {
      updateData.source = data.source
    }
    
    if (data.tags !== undefined) {
      updateData.tags = data.tags
    }
    
    if (data.isFeatured !== undefined) {
      updateData.isFeatured = data.isFeatured
    }

    return await prisma.news.update({
      where: { id },
      data: updateData,
    })
  }

  // 删除新闻
  async deleteNews(id: string) {
    return await prisma.news.delete({
      where: { id },
    })
  }

  // 获取热门新闻
  async getFeaturedNews(limit: number = 5) {
    return await prisma.news.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  // 获取新闻统计
  async getNewsStats() {
    const [totalNews, totalViews, featuredCount] = await Promise.all([
      prisma.news.count(),
      prisma.news.aggregate({
        _sum: { viewCount: true },
      }),
      prisma.news.count({ where: { isFeatured: true } }),
    ])

    return {
      totalNews,
      totalViews: totalViews._sum.viewCount || 0,
      featuredCount,
    }
  }
}

export default new NewsService()