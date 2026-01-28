// server/src/routes/search.ts
import { Router, Request, Response } from 'express'
import prisma from '../config/database'

const router = Router()

// 自己封装异步处理器
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((error) => {
      console.error('请求处理错误:', error)
      res.status(500).json({ 
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误'
      })
    })
  }
}

// 搜索接口
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { keyword, limit = 10 } = req.query
  const keywordStr = String(keyword || '').trim()
  
  if (!keywordStr) {
    return res.json({
      posts: [],
      news: [],
      users: [],
      total: 0
    })
  }

  const limitNum = Math.min(Number(limit), 20)

  // 搜索帖子
  const posts = await prisma.post.findMany({
    where: {
      title: {
        contains: keywordStr
      }
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true
        }
      }
    },
    take: limitNum,
    orderBy: { createdAt: 'desc' }
  })
  
  // 搜索资讯
  const news = await prisma.news.findMany({
    where: {
      title: {
        contains: keywordStr
      }
    },
    take: limitNum,
    orderBy: { createdAt: 'desc' }
  })
  
  // 搜索用户
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: keywordStr
      }
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      createdAt: true
    },
    take: limitNum,
    orderBy: { createdAt: 'desc' }
  })

  // 构建响应对象
  const response = {
    posts: posts.map(post => ({
      id: post.id,
      type: 'post' as const,
      title: post.title,
      content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      author: {
        id: post.author.id,
        username: post.author.username,
        avatar: post.author.avatar || ''
      },
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt.toISOString()
    })),
    
    news: news.map(newsItem => ({
      id: newsItem.id,
      type: 'news' as const,
      title: newsItem.title,
      content: (newsItem.summary || newsItem.content.substring(0, 100) + (newsItem.content.length > 100 ? '...' : '')) || '',
      author: {
        id: '',
        username: '系统',
        avatar: ''
      },
      viewCount: newsItem.viewCount,
      coverImage: newsItem.coverImage || '',
      createdAt: newsItem.createdAt.toISOString()
    })),
    
    users: users.map(user => ({
      id: user.id,
      type: 'user' as const,
      username: user.username,
      bio: user.bio || '暂无个人简介',
      avatar: user.avatar || '',
      createdAt: user.createdAt.toISOString()
    })),
    
    total: posts.length + news.length + users.length
  }

  res.json(response)
}))

export default router