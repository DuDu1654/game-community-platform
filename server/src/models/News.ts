// server/src/models/News.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 根据实际的数据库schema定义接口
export interface INews {
  id?: string
  title: string
  content: string
  summary?: string | null
  coverImage?: string | null
  source?: string | null
  sourceUrl?: string | null
  viewCount?: number
  isFeatured?: boolean
  tags?: string | null
  status?: string
  author?: string
  category?: string
  publishTime?: Date | null
  likeCount?: number
  createdAt?: Date
  updatedAt?: Date
}

// server/src/models/News.ts
export const createNews = async (data: Omit<INews, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('📝 创建新闻，接收到的数据:', {
      title: data.title?.substring(0, 50),
      tags: data.tags,
      status: data.status
    })
    
    // 确保 tags 是一个对象，而不是字符串
    let tagsData: any = {}
    
    if (data.tags) {
      if (typeof data.tags === 'string') {
        // 如果是字符串，尝试解析
        try {
          tagsData = JSON.parse(data.tags)
        } catch (e) {
          // 如果不是 JSON，假设是标签数组字符串
          if (data.tags.includes('[') && data.tags.includes(']')) {
            // 尝试清理字符串格式
            const cleaned = data.tags.replace(/^\[/, '').replace(/\]$/, '').trim()
            tagsData = {
              tags: cleaned ? cleaned.split(',').map(t => t.trim().replace(/['"]/g, '')) : [],
              status: data.status || 'draft',
              author: data.author || '管理员',
              category: data.category || 'general',
              likeCount: data.likeCount || 0,
              publishTime: data.publishTime || null
            }
          } else {
            tagsData = {
              tags: [data.tags],
              status: data.status || 'draft',
              author: data.author || '管理员',
              category: data.category || 'general',
              likeCount: data.likeCount || 0,
              publishTime: data.publishTime || null
            }
          }
        }
      } else if (Array.isArray(data.tags)) {
        tagsData = {
          tags: data.tags,
          status: data.status || 'draft',
          author: data.author || '管理员',
          category: data.category || 'general',
          likeCount: data.likeCount || 0,
          publishTime: data.publishTime || null
        }
      } else {
        tagsData = {
          tags: [],
          status: data.status || 'draft',
          author: data.author || '管理员',
          category: data.category || 'general',
          likeCount: data.likeCount || 0,
          publishTime: data.publishTime || null
        }
      }
    } else {
      tagsData = {
        tags: [],
        status: data.status || 'draft',
        author: data.author || '管理员',
        category: data.category || 'general',
        likeCount: data.likeCount || 0,
        publishTime: data.publishTime || null
      }
    }
    
    console.log('📦 准备存储的tags:', tagsData)
    
    const news = await prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        summary: data.summary || data.content.substring(0, 200) + '...',
        coverImage: data.coverImage || '',
        source: data.source || '',
        // 只存储一次 JSON.stringify
        tags: JSON.stringify(tagsData)
      }
    })
    
    console.log('✅ 新闻创建成功，ID:', news.id, 'tags长度:', JSON.stringify(tagsData).length)
    
    return news
  } catch (error: any) {
    console.error('❌ 创建新闻失败:', {
      error: error.message,
      code: error.code,
      meta: error.meta
    })
    throw new Error(`创建失败: ${error.message}`)
  }
}

