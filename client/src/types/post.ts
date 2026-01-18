// client/src/types/post.ts
import type { User } from './user'

// 添加ApiResponse定义
export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string

   // 添加点赞相关的可选属性
  liked?: boolean
  likeCount?: number
  
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  post?: T    
  posts?: Post[]
  
}

export interface Post {
  id: string
  title: string
  content: string
  author: User
  tags: string[]
  images: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  comments?: any[]

  
  _count?: {
    comments: number
    likes: number
  }

}

export interface Comment {
  id: string
  content: string
  author: User
  images: string[]
  likeCount: number
  createdAt: string
  updatedAt: string
  postId: string
  parentId?: string
  userLiked?: boolean  // ✅ 添加用户点赞状态
  replies?: Comment[]
  _count?: {
    replies: number
    likes: number

  }
 // 添加可选的后端额外字段
  authorId?: string
  isDeleted?: boolean
  
  
  // 用于乐观更新的临时属性
  isTemp?: boolean

}

export interface PostQueryParams {
  page?: number
  limit?: number
  orderBy?: 'latest' | 'popular' | 'trending'
  tag?: string
  authorId?: string
  search?: string
}

// 添加创建评论的请求类型
export interface CreateCommentRequest {
  postId: string
  content: string
  parentId?: string
  images?: string[]
}

// 添加评论响应类型
export interface CommentResponse {
  success: boolean
  data?: {
    comment: Comment
  }
  error?: string
  message?: string
}

