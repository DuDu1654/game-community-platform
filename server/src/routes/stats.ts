// server/src/routes/stats.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// 获取系统统计（管理员权限）
router.get('/system', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const [
      userCount,
      postCount,
      commentCount,
      newsCount,
      likeCount,
      messageCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.news.count(),
      prisma.like.count(),
      prisma.message.count(),
    ])

    res.json({
      stats: {
        users: userCount,
        posts: postCount,
        comments: commentCount,
        news: newsCount,
        likes: likeCount,
        messages: messageCount,
      },
    })
  } catch (error: any) {
    console.error('获取系统统计错误:', error)
    res.status(500).json({ error: '获取系统统计失败' })
  }
})

// 获取性能指标
router.get('/performance', async (req, res) => {
  try {
    const startTime = Date.now()
    
    // 测试数据库响应时间
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbResponseTime = Date.now() - dbStart

    // 获取服务器信息
    const serverInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    }

    res.json({
      performance: {
        timestamp: new Date().toISOString(),
        totalResponseTime: Date.now() - startTime,
        dbResponseTime,
        serverInfo,
      },
    })
  } catch (error: any) {
    console.error('获取性能指标错误:', error)
    res.status(500).json({ error: '获取性能指标失败' })
  }
})

// 获取API调用统计
router.get('/api-usage', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    // 这里可以集成实际的API统计
    // 暂时返回模拟数据
    res.json({
      usage: {
        today: {
          total: 1250,
          auth: 350,
          posts: 520,
          comments: 280,
          news: 100,
        },
        yesterday: {
          total: 1100,
          auth: 320,
          posts: 480,
          comments: 250,
          news: 50,
        },
        peakHour: '14:00-15:00',
        averageResponseTime: 45, // ms
      },
    })
  } catch (error: any) {
    console.error('获取API使用统计错误:', error)
    res.status(500).json({ error: '获取API使用统计失败' })
  }
})

// 获取用户活动统计
router.get('/user-activity', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const [newUsers, activeUsers, newPosts, newComments] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      prisma.user.count({
        where: { 
          OR: [
            { posts: { some: { createdAt: { gte: last24Hours } } } },
            { comments: { some: { createdAt: { gte: last24Hours } } } },
            { likes: { some: { createdAt: { gte: last24Hours } } } },
          ],
        },
      }),
      prisma.post.count({
        where: { createdAt: { gte: last24Hours } },
      }),
      prisma.comment.count({
        where: { createdAt: { gte: last24Hours } },
      }),
    ])

    res.json({
      activity: {
        last24Hours: {
          newUsers,
          activeUsers,
          newPosts,
          newComments,
        },
      },
    })
  } catch (error: any) {
    console.error('获取用户活动统计错误:', error)
    res.status(500).json({ error: '获取用户活动统计失败' })
  }
})

export default router