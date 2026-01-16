// client/src/types/news.ts
// 必须要有这个定义

// 基础 API 响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: Pagination
}

// 分页信息接口
export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext?: boolean
  hasPrev?: boolean
}

// 新闻数据接口
export interface News {
  id: string
  title: string
  content: string
  summary?: string
  coverImage?: string
  source?: string
  viewCount: number
  isFeatured: boolean
  tags?: string  // 重要：根据你的 Prisma 模型，tags 是 String 类型，不是 string[]
  createdAt: string
  updatedAt: string
}

// 新闻列表响应接口
export interface NewsListResponse {
  news: News[]
  pagination: Pagination
}

// 热门新闻响应接口
export interface FeaturedNewsResponse {
  news: News[]  // 注意：根据你的路由，返回的是 news 字段
}

// 创建/更新新闻的请求体接口
export interface CreateNewsRequest {
  title: string
  content: string
  summary?: string
  coverImage?: string
  source?: string
  tags?: string  // 字符串类型，用逗号分隔
  isFeatured?: boolean
}

// 更新新闻的请求体接口
export interface UpdateNewsRequest {
  title?: string
  content?: string
  summary?: string
  coverImage?: string
  source?: string
  tags?: string
  isFeatured?: boolean
}