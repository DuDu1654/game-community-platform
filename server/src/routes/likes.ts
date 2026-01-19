// 在 server/src/routes/likes.ts 中
import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import likeService from '../services/like.service'

const router = Router()

// ✅ 添加：获取用户的点赞列表
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const targetType = req.query.targetType as 'all' | 'post' | 'comment'

    const result = await likeService.getUserLikes(userId, page, limit, targetType)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('获取用户点赞错误:', error)
    res.status(500).json({ 
      success: false,
      error: '获取用户点赞失败' 
    })
  }
})

// ... 其他已有的 like 接口
export default router