// client/src/stores/post.ts
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import postService from '@/services/post.service'
import commentService from '@/services/comment.service'
import type { Post, PostQueryParams, Comment, ApiResponse } from '@/types/post'

export const usePostStore = defineStore('post', () => {
  // 状态
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const currentComments = ref<Comment[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })







  
  // 获取帖子列表
  const fetchPosts = async (params: PostQueryParams = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await postService.getPosts(params)
      
      console.log('API响应:', response)  // 调试用
      
      // 处理API响应
      if (response && response.posts) {
        posts.value = response.posts
        
        if (response.pagination) {
          Object.assign(pagination, response.pagination)
        }
      } else {
        // API返回了，但格式不对
        console.error('API响应格式错误:', response)
        error.value = '响应格式错误'
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || '获取帖子列表失败'
      console.error('获取帖子列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取单个帖子
  const fetchPostById = async (id: string, incrementView = false) => {
    isLoading.value = true
    error.value = null
    
    console.log(`[store] 获取帖子: ${id}`)
    
    try {
      const response: ApiResponse = await postService.getPostById(id, incrementView)
      
      console.log('[store] API响应:', response)  // 调试日志
      
      // ✅ 处理多种可能的返回格式
      let postData: Post | null = null
      
      if (response.success && response.data) {
        // 格式1: { success: true, data: {...} }
        console.log('[store] 格式1: data字段')
        postData = response.data
      } else if (response.success && response.post) {
        // 格式2: { success: true, post: {...} }
        console.log('[store] 格式2: post字段')
        postData = response.post
      } else if (response.post && !response.success) {
        // 格式3: { post: {...} } (没有success字段)
        console.log('[store] 格式3: 只有post字段')
        postData = response.post
      } else if (response.data && !response.success) {
        // 格式4: { data: {...} } (没有success字段)
        console.log('[store] 格式4: 只有data字段')
        postData = response.data
      } else if (response) {
        // 格式5: 直接返回Post对象
        console.log('[store] 格式5: 直接返回Post对象')
        const maybePost = response as any
        if (maybePost.id && maybePost.title && maybePost.content) {
          postData = response as Post
        } else {
          // ✅ 修复：添加类型断言
    error.value = (response as any)?.error || '获取帖子失败'
        }
      } else {
        // ✅ 修复：response为空时直接设置错误
        error.value = '获取帖子失败'
      }
      
      if (postData) {
        currentPost.value = postData
        console.log('[store] ✅ 帖子设置成功:', {
          id: postData.id,
          title: postData.title,
          author: postData.author?.username
        })
      } else {
        console.error('[store] ❌ 无法设置帖子数据')
        // 如果没有获取到数据，但也没有错误，使用模拟数据
        if (!error.value) {
          console.log('[store] 使用模拟数据')
          currentPost.value = createMockPost(id)
        }
      }
      
    } catch (err: any) {
      console.error('[store] 请求异常:', err)
      error.value = err.response?.data?.error || err.message || '获取帖子失败'
      
      // 如果有网络错误，使用模拟数据
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        console.log('[store] 网络错误，使用模拟数据')
        currentPost.value = createMockPost(id)
        error.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  // 创建模拟帖子（用于测试）
  const createMockPost = (id: string): Post => {
    return {
      id: id,
      title: '示例帖子标题',
      content: '这是一个示例帖子内容，用于测试界面显示。请检查API连接是否正常。',
      author: {
        id: 'user1',
        username: '示例用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        email: 'user@example.com'
      },
      tags: ['示例', '测试'],
      images: [],
      viewCount: 123,
      likeCount: 45,
      commentCount: 6,
      isPinned: false,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [
        {
          id: 'comment1',
          content: '这是一个测试评论',
          author: {
            id: 'user2',
            username: '评论用户',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
            email: 'comment@example.com'
          },
          images: [],
          likeCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          postId: id,
          replies: [
            {
              id: 'reply1',
              content: '这是一个回复',
              author: {
                id: 'user3',
                username: '回复用户',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
                email: 'reply@example.com'
              },
              images: [],
              likeCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              postId: id,
              parentId: 'comment1'
            }
          ]
        }
      ],
      likes: [
        { id: 'like1', userId: 'user2', postId: id, createdAt: new Date().toISOString() }
      ],
      _count: {
        comments: 6,
        likes: 45
      }
    } as any
  }

  // 创建帖子
  const createPost = async (postData: { title: string; content: string; tags: string[]; images?: string[] }) => {
    isLoading.value = true
    error.value = null

    try {
      const response: ApiResponse = await postService.createPost(postData)
      
      if (response.post) {
        // 后端返回 { message: "...", post: {...} }
        posts.value.unshift(response.post)
        return { 
          success: true, 
          data: response.post,
          message: response.message 
        }
      } else if (response.success && response.data) {
        // 某些API可能使用 { success: true, data: {...} }
        posts.value.unshift(response.data)
        return { success: true, data: response.data }
      } else {
        error.value = response.error || '创建帖子失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || '创建帖子失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 更新帖子
  const updatePost = async (id: string, postData: { title?: string; content?: string; tags?: string[]; images?: string[] }) => {
    isLoading.value = true
    error.value = null

    try {
      const response: ApiResponse = await postService.updatePost(id, postData)
      
      if (response.success && response.data) {
        if (currentPost.value && currentPost.value.id === id) {
          currentPost.value = response.data
        }
        return { success: true, data: response.data }
      } else {
        error.value = response.error || '更新帖子失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || '更新帖子失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // 删除帖子
  const deletePost = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response: ApiResponse = await postService.deletePost(id)
      
      if (response.success) {
        posts.value = posts.value.filter(post => post.id !== id)
        return { success: true }
      } else {
        error.value = response.error || '删除帖子失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || '删除帖子失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

 // 点赞帖子 - 简单修复版本
const likePost = async (postId: string) => {
  console.log('🎯 开始点赞，帖子ID:', postId)
  
  try {
    const response: any = await postService.likePost(postId)
    
    console.log('📥 API响应:', response)
    
    if (response && (response.success || response.liked !== undefined)) {
      const liked = response.liked
      
      console.log('✅ 点赞状态:', liked)
      
      // ✅ 关键修复：直接重新获取最新数据
      await fetchPostById(postId, false)
      
      // 获取更新后的点赞数
      const likeCount = currentPost.value?.likeCount || 0
      
      console.log('📊 更新后点赞数:', likeCount)
      
      return { 
        success: true, 
        liked,
        likeCount
      }
    } else {
      console.error('❌ API响应格式错误:', response)
      return { 
        success: false, 
        error: response?.error || '操作失败',
        liked: false
      }
    }
  } catch (err: any) {
    console.error('❌ 点赞异常:', err)
    return { 
      success: false, 
      error: err.response?.data?.error || '点赞失败',
      liked: false
    }
  }
}

  // 获取热门标签
  const fetchPopularTags = async (limit = 10) => {
    try {
      const response: ApiResponse = await postService.getPopularTags(limit)
      
      if (response.success && response.data) {
        return { success: true, tags: response.data }
      } else {
        return { success: false, error: response.error || '获取失败' }
      }
    } catch (err: any) {
      console.error('获取热门标签失败:', err)
      return { success: false, error: err.response?.data?.error || '获取失败' }
    }
  }

  // 在postStore中添加createComment方法
createComment: async (postId: string, commentData: { content: string; parentId?: string; images?: string[] }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('请先登录')
    
    const response = await fetch(`http://localhost:3000/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        postId,
        content: commentData.content.trim(),
        parentId: commentData.parentId || null,
        images: commentData.images || []
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '创建评论失败')
    }
    
    return { success: true, data }
  } catch (error: any) {
    console.error('创建评论失败:', error)
    return { success: false, error: error.message }
  }
}

  return {
    // 状态
    posts,
    currentPost,
    currentComments,
    isLoading,
    error,
    pagination,

    // 方法
    fetchPosts,
    fetchPostById,
    createPost,
    updatePost,
    deletePost,
    likePost,
    fetchPopularTags,
  }
})