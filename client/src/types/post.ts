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
  }
}

export interface PostQueryParams {
  page?: number
  limit?: number
  orderBy?: 'latest' | 'popular' | 'trending'
  tag?: string
  authorId?: string
  search?: string
}