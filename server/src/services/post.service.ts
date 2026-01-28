// server/src/services/post.service.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreatePostInput {
  title: string
  content: string
  authorId: string
  tags: any
  images?: string
}

export interface UpdatePostInput {
  title?: string
  content?: string
  tags?: any
  images?: string
}

export interface PostQueryParams {
  page?: number
  limit?: number
  orderBy?: 'latest' | 'popular' | 'trending'
  tag?: string
  authorId?: string
  search?: string
}

class PostService {
  // 创建帖子
  async createPost(data: CreatePostInput) {
    console.log('创建帖子数据:', data)
    console.log('tags类型:', typeof data.tags, '值:', data.tags)
    console.log('images数据:', data.images)  // ✅ 添加调试
    
    try {

      let imagesValue = ''
    if (data.images) {
      if (Array.isArray(data.images)) {
        // ✅ 处理Base64数组
        imagesValue = JSON.stringify(data.images)  // 改为JSON格式存储
      } else if (typeof data.images === 'string') {
        // ✅ 如果是字符串
        imagesValue = data.images
      }
    }

    console.log('处理后的imagesValue:', imagesValue)  // ✅ 调试输出

      const result = await prisma.post.create({
        data: {
          title: data.title,
          content: data.content,
          authorId: data.authorId,
          tags: data.tags || [],
        images: imagesValue,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      })
      
      console.log('创建成功:', result)
      return result
    } catch (error: any) {
      console.error('创建失败:', error.message)
      throw error
    }
  }

  // 获取帖子列表
  async getPosts(params: PostQueryParams) {
  const page = params.page || 1
  const limit = params.limit || 20
  const skip = (page - 1) * limit

  const where: any = {}
  
  if (params.tag) {
    where.tags = { 
      // 使用字符串contains而不是array_contains
      contains: `"${params.tag}"`  // JSON查询需要引号
    }
  }
  
  if (params.authorId) {
    where.authorId = params.authorId
  }
  
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { content: { contains: params.search } }
    ]
  }

  // ✅ 修复这里：orderBy必须是数组
  let orderBy: any[] = [{ createdAt: 'desc' }]
  
  if (params.orderBy === 'popular') {
    orderBy = [{ likeCount: 'desc' }, { createdAt: 'desc' }]
  } else if (params.orderBy === 'trending') {
    // 如果有热门排序逻辑
    orderBy = [{ likeCount: 'desc' }, { createdAt: 'desc' }]
  }

  console.log('查询参数:', { where, orderBy, page, limit, skip })

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,  // ✅ 这里是数组
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ])

    
// ✅ 处理images字段，如果是JSON字符串就解析
    const processedPosts = posts.map(post => {
      let images = []
      if (post.images) {
        try {
          // 尝试解析JSON
          const parsed = JSON.parse(post.images)
          if (Array.isArray(parsed)) {
            images = parsed
          } else if (typeof parsed === 'string') {
            images = [parsed]
          }
        } catch (e) {
          // 如果不是JSON，直接使用
          if (typeof post.images === 'string') {
            images = [post.images]
          }
        }
      }
      
      return {
        ...post,
        images  // ✅ 返回处理后的images数组
      }
    })



    return {
      posts: processedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    }
  } catch (error: any) {
    console.error('获取帖子列表失败:', error.message)
    console.error('错误详情:', error)
    throw error
  }
}

  // 获取单个帖子
  async getPostById(id: string, incrementView: boolean = false) {
    try {
      if (incrementView) {
        await prisma.post.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        })
      }

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              bio: true,
              createdAt: true,
            },
          },
          comments: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      })
      
      if (!post) return null
    
    // ✅ 同样处理images字段
    let images = []
    if (post.images) {
      try {
        const parsed = JSON.parse(post.images)
        if (Array.isArray(parsed)) {
          images = parsed
        } else if (typeof parsed === 'string') {
          images = [parsed]
        }
      } catch (e) {
        if (typeof post.images === 'string') {
          images = [post.images]
        }
      }
    }
    
    return {
      ...post,
      images  // ✅ 返回处理后的images
    }
    } catch (error: any) {
      console.error('获取帖子失败:', error.message)
      throw error
    }
  }

  // 更新帖子
  async updatePost(id: string, userId: string, data: UpdatePostInput) {
    try {
      const post = await prisma.post.findUnique({
        where: { id },
      })

      if (!post) throw new Error('帖子不存在')
      if (post.authorId !== userId) throw new Error('无权修改此帖子')

      const updateData: any = { updatedAt: new Date() }
      
      if (data.title !== undefined) updateData.title = data.title
      if (data.content !== undefined) updateData.content = data.content
      if (data.tags !== undefined) updateData.tags = data.tags
      if (data.images !== undefined) updateData.images = data.images

      const result = await prisma.post.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      })
      
      return result
    } catch (error: any) {
      console.error('更新帖子失败:', error.message)
      throw error
    }
  }

  // 删除帖子
  async deletePost(id: string, userId: string, isAdmin: boolean = false) {
    try {
      const post = await prisma.post.findUnique({ where: { id } })

      if (!post) throw new Error('帖子不存在')
      if (!isAdmin && post.authorId !== userId) throw new Error('无权删除此帖子')

      await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ])

      return { success: true }
    } catch (error: any) {
      console.error('删除帖子失败:', error.message)
      throw error
    }
  }

  // 获取热门标签 - 完全修复
  async getPopularTags(limit: number = 10) {
    try {
      // 不要用where条件，直接获取所有
      const posts = await prisma.post.findMany({
        select: { tags: true }
        // 完全移除有问题的where条件
      })

      const tagCount: Record<string, number> = {}
      
      // 手动过滤和处理
      for (const post of posts) {
        const tags = (post as any).tags
        
        // 跳过null或undefined
        if (tags === null || tags === undefined) {
          continue
        }
        
        // 处理不同类型的tags
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            if (typeof tag === 'string' && tag.trim()) {
              const trimmedTag = tag.trim()
              tagCount[trimmedTag] = (tagCount[trimmedTag] || 0) + 1
            }
          }
        } else if (typeof tags === 'string') {
          // 如果是字符串，尝试解析
          try {
            const parsed = JSON.parse(tags)
            if (Array.isArray(parsed)) {
              for (const tag of parsed) {
                if (typeof tag === 'string' && tag.trim()) {
                  const trimmedTag = tag.trim()
                  tagCount[trimmedTag] = (tagCount[trimmedTag] || 0) + 1
                }
              }
            }
          } catch (e) {
            // 如果不是JSON，跳过
            continue
          }
        }
      }

      // 排序并返回
      const sortedTags = Object.entries(tagCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }))
      
      return sortedTags
    } catch (error: any) {
      console.error('获取热门标签失败:', error)
      return []
    }
  }

  // 获取用户发帖统计
  async getUserPostStats(userId: string) {
    try {
      const [totalPosts, totalLikes, totalComments] = await Promise.all([
        prisma.post.count({ where: { authorId: userId } }),
        prisma.like.count({ where: { authorId: userId } }),
        prisma.comment.count({ where: { authorId: userId } }),
      ])

      return { totalPosts, totalLikes, totalComments }
    } catch (error: any) {
      console.error('获取用户统计失败:', error.message)
      return { totalPosts: 0, totalLikes: 0, totalComments: 0 }
    }
  }
}

export default new PostService()