// 获取新闻列表
export const getNewsList = async (options: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  category?: string
}) => {
  try {
    const { page = 1, pageSize = 20, search = '', status = '', category = '' } = options
    const skip = (page - 1) * pageSize
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { summary: { contains: search } }
      ]
    }
    
    // 如果数据库没有status/category字段，在内存中过滤
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.news.count({ where })
    ])
    
    // 解析tags字段中的额外信息
    const formattedNews = news.map(item => {
      let tagsArray: string[] = []
      let status = 'draft'
      let author = '管理员'
      let category = 'general'
      let likeCount = 0
      let publishTime: Date | null = null
      
      try {
  if (item.tags) {
    // 移除多余的转义字符
    let tagsStr = item.tags
    
    // 处理可能的双重转义
    tagsStr = tagsStr.replace(/\\\\"/g, '"').replace(/\\'/g, "'")
    
    // 如果是字符串化的 JSON，先解析
    if (tagsStr.startsWith('{') || tagsStr.startsWith('"')) {
      try {
        const parsedTags = JSON.parse(tagsStr)
        
        // 如果解析后是字符串，再解析一次
        if (typeof parsedTags === 'string') {
          const doubleParsed = JSON.parse(parsedTags)
          if (typeof doubleParsed === 'object' && doubleParsed !== null) {
            tagsArray = Array.isArray(doubleParsed.tags) ? doubleParsed.tags : doubleParsed.tags ? [doubleParsed.tags] : []
            status = doubleParsed.status || 'draft'
            author = doubleParsed.author || '管理员'
            category = doubleParsed.category || 'general'
            likeCount = Number(doubleParsed.likeCount) || 0
            publishTime = doubleParsed.publishTime ? new Date(doubleParsed.publishTime) : null
          }
        } else if (typeof parsedTags === 'object' && parsedTags !== null) {
          tagsArray = Array.isArray(parsedTags.tags) ? parsedTags.tags : parsedTags.tags ? [parsedTags.tags] : []
          status = parsedTags.status || 'draft'
          author = parsedTags.author || '管理员'
          category = parsedTags.category || 'general'
          likeCount = Number(parsedTags.likeCount) || 0
          publishTime = parsedTags.publishTime ? new Date(parsedTags.publishTime) : null
        }
      } catch (parseError) {
        console.warn('解析tags失败，尝试直接使用:', tagsStr)
        // 如果是简单字符串，直接使用
        tagsArray = tagsStr.split(',').filter(tag => tag.trim())
      }
    } else {
      // 直接是标签数组
      tagsArray = tagsStr.split(',').filter(tag => tag.trim())
    }
  }
} catch (e) {
  console.error('解析tags失败:', e, '原始tags:', item.tags)
}
      
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        summary: item.summary,
        coverImage: item.coverImage,
        source: item.source,
        
        viewCount: item.viewCount,
        isFeatured: item.isFeatured,
        status,
        author,
        category,
        tags: tagsArray,
        likeCount,
        publishTime,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    })
    
    // 在内存中进行状态和分类过滤
    let filteredNews = formattedNews
    if (status) {
      filteredNews = filteredNews.filter(item => item.status === status)
    }
    if (category) {
      filteredNews = filteredNews.filter(item => item.category === category)
    }
    
    return {
      news: filteredNews,
      total: filteredNews.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredNews.length / pageSize)
    }
  } catch (error: any) {
    console.error('获取新闻列表失败:', error)
    throw new Error(`获取列表失败: ${error.message}`)
  }
}

// 更新新闻
export const updateNews = async (id: string, data: Partial<INews>) => {
  try {
    // 先获取现有数据
    const existing = await prisma.news.findUnique({
      where: { id }
    })
    
    if (!existing) {
      throw new Error('新闻不存在')
    }
    
    // 解析现有的tags
    let existingTags: any = {}
    try {
      if (existing.tags) {
        existingTags = JSON.parse(existing.tags)
      }
    } catch (e) {
      existingTags = {}
    }
    
    // 合并新的元数据
    const updatedTags = {
      tags: data.tags || existingTags.tags || [],
      status: data.status || existingTags.status || 'draft',
      author: data.author || existingTags.author || '管理员',
      category: data.category || existingTags.category || 'general',
      likeCount: data.likeCount !== undefined ? data.likeCount : (existingTags.likeCount || 0),
      publishTime: data.publishTime || existingTags.publishTime || null
    }
    
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.summary !== undefined) updateData.summary = data.summary
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.source !== undefined) updateData.source = data.source
    if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured
    
    // 总是更新tags
    updateData.tags = JSON.stringify(updatedTags)
    
    const news = await prisma.news.update({
      where: { id },
      data: updateData
    })
    
    return {
      ...news,
      ...updatedTags,
      tags: updatedTags.tags
    }
  } catch (error: any) {
    console.error('更新新闻失败:', error)
    if (error.code === 'P2025') {
      throw new Error('新闻不存在')
    }
    throw new Error(`更新失败: ${error.message}`)
  }
}

