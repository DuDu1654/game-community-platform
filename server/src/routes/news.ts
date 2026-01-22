// server/src/routes/news.ts
import { Router } from 'express'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'
import newsService from '../services/news.service'

const router = Router()

// 统一响应函数
const apiResponse = (success: boolean, data?: any, error?: string, message?: string, pagination?: any) => {
  return {
    success,
    data,
    error,
    message,
    pagination
  }
}

// 获取新闻列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      featured,
      tag,
      search,
    } = req.query

    const result = await newsService.getNewsList({
      page: Number(page),
      limit: Number(limit),
      featured: featured === 'true',
      tag: tag as string,
      search: search as string,
    })

    // ✅ 修复：移除多余的 {news: result.news}
    res.json(apiResponse(
      true, 
      result.news,  // 直接返回数组
      undefined,
      '获取新闻列表成功',
      result.pagination
    ))
  } catch (error: any) {
    console.error('获取新闻列表错误:', error)
    res.status(500).json(apiResponse(false, undefined, '获取新闻列表失败'))
  }
})

// 获取新闻详情
// server/src/routes/news.ts
// 获取新闻详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const incrementView = req.query.view === 'true'
    
    console.log('🔍 获取新闻详情，ID:', id, 'incrementView:', incrementView)
    
    const news = await newsService.getNewsById(id, incrementView)
    console.log('📰 新闻服务返回:', news)
    
    if (!news) {
      console.log('❌ 新闻不存在，ID:', id)
      return res.status(404).json(apiResponse(false, null, '新闻不存在'))  // 这里应该是null，不是undefined
    }
    
    
    
    // 🔥 关键修复：确保返回的是单个对象，不是数组
    if (Array.isArray(news)) {
      console.warn('⚠️ news是数组，取第一个元素')
      if (news.length > 0) {
        res.json(apiResponse(true, news[0], undefined, '获取新闻详情成功'))
      } else {
        res.status(404).json(apiResponse(false, null, '新闻不存在'))
      }
    } else {
      // 正常返回单个对象
      res.json(apiResponse(true, news, undefined, '获取新闻详情成功'))
    }
  } catch (error: any) {
    console.error('获取新闻详情错误:', error)
    res.status(500).json(apiResponse(false, null, '获取新闻详情失败'))  // 这里也应该是null
  }
})

// 获取热门新闻
router.get('/featured/recent', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5
    const news = await newsService.getFeaturedNews(limit)
    
    // ✅ 修复：直接返回数组
    res.json(apiResponse(true, news, undefined, '获取热门新闻成功'))
  } catch (error: any) {
    console.error('获取热门新闻错误:', error)
    res.status(500).json(apiResponse(false, undefined, '获取热门新闻失败'))
  }
})

// 获取新闻统计
router.get('/stats/all', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const stats = await newsService.getNewsStats()
    res.json(apiResponse(true, { stats }))
  } catch (error: any) {
    console.error('获取新闻统计错误:', error)
    res.status(500).json(apiResponse(false, undefined, '获取新闻统计失败'))
  }
})

// 创建新闻（需要管理员权限）
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { title, content, summary, coverImage, source, tags, isFeatured } = req.body

    if (!title || !content) {
      return res.status(400).json(apiResponse(false, undefined, '标题和内容不能为空'))
    }

    const news = await newsService.createNews({
      title,
      content,
      summary,
      coverImage,
      source,
      tags: tags || [],
      isFeatured,
    })

    res.status(201).json(apiResponse(true, { news }, undefined, '新闻创建成功'))
  } catch (error: any) {
    console.error('创建新闻错误:', error)
    res.status(500).json(apiResponse(false, undefined, '创建新闻失败'))
  }
})

// 更新新闻（需要管理员权限）
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { title, content, summary, coverImage, source, tags, isFeatured } = req.body

    const news = await newsService.updateNews(id, {
      title,
      content,
      summary,
      coverImage,
      source,
      tags,
      isFeatured,
    })

    res.json(apiResponse(true, { news }, undefined, '新闻更新成功'))
  } catch (error: any) {
    console.error('更新新闻错误:', error)
    res.status(500).json(apiResponse(false, undefined, '更新新闻失败'))
  }
})

// 删除新闻（需要管理员权限）
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    await newsService.deleteNews(id)

    res.json(apiResponse(true, { deleted: true }, undefined, '新闻删除成功'))
  } catch (error: any) {
    console.error('删除新闻错误:', error)
    res.status(500).json(apiResponse(false, undefined, '删除新闻失败'))
  }
})

export default router