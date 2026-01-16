// server/src/routes/posts.ts
import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import postService from '../services/post.service'
import commentService from '../services/comment.service'
import likeService from '../services/like.service'

const router = Router()

// 获取帖子列表
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      orderBy = 'latest',
      tag,
      authorId,
      search,
    } = req.query

    const result = await postService.getPosts({
      page: Number(page),
      limit: Number(limit),
      orderBy: orderBy as any,
      tag: tag as string,
      authorId: authorId as string,
      search: search as string,
    })

    res.json(result)
  } catch (error: any) {
    console.error('获取帖子列表错误:', error)
    res.status(500).json({ error: '获取帖子列表失败' })
  }
})

// 获取单个帖子
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const incrementView = req.query.view === 'true'
    
    const post = await postService.getPostById(id, incrementView)
    
    if (!post) {
      return res.status(404).json({ error: '帖子不存在' })
    }
    
    res.json({ post })
  } catch (error: any) {
    console.error('获取帖子详情错误:', error)
    res.status(500).json({ error: '获取帖子详情失败' })
  }
})

// 创建帖子
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, tags, images } = req.body
    const userId = req.user!.userId

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' })
    }

    const post = await postService.createPost({
      title,
      content,
      authorId: userId,
      tags: tags || [],
      images,
    })

    res.status(201).json({
      message: '帖子创建成功',
      post,
    })
  } catch (error: any) {
    console.error('创建帖子错误:', error)
    res.status(500).json({ error: '创建帖子失败' })
  }
})

// 更新帖子
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId
    const { title, content, tags, images } = req.body

    const post = await postService.updatePost(id, userId, {
      title,
      content,
      tags,
      images,
    })

    res.json({
      message: '帖子更新成功',
      post,
    })
  } catch (error: any) {
    console.error('更新帖子错误:', error)
    
    if (error.message === '帖子不存在') {
      return res.status(404).json({ error: error.message })
    }
    
    if (error.message === '无权修改此帖子') {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: '更新帖子失败' })
  }
})

// 删除帖子
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId
    const isAdmin = req.user!.role === 'ADMIN'

    await postService.deletePost(id, userId, isAdmin)

    res.json({ message: '帖子删除成功' })
  } catch (error: any) {
    console.error('删除帖子错误:', error)
    
    if (error.message === '帖子不存在') {
      return res.status(404).json({ error: error.message })
    }
    
    if (error.message === '无权删除此帖子') {
      return res.status(403).json({ error: error.message })
    }
    
    res.status(500).json({ error: '删除帖子失败' })
  }
})

// 获取热门标签
router.get('/tags/popular', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const tags = await postService.getPopularTags(limit)
    
    res.json({ tags })
  } catch (error: any) {
    console.error('获取热门标签错误:', error)
    res.status(500).json({ error: '获取热门标签失败' })
  }
})

// 获取帖子评论
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const result = await commentService.getCommentsByPostId(id, page, limit)
    
    res.json(result)
  } catch (error: any) {
    console.error('获取评论错误:', error)
    res.status(500).json({ error: '获取评论失败' })
  }
})

// 创建评论
router.post('/:id/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { content, parentId, images } = req.body
    const userId = req.user!.userId

    if (!content) {
      return res.status(400).json({ error: '评论内容不能为空' })
    }

    const comment = await commentService.createComment({
      content,
      postId: id,
      authorId: userId,
      parentId,
      images,
    })

    res.status(201).json({
      message: '评论创建成功',
      comment,
    })
  } catch (error: any) {
    console.error('创建评论错误:', error)
    res.status(500).json({ error: '创建评论失败' })
  }
})

// 点赞帖子
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const result = await likeService.likePost(id, userId)
    
    res.json({
      success: true,  // ✅ 添加这个字段
      message: result.liked ? '点赞成功' : '取消点赞成功',
      ...result,
    })
  } catch (error: any) {
    console.error('点赞帖子错误:', error)
    res.status(500).json({ 
      success: false,  // ✅ 添加这个字段
      error: '操作失败' 
    })
  }
})

// 检查是否点赞
router.get('/:id/like/check', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const result = await likeService.checkPostLike(id, userId)
    
    res.json(result)
  } catch (error: any) {
    console.error('检查点赞状态错误:', error)
    res.status(500).json({ error: '检查失败' })
  }
})

export default router