// 获取单个新闻
export const getNewsById = async (id: string) => {
  try {
    const news = await prisma.news.findUnique({
      where: { id }
    })
    
    if (!news) {
      throw new Error('新闻不存在')
    }
    
    // 解析tags
    let tagsArray: string[] = []
    let status = 'draft'
    let author = '管理员'
    let category = 'general'
    let likeCount = 0
    let publishTime: Date | null = null
    
    try {
      if (news.tags) {
        const parsedTags = JSON.parse(news.tags)
        if (typeof parsedTags === 'object' && parsedTags !== null) {
          tagsArray = Array.isArray(parsedTags.tags) ? parsedTags.tags : parsedTags.tags ? [parsedTags.tags] : []
          status = parsedTags.status || 'draft'
          author = parsedTags.author || '管理员'
          category = parsedTags.category || 'general'
          likeCount = Number(parsedTags.likeCount) || 0
          publishTime = parsedTags.publishTime ? new Date(parsedTags.publishTime) : null
        } else {
          tagsArray = Array.isArray(parsedTags) ? parsedTags : []
        }
      }
    } catch (e) {
      console.error('解析tags失败:', e)
    }
    
    return {
      id: news.id,
      title: news.title,
      content: news.content,
      summary: news.summary,
      coverImage: news.coverImage,
      source: news.source,
      
      viewCount: news.viewCount,
      isFeatured: news.isFeatured,
      status,
      author,
      category,
      tags: tagsArray,
      likeCount,
      publishTime,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt
    }
  } catch (error: any) {
    console.error('获取新闻失败:', error)
    if (error.code === 'P2025') {
      throw new Error('新闻不存在')
    }
    throw new Error(`获取失败: ${error.message}`)
  }
}

// 删除新闻
export const deleteNews = async (id: string) => {
  try {
    await prisma.news.delete({
      where: { id }
    })
    return true
  } catch (error: any) {
    console.error('删除新闻失败:', error)
    if (error.code === 'P2025') {
      throw new Error('新闻不存在')
    }
    throw new Error(`删除失败: ${error.message}`)
  }
}

// 增加浏览量
export const incrementViews = async (id: string) => {
  try {
    const news = await prisma.news.update({
      where: { id },
      data: {
        viewCount: { increment: 1 }
      }
    })
    return news
  } catch (error: any) {
    console.error('增加浏览量失败:', error)
    if (error.code === 'P2025') {
      throw new Error('新闻不存在')
    }
    throw new Error(`增加浏览量失败: ${error.message}`)
  }
}

// 增加点赞
export const incrementLikes = async (id: string) => {
  try {
    const news = await getNewsById(id)
    if (!news) throw new Error('新闻不存在')
    
    // 更新tags中的likeCount
    return await updateNews(id, {
      likeCount: (news.likeCount || 0) + 1
    })
  } catch (error: any) {
    console.error('增加点赞失败:', error)
    throw new Error(`增加点赞失败: ${error.message}`)
  }
}

// 获取热门新闻
export const getPopularNews = async (limit: number = 10) => {
  try {
    const allNews = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // 获取多一些，然后在内存中排序
    })
    
    // 解析并计算排序分数
    const parsedNews = allNews.map(item => {
      let likeCount = 0
      let status = 'draft'
      
      try {
        if (item.tags) {
          const parsedTags = JSON.parse(item.tags)
          if (typeof parsedTags === 'object' && parsedTags !== null) {
            likeCount = Number(parsedTags.likeCount) || 0
            status = parsedTags.status || 'draft'
          }
        }
      } catch (e) {
        console.error('解析tags失败:', e)
      }
      
      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        coverImage: item.coverImage,
        viewCount: item.viewCount,
        likeCount,
        createdAt: item.createdAt,
        status
      }
    })
    
    // 过滤已发布并按热度排序
    const publishedNews = parsedNews.filter(item => item.status === 'published')
    const sortedNews = publishedNews.sort((a, b) => {
      const scoreA = (a.viewCount || 0) + (a.likeCount || 0) * 5
      const scoreB = (b.viewCount || 0) + (b.likeCount || 0) * 5
      return scoreB - scoreA
    })
    
    return sortedNews.slice(0, limit)
  } catch (error: any) {
    console.error('获取热门新闻失败:', error)
    throw new Error(`获取热门新闻失败: ${error.message}`)
  }
}

// 获取统计数据
export const getNewsStats = async () => {
  try {
    const allNews = await prisma.news.findMany()
    
    let total = 0
    let published = 0
    let draft = 0
    let totalViews = 0
    let totalLikes = 0
    
    allNews.forEach(item => {
      total++
      totalViews += item.viewCount || 0
      
      let status = 'draft'
      let likeCount = 0
      
      try {
        if (item.tags) {
          const parsedTags = JSON.parse(item.tags)
          if (typeof parsedTags === 'object' && parsedTags !== null) {
            status = parsedTags.status || 'draft'
            likeCount = Number(parsedTags.likeCount) || 0
          }
        }
      } catch (e) {
        // 忽略解析错误
      }
      
      if (status === 'published') {
        published++
      } else {
        draft++
      }
      
      totalLikes += likeCount
    })
    
    return {
      total,
      published,
      draft,
      totalViews,
      totalLikes
    }
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    throw new Error(`获取统计数据失败: ${error.message}`)
  }
}