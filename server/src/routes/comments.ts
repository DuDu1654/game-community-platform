// server/src/routes/comments.ts
import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import commentService from '../services/comment.service'
import likeService from '../services/like.service'

const router = Router()

// 获取评论的回复
router.get('/:id/replies', async (req, res) => {
  try {
    const { id } = req.params
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const result = await commentService.getCommentReplies(id, page, limit)
    
    res.json(result)
  } catch (error: any) {
    console.error('获取回复错误:', error)
    res.status(500).json({ error: '获取回复失败' })
  }
})

// 更新评论
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId
    const { content, images } = req.body

    if (!content) {
      return res.status(400).json({ error: '评论内容不能为空' })
    }

    const comment = await commentService.updateComment(id, userId, {
      content,
      images,
    })

    res.json({
      message: '评论更新成功',
      comment,
    })
  } catch (error: any) {
    console.error('更新评论错误:', error)
    
    if (error.message === '评论不存在') {
      return res.status(404).json({ error: error.message })
    }
    
    if (error.message === '无权修改此评论') {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: '更新评论失败' })
  }
})

// 删除评论
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId
    const isAdmin = req.user!.role === 'ADMIN'

    await commentService.deleteComment(id, userId, isAdmin)

    res.json({ message: '评论删除成功' })
  } catch (error: any) {
    console.error('删除评论错误:', error)
    
    if (error.message === '评论不存在') {
      return res.status(404).json({ error: error.message })
    }
    
    if (error.message === '无权删除此评论') {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: '删除评论失败' })
  }
})

// 点赞评论
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const result = await likeService.likeComment(id, userId)
    
    res.json({
      message: result.liked ? '点赞成功' : '取消点赞成功',
      ...result,
    })
  } catch (error: any) {
    console.error('点赞评论错误:', error)
    res.status(500).json({ error: '操作失败' })
  }
})

// 检查评论点赞状态
router.get('/:id/like/check', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const result = await likeService.checkCommentLike(id, userId)
    
    res.json(result)
  } catch (error: any) {
    console.error('检查评论点赞状态错误:', error)
    res.status(500).json({ error: '检查失败' })
  }
})


// ✅ 添加这个：创建评论
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId, content, parentId, images } = req.body
    const userId = req.user!.userId

    console.log('📝 收到创建评论请求')
    console.log('用户ID:', userId)
    console.log('请求体:', req.body)

    // 验证必填字段
    if (!content || !postId) {
      return res.status(400).json({ 
        success: false,
        error: '评论内容和帖子ID是必填项' 
      })
    }

    // 调用service创建评论
    const comment = await commentService.createComment({
      content,
      postId,
      authorId: userId,
      parentId: parentId || null,
      images: images || [],
    })

    res.status(201).json({
      success: true,
      message: '评论创建成功',
      data: comment
    })
  } catch (error: any) {
    console.error('创建评论错误:', error)
    
    if (error.message.includes('必填项')) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      })
    }
    
    res.status(500).json({ 
      success: false,
      error: error.message || '创建评论失败' 
    })
  }
})

// 获取帖子的评论（还需要这个路由）
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const result = await commentService.getCommentsByPostId(postId, page, limit)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('获取评论错误:', error)
    res.status(500).json({ 
      success: false,
      error: '获取评论失败' 
    })
  }
})

export default router