// server/src/routes/user.ts
import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const router = Router()
const prisma = new PrismaClient()

// 获取当前用户信息
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        // 暂时去掉 phone
        // phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: '用户不存在' 
      })
    }
    
    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ 
      success: false,
      error: '获取用户信息失败' 
    })
  }
})

// 更新用户信息
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { username, bio, avatar } = req.body
    
    console.log('🔄 更新用户信息请求:', { userId, username, bio, avatar })
    
    // 验证用户名是否已存在
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      })
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: '用户名已存在' 
        })
      }
    }
    
    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        // phone: true,
        role: true,
        updatedAt: true
      }
    })
    
    console.log('✅ 用户信息更新成功:', updatedUser)
    
    res.json({
      success: true,
      data: updatedUser,
      message: '用户信息更新成功'
    })
  } catch (error: any) {
    console.error('更新用户信息失败:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || '更新用户信息失败' 
    })
  }
})

router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params
    
    const [postCount, commentCount, likeCount] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.like.count({ where: { authorId: userId } })
    ])
    
    res.json({
      success: true,
      data: {
        posts: postCount,
        comments: commentCount,
        likes: likeCount
      }
    })
  } catch (error: any) {
    console.error('获取用户统计失败:', error)
    res.status(500).json({
      success: false,
      error: '获取统计信息失败'
    })
  }
})

// 获取用户的评论列表
router.get('/:userId/comments', async (req, res) => {
  try {
    const { userId } = req.params
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const skip = (page - 1) * limit
    
    const comments = await prisma.comment.findMany({
      where: {
        authorId: userId
      },
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        },
        author: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })
    
    const total = await prisma.comment.count({
      where: { authorId: userId }
    })
    
    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error: any) {
    console.error('获取用户评论失败:', error)
    res.status(500).json({
      success: false,
      error: '获取用户评论失败'
    })
  }
})




// 更新密码
router.put('/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { currentPassword, newPassword, confirmPassword } = req.body
    
    console.log('🔐 更新密码请求:', { userId })
    
    // 验证参数
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        error: '请填写所有密码字段' 
      })
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        error: '两次输入的新密码不一致' 
      })
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: '密码至少需要8位' 
      })
    }
    
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    })
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: '用户不存在' 
      })
    }
    
    // 验证当前密码
    const isValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false,
        error: '当前密码错误' 
      })
    }
    
    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
    
    console.log('✅ 密码更新成功')
    
    res.json({ 
      success: true,
      message: '密码修改成功' 
    })
  } catch (error: any) {
    console.error('更新密码失败:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || '更新密码失败' 
    })
  }
})

// 上传头像（简化版，实际应该处理文件上传）
router.post('/avatar', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const { avatarUrl } = req.body // 这里简化处理，实际应该上传文件
    
    console.log('🖼️ 上传头像请求:', { userId, avatarUrl })
    
    if (!avatarUrl) {
      return res.status(400).json({ 
        success: false,
        error: '请提供头像URL' 
      })
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        username: true,
        avatar: true
      }
    })
    
    res.json({
      success: true,
      data: updatedUser,
      message: '头像上传成功'
    })
  } catch (error: any) {
    console.error('上传头像失败:', error)
    res.status(500).json({ 
      success: false,
      error: error.message || '上传头像失败' 
    })
  }
})

export default router