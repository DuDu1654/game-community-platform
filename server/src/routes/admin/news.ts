// server/src/routes/admin/news.ts
import { Router, Request, Response, NextFunction } from 'express'
import * as NewsService from '../../models/News'

const router = Router()

// 管理员验证中间件
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 管理员权限验证中...')
  
  const authHeader = req.headers.authorization
  const queryToken = req.query.token
  
  const token = authHeader?.replace('Bearer ', '') || queryToken || ''
  
  // 开发环境下允许所有请求
  if (process.env.NODE_ENV === 'development') {
    console.log('🛠️ 开发环境，跳过验证')
    return next()
  }
  
  const validTokens = [
    'admin-token-123',
    'demo-admin-token',
    'admin',
    'test',
    '123456'
  ]
  
  if (token && validTokens.includes(token as string)) {
    console.log('✅ 管理员验证通过')
    return next()
  }
  
  console.log('❌ 管理员验证失败')
  res.status(401).json({ 
    success: false, 
    message: '未授权访问',
    error: '无效的管理员token',
    hint: '请在请求头添加: Authorization: Bearer admin-token-123'
  })
}

// 获取所有新闻
router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    console.log('📄 获取新闻列表请求:', req.query)
    
    const { 
      page = 1, 
      pageSize = 20, 
      search = '',
      status = '',
      category = ''
    } = req.query
    
    const result = await NewsService.getNewsList({
      page: Number(page),
      pageSize: Number(pageSize),
      search: search as string,
      status: status as string,
      category: category as string
    })
    
    console.log(`✅ 查询成功，找到 ${result.news.length} 条新闻`)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('❌ 获取新闻列表失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取新闻列表失败',
      error: error.message
    })
  }
})

// 创建新闻的修改部分
router.post('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const { title, content, summary, category, tags, author, status = 'draft' } = req.body
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: '标题和内容不能为空' 
      })
    }
    
    const newsData = {
      title,
      content,
      summary: summary || content.substring(0, 200) + '...',
      // 这些字段将通过tags存储
      tags: JSON.stringify({
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        status: status || 'draft',
        category: category || 'game',
        author: author || '管理员',
        likeCount: 0,
        publishTime: status === 'published' ? new Date() : null
      }),
      coverImage: req.body.coverImage || '',
      source: req.body.source || '',
      sourceUrl: req.body.sourceUrl || '',
      isFeatured: req.body.isFeatured || false
    }
    
    const news = await NewsService.createNews(newsData)
    
    res.status(201).json({
      success: true,
      data: news,
      message: '新闻创建成功'
    })
  } catch (error: any) {
    console.error('❌ 创建新闻失败:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || '创建新闻失败'
    })
  }
})

// 更新新闻
router.put('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    
    console.log('🔄 更新新闻:', id, updateData)
    
    const news = await NewsService.updateNews(id, updateData)
    
    console.log('✅ 新闻更新成功:', id)
    
    res.json({
      success: true,
      data: news,
      message: '新闻更新成功'
    })
  } catch (error: any) {
    console.error('❌ 更新新闻失败:', error)
    res.status(error.message.includes('不存在') ? 404 : 500).json({ 
      success: false, 
      message: error.message || '更新新闻失败'
    })
  }
})

// 删除新闻
router.delete('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log('🗑️ 删除新闻:', id)
    
    await NewsService.deleteNews(id)
    
    console.log('✅ 新闻删除成功:', id)
    
    res.json({
      success: true,
      message: '新闻删除成功'
    })
  } catch (error: any) {
    console.error('❌ 删除新闻失败:', error)
    res.status(error.message.includes('不存在') ? 404 : 500).json({ 
      success: false, 
      message: error.message || '删除新闻失败'
    })
  }
})

// 批量操作
router.post('/batch', adminAuth, async (req: Request, res: Response) => {
  try {
    const { action, ids } = req.body
    
    console.log('🔄 批量操作:', action, ids)
    
    if (!['publish', 'unpublish', 'delete'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: '不支持的操作类型' 
      })
    }
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '请选择要操作的新闻' 
      })
    }
    
    let results = []
    let successCount = 0
    let failCount = 0
    
    for (const id of ids) {
      try {
        switch (action) {
          case 'publish':
            await NewsService.updateNews(id, { 
              status: 'published',
              publishTime: new Date()
            })
            break
          case 'unpublish':
            await NewsService.updateNews(id, { 
              status: 'draft',
              publishTime: null
            })
            break
          case 'delete':
            await NewsService.deleteNews(id)
            break
        }
        successCount++
      } catch (error: any) {
        failCount++
        results.push({
          id,
          error: error.message
        })
      }
    }
    
    console.log(`✅ 批量操作完成: ${action}, 成功: ${successCount}, 失败: ${failCount}`)
    
    res.json({
      success: true,
      message: `批量操作完成，成功 ${successCount} 条，失败 ${failCount} 条`,
      data: { successCount, failCount, results }
    })
  } catch (error: any) {
    console.error('❌ 批量操作失败:', error)
    res.status(500).json({ 
      success: false, 
      message: error.message || '批量操作失败'
    })
  }
})

// 获取新闻详情
router.get('/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log('📄 获取新闻详情:', id)
    
    const news = await NewsService.getNewsById(id)
    
    res.json({
      success: true,
      data: news
    })
  } catch (error: any) {
    console.error('❌ 获取新闻详情失败:', error)
    res.status(error.message.includes('不存在') ? 404 : 500).json({ 
      success: false, 
      message: error.message || '获取新闻详情失败'
    })
  }
})

export default router