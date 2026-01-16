// server/src/services/like.service.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class LikeService {
  
  
  // 点赞帖子
  async likePost(postId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // 检查是否已点赞
      const existingLike = await tx.like.findFirst({
        where: {
          postId,
          authorId: userId,
        },
      })

      if (existingLike) {
        // 已点赞，执行取消点赞
        await tx.like.delete({
          where: { id: existingLike.id },
        })

        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        })

        return { liked: false }
      } else {
        // 未点赞，执行点赞
        await tx.like.create({
          data: {
            postId,
            authorId: userId,
          },
        })

        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        })

        return { liked: true }
      }
    })
  }

  // 点赞评论
 // server/src/services/comment.service.ts
// 找到likeComment方法，修改返回数据：

// 点赞评论
async likeComment(commentId: string, userId: string) {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        commentId,
        authorId: userId  // ✅ 这里应该是 authorId
      },
    })

    let liked: boolean
    let likeCount: number
    
    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ])
      
      // ✅ 获取更新后的点赞数
      const updatedComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likeCount: true }
      })
      
      liked = false
      likeCount = updatedComment?.likeCount || 0
      
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.like.create({
          data: {
            commentId,
            authorId: userId  // ✅ 这里应该是 authorId
          },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } },
        }),
      ])
      
      // ✅ 获取更新后的点赞数
      const updatedComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likeCount: true }
      })
      
      liked = true
      likeCount = updatedComment?.likeCount || 0
    }
    
    return { liked, likeCount }  // ✅ 返回likeCount
  } catch (error: any) {
    console.error('点赞评论失败:', error)
    throw error
  }
}

  // 检查用户是否点赞了帖子
  async checkPostLike(postId: string, userId: string) {
    const like = await prisma.like.findFirst({
      where: {
        postId,
        authorId: userId,
      },
    })

    return { liked: !!like }
  }

  // 检查用户是否点赞了评论
  async checkCommentLike(commentId: string, userId: string) {
    const like = await prisma.like.findFirst({
      where: {
        commentId,
        authorId: userId,
      },
    })

    return { liked: !!like }
  }

  // 获取用户的点赞记录
  async getUserLikes(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          post: {
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
          comment: {
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
          },
        },
      }),
      prisma.like.count({ where: { authorId: userId } }),
    ])

    return {
      likes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }
}

export default new LikeService()