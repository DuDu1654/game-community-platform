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

  // 获取新闻列表
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
      // 如果 tags 是字符串，用 contains 搜索
      where.tags = {
        contains: params.tag,  // 用 contains 替代 has
      }
    }
    
    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },  // 移除 mode
        { content: { contains: params.search } },
        { summary: { contains: params.search } },
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

    return {
      news,
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

  // 获取新闻详情
  async getNewsById(id: string, incrementView: boolean = false) {
    if (incrementView) {
      await prisma.news.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
    }

    return await prisma.news.findUnique({
      where: { id },
    })
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