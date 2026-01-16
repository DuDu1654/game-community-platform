// server/src/services/comment.service.ts
import { PrismaClient, Comment } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateCommentInput {
  content: string
  postId: string
  authorId: string
  parentId?: string
  images?: string[]  // 改为 string，不是 string[]
}

export interface UpdateCommentInput {
  content: string
  images?: string[]  // 改为 string
}

class CommentService {
  // 创建评论
  async createComment(data: CreateCommentInput) {
    console.log('创建评论，数据:', data)  // ✅ 添加日志
    // 开始事务
    return await prisma.$transaction(async (tx) => {

      // 处理images字段
      const imagesData = Array.isArray(data.images) ? data.images : []
      
      // 创建评论
      const comment = await tx.comment.create({
        data: {
          content: data.content,
          postId: data.postId,
          authorId: data.authorId,
          parentId: data.parentId,
          // 修改第31行
images: (data.images && Array.isArray(data.images) && data.images.length > 0) 
  ? data.images 
  : undefined,  // ✅ 使用 undefined
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      })

      // 更新帖子的评论计数
      await tx.post.update({
        where: { id: data.postId },
        data: { commentCount: { increment: 1 } },
      })

      return comment
    })
  }

  // 获取帖子的评论
  async getCommentsByPostId(
    postId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { 
          postId,
          parentId: null, // 只获取顶级评论
        },
        orderBy: { createdAt: 'desc' },
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
        },
      }),
      prisma.comment.count({ 
        where: { 
          postId,
          parentId: null,
        },
      }),
    ])

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // 获取评论的回复
  async getCommentReplies(commentId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where: { parentId: commentId },
        orderBy: { createdAt: 'asc' },
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
        },
      }),
      prisma.comment.count({ where: { parentId: commentId } }),
    ])

    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // 更新评论
  async updateComment(commentId: string, userId: string, data: UpdateCommentInput) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new Error('评论不存在')
    }

    if (comment.authorId !== userId) {
      throw new Error('无权修改此评论')
    }

    // 手动构建更新数据
    const updateData: any = {
      content: data.content,
      updatedAt: new Date(),
    }

    if (data.images !== undefined) {
      updateData.images = data.images
    }

    return await prisma.comment.update({
      where: { id: commentId },
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
  }

  // 删除评论
  async deleteComment(commentId: string, userId: string, isAdmin: boolean = false) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new Error('评论不存在')
    }

    if (!isAdmin && comment.authorId !== userId) {
      throw new Error('无权删除此评论')
    }

    return await prisma.$transaction(async (tx) => {
      // 获取所有回复
      const replies = await tx.comment.findMany({
        where: { parentId: commentId },
        select: { id: true }
      })

      // 删除所有回复
      if (replies.length > 0) {
        await tx.comment.deleteMany({
          where: { parentId: commentId },
        })
      }

      // 删除评论本身
      await tx.comment.delete({
        where: { id: commentId },
      })

      // 更新帖子评论计数
      await tx.post.update({
        where: { id: comment.postId },
        data: { 
          commentCount: { 
            decrement: replies.length + 1 
          } 
        },
      })

      return { success: true }
    })
  }
}

export default new CommentService()