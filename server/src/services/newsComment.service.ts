// server/src/services/newsComment.service.ts
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateCommentInput {
  content: string
  images?: any[]
  parentId?: string
}

export interface UpdateCommentInput {
  content?: string
  images?: any[]
}

export interface CommentQueryParams {
  page?: number
  limit?: number
  sortBy?: 'latest' | 'popular'
}

class NewsCommentService {
  // 获取新闻评论列表
  async getCommentsByNewsId(
    newsId: string, 
    params: CommentQueryParams = {}
  ) {
    const page = params.page || 1
    const limit = params.limit || 20
    const skip = (page - 1) * limit
    const sortBy = params.sortBy || 'latest'

    // 构建排序条件
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'popular') {
      orderBy = { likeCount: 'desc' }
    }

    try {
      // 使用 any 类型绕过 TypeScript 检查
      const [comments, total] = await Promise.all([
        (prisma as any).newsComment.findMany({
          where: { 
            newsId,
            parentId: null,
            isReply: false
          },
          orderBy,
          skip,
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }),
        (prisma as any).newsComment.count({ 
          where: { 
            newsId,
            parentId: null,
            isReply: false
          }
        })
      ])

      // 并行获取子评论
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment: any) => {
          const replies = await (prisma as any).newsComment.findMany({
            where: { parentId: comment.id },
            orderBy: { createdAt: 'asc' },
            take: 5,
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true
                }
              }
            }
          })

          return {
            ...comment,
            replies
          }
        })
      )

      return {
        comments: commentsWithReplies,
        total,
        hasMore: (page * limit) < total
      }
    } catch (error) {
      console.error('获取评论错误:', error)
      throw error
    }
  }

  // 获取单个评论详情
  async getCommentById(id: string) {
    try {
      return await (prisma as any).newsComment.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      })
    } catch (error) {
      console.error('获取评论详情错误:', error)
      throw error
    }
  }

  // 创建评论
  async createComment(
    newsId: string, 
    authorId: string, 
    data: CreateCommentInput
  ) {
    try {
      const commentData: any = {
        content: data.content,
        author: { connect: { id: authorId } },
        news: { connect: { id: newsId } },
        images: data.images || null
      }

      // 如果是回复
      if (data.parentId) {
        commentData.parent = { connect: { id: data.parentId } }
        commentData.isReply = true
        
        // 增加父评论的回复数
        await (prisma as any).newsComment.update({
          where: { id: data.parentId },
          data: { replyCount: { increment: 1 } }
        })
      }

      const comment = await (prisma as any).newsComment.create({
        data: commentData,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      })

      return comment
    } catch (error) {
      console.error('创建评论错误:', error)
      throw error
    }
  }

  // 更新评论
  async updateComment(id: string, authorId: string, data: UpdateCommentInput) {
    try {
      // 检查是否是作者
      const comment = await (prisma as any).newsComment.findFirst({
        where: { id, authorId }
      })

      if (!comment) {
        throw new Error('评论不存在或没有权限')
      }

      return await (prisma as any).newsComment.update({
        where: { id },
        data: {
          content: data.content,
          images: data.images,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      })
    } catch (error) {
      console.error('更新评论错误:', error)
      throw error
    }
  }

  // 删除评论
  async deleteComment(id: string, authorId: string, isAdmin: boolean = false) {
    try {
      const comment = await (prisma as any).newsComment.findUnique({
        where: { id },
        include: { replies: true }
      })

      if (!comment) {
        throw new Error('评论不存在')
      }

      // 检查权限：作者或管理员
      if (comment.authorId !== authorId && !isAdmin) {
        throw new Error('没有删除权限')
      }

      // 如果有子评论，也一起删除
      if (comment.replies.length > 0) {
        await (prisma as any).newsComment.deleteMany({
          where: { parentId: id }
        })
      }

      // 如果是回复，减少父评论的回复数
      if (comment.parentId) {
        await (prisma as any).newsComment.update({
          where: { id: comment.parentId },
          data: { replyCount: { decrement: 1 } }
        })
      }

      return await (prisma as any).newsComment.delete({
        where: { id }
      })
    } catch (error) {
      console.error('删除评论错误:', error)
      throw error
    }
  }

  // 点赞评论
  async likeComment(commentId: string, authorId: string) {
    try {
      const existingLike = await (prisma as any).newsCommentLike.findUnique({
        where: {
          authorId_commentId: {
            authorId,
            commentId
          }
        }
      })

      if (existingLike) {
        // 取消点赞
        await (prisma as any).newsCommentLike.delete({
          where: { id: existingLike.id }
        })

        await (prisma as any).newsComment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } }
        })

        return { liked: false }
      } else {
        // 点赞
        await (prisma as any).newsCommentLike.create({
          data: {
            comment: { connect: { id: commentId } },
            author: { connect: { id: authorId } }
          }
        })

        await (prisma as any).newsComment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } }
        })

        return { liked: true }
      }
    } catch (error) {
      console.error('点赞评论错误:', error)
      throw error
    }
  }

  // 检查用户是否点赞
  async checkUserLike(commentId: string, authorId: string) {
    try {
      const like = await (prisma as any).newsCommentLike.findUnique({
        where: {
          authorId_commentId: {
            authorId,
            commentId
          }
        }
      })

      return { liked: !!like }
    } catch (error) {
      console.error('检查点赞状态错误:', error)
      throw error
    }
  }
}

export default new NewsCommentService()