<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 面包屑导航 -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-4">
        <li>
          <div>
            <router-link to="/" class="text-gray-400 hover:text-gray-500">
              <i class="el-icon-house"></i>
            </router-link>
          </div>
        </li>
        <li>
          <div class="flex items-center">
            <i class="el-icon-arrow-right text-gray-400"></i>
            <router-link to="/news" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
              新闻资讯
            </router-link>
          </div>
        </li>
        <li>
          <div class="flex items-center">
            <i class="el-icon-arrow-right text-gray-400"></i>
            <span class="ml-4 text-sm font-medium text-gray-500 truncate" aria-current="page">
              {{ newsStore.currentNews?.title || '加载中...' }}
            </span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- 加载状态 -->
    <div v-if="newsStore.isLoading && !newsStore.currentNews" class="text-center py-12">
      <i class="el-icon-loading text-4xl text-primary-600"></i>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="newsStore.error" class="text-center py-12">
      <i class="el-icon-warning text-4xl text-red-600"></i>
      <p class="mt-2 text-red-600">{{ newsStore.error }}</p>
      <button @click="loadNews" class="btn-secondary mt-4">
        重试
      </button>
    </div>

    <!-- 新闻内容 -->
    <div v-else-if="newsStore.currentNews" class="space-y-8">
      <!-- 新闻头部 -->
      <div>
        <!-- 标签 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tag in newsStore.currentNews.tags"
            :key="tag"
            class="badge badge-secondary"
          >
            {{ tag }}
          </span>
          <span v-if="newsStore.currentNews.isFeatured" class="badge badge-primary">
            热门
          </span>
        </div>

        <!-- 标题 -->
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ newsStore.currentNews.title }}
        </h1>

        <!-- 元信息 -->
        <div class="flex items-center justify-between text-gray-500 mb-6">
          <div class="flex items-center space-x-4">
            <span>{{ formatTime(newsStore.currentNews.createdAt) }}</span>
            <span>·</span>
            <span>{{ newsStore.currentNews.viewCount }} 次浏览</span>
            <span v-if="newsStore.currentNews.source">· 来源：{{ newsStore.currentNews.source }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <!-- 分享按钮 -->
            <button
              @click="shareNews"
              class="flex items-center space-x-1 text-gray-500 hover:text-primary-600"
            >
              <i class="el-icon-share"></i>
              <span>分享</span>
            </button>
            
            <!-- 打印按钮 -->
            <button
              @click="printNews"
              class="flex items-center space-x-1 text-gray-500 hover:text-primary-600"
            >
              <i class="el-icon-printer"></i>
              <span>打印</span>
            </button>
          </div>
        </div>

        <!-- 封面图 -->
        <div v-if="newsStore.currentNews.coverImage" class="mb-8">
          <img
            :src="newsStore.currentNews.coverImage"
            :alt="newsStore.currentNews.title"
            class="w-full h-auto max-h-[400px] object-cover rounded-xl shadow-lg"
          />
          <p v-if="newsStore.currentNews.summary" class="text-center text-gray-500 italic mt-2">
            {{ newsStore.currentNews.summary }}
          </p>
        </div>

        <!-- 摘要 -->
        <div v-if="newsStore.currentNews.summary && !newsStore.currentNews.coverImage" 
             class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="el-icon-info text-blue-400"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                {{ newsStore.currentNews.summary }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 新闻内容 -->
      <div class="prose prose-lg max-w-none">
        <div v-html="compiledContent"></div>
      </div>

      <!-- 相关新闻 -->
      <div v-if="relatedNews.length > 0" class="mt-12">
        <h3 class="text-2xl font-semibold text-gray-900 mb-6">相关新闻</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="news in relatedNews"
            :key="news.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="goToRelatedNews(news.id)" 
          >
            <h4 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ news.title }}
            </h4>
            <p v-if="news.summary" class="text-gray-600 text-sm line-clamp-2">
              {{ news.summary }}
            </p>
            <div class="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{{ formatTime(news.createdAt) }}</span>
              <span>{{ news.viewCount }} 次浏览</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="card mt-12">
        <h3 class="text-2xl font-semibold text-gray-900 mb-6">评论</h3>
        
        <!-- 评论统计 -->
        <div class="flex items-center space-x-6 mb-6 text-gray-500">
          <span>共 {{ commentCount }} 条评论</span>
          <button
            @click="sortBy = sortBy === 'latest' ? 'popular' : 'latest'"
            class="hover:text-primary-600"
          >
            {{ sortBy === 'latest' ? '按热度排序' : '按时间排序' }}
          </button>
        </div>

        <!-- 发表评论 -->
        <div v-if="authStore.isAuthenticated" class="mb-8">
          <div class="flex items-start space-x-4">
            <img
              :src="authStore.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authStore.user?.username"
              :alt="authStore.user?.username"
              class="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div class="flex-1">
              <textarea
                v-model="newComment"
                rows="3"
                class="input-field w-full"
                placeholder="写下你的评论..."
                :class="{ 'border-red-300': commentError }"
              ></textarea>
              <p v-if="commentError" class="mt-1 text-sm text-red-600">
                {{ commentError }}
              </p>
              <div class="flex justify-between items-center mt-2">
                <div class="text-sm text-gray-500">
                  {{ newComment.length }}/1000
                </div>
                <button
                  @click="submitComment"
                  :disabled="!newComment.trim() || isSubmittingComment"
                  class="btn-primary"
                >
                  <span v-if="isSubmittingComment">
                    <i class="el-icon-loading mr-2"></i>
                    提交中...
                  </span>
                  <span v-else>发表评论</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 登录提示 -->
        <div v-else class="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p class="text-gray-600">登录后即可发表评论</p>
          <div class="mt-2">
            <router-link to="/login" class="text-primary-600 hover:text-primary-800 font-medium">
              立即登录
            </router-link>
            <span class="text-gray-500 mx-2">或</span>
            <router-link to="/register" class="text-primary-600 hover:text-primary-800 font-medium">
              注册账号
            </router-link>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length === 0" class="text-center py-8 text-gray-500">
          还没有评论，快来发表第一条评论吧！
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="border-b border-gray-100 pb-6 last:border-0"
          >
            <div class="flex space-x-4">
              <img
                :src="comment.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.author.username"
                :alt="comment.author.username"
                class="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <span class="font-medium text-gray-900">
                      {{ comment.author.username }}
                    </span>
                    <span class="text-sm text-gray-500 ml-2">
                      {{ formatTime(comment.createdAt) }}
                    </span>
                  </div>
                  <button
  @click="likeComment(comment.id)"
  :disabled="isLikingComment(comment.id)"
  class="flex items-center space-x-1 text-sm transition-all duration-200 hover:scale-110"
  :class="[
    isCommentLiked(comment.id) 
      ? 'text-red-500 hover:text-red-600' 
      : 'text-gray-500 hover:text-gray-700'
  ]"
  :title="isCommentLiked(comment.id) ? '取消点赞' : '点赞'"
>
  <span v-if="isCommentLiked(comment.id)" class="text-lg">❤️</span>
<span v-else class="text-lg opacity-70">🤍</span>
  
  <span>{{ comment.likeCount || 0 }}</span>
</button>
                </div>
                <p class="text-gray-700">
                  {{ comment.content }}
                </p>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div v-if="hasMoreComments" class="text-center">
            <button
              @click="loadMoreComments"
              :disabled="isLoadingMoreComments"
              class="btn-secondary"
            >
              <span v-if="isLoadingMoreComments">
                <i class="el-icon-loading mr-2"></i>
                加载中...
              </span>
              <span v-else>加载更多评论</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNewsStore } from '@/stores/news'
import { useAuthStore } from '@/stores/auth'
import newsService from '@/services/news.service'
import newsCommentService from '@/services/newsComment.service'

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()
const authStore = useAuthStore()

// 状态
const newComment = ref('')
const commentError = ref('')
const isSubmittingComment = ref(false)
const isLoadingMoreComments = ref(false)
const sortBy = ref<'latest' | 'popular'>('latest')
const comments = ref<any[]>([])
const relatedNews = ref<any[]>([])
const commentPage = ref(1)
const commentLimit = 20
const commentCount = ref(0)
// 添加一个ref来检查是否正在获取
const isFetching = ref(false)
const notFound = ref(false)



// 修改组件状态

const isLoadingComments = ref(false)

// 修改：获取新闻ID，并添加验证
const newsId = computed(() => {
  const id = route.params.id as string
  console.log('🔍 路由参数 id:', id)
  return id
})

// 修改：检查ID是否有效
const isValidNewsId = (id: string) => {
  // 新闻ID应该是类似 "cmkmqdnic0000xgd9sjdo67h6" 这样的格式
  if (!id || id === 'news' || id.includes('/')) {
    return false
  }
  return true
}





// 编译Markdown内容
const compiledContent = computed(() => {
  if (!newsStore.currentNews?.content) return ''
  return DOMPurify.sanitize(marked.parse(newsStore.currentNews.content) as string)
})

const hasMoreComments = ref(false)

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), { 
    addSuffix: true,
    locale: zhCN 
  })
}

// 修改：增强 loadNews 函数
// 修改 loadNews 函数
const loadNews = async () => {
  const id = newsId.value
  console.log('🔄 开始加载新闻，ID:', id)
  
  // 验证ID
  if (!isValidNewsId(id)) {
    console.error('❌ 无效的新闻ID:', id)
    notFound.value = true
    
    // 🔥 修复：使用 newsStore.error
    newsStore.error = '无效的新闻链接'  // ✅ 改为这样
    
    // 如果是无效ID，跳转到新闻列表
    setTimeout(() => {
      router.push('/news')
    }, 2000)
    return
  }
  
  if (isFetching.value) {
    console.log('⏳ 正在获取中，跳过')
    return
  }
  
  isFetching.value = true
  notFound.value = false
  
  // 🔥 修复：清空错误
  newsStore.error = null  // ✅ 改为这样
  
  try {
    console.log('📡 调用 newsStore.fetchNewsById，ID:', id)
    await newsStore.fetchNewsById(id, true)
    
    console.log('🔍 加载完成，store状态:', {
      hasCurrentNews: !!newsStore.currentNews,
      currentNewsId: newsStore.currentNews?.id,
      isLoading: newsStore.isLoading,
      error: newsStore.error
    })
    
    if (newsStore.error) {
      console.error('❌ store返回错误:', newsStore.error)
      notFound.value = true
      // 🔥 错误信息已经在 newsStore.error 中
      
      // 如果是"新闻不存在"，3秒后跳转
      // 方案5：类型断言
if ((newsStore.error as string)?.includes('不存在')) {  // ✅ 类型断言
  setTimeout(() => {
    router.push('/news')
  }, 3000)
}
      return
    }
    
    if (!newsStore.currentNews) {
      console.error('❌ store.currentNews为空!')
      notFound.value = true
      newsStore.error = '新闻不存在或加载失败'  // ✅ 改为这样
      
      // 3秒后自动跳转到新闻列表
      setTimeout(() => {
        router.push('/news')
      }, 3000)
      return
    }
    
    console.log('✅ 新闻加载成功:', {
      id: newsStore.currentNews.id,
      title: newsStore.currentNews.title
    })
    
    // 加载评论和相关新闻
    await Promise.all([
      loadComments(),
      loadRelatedNews()
    ])
    
  } catch (err) {
    console.error('❌ 加载新闻失败:', err)
    notFound.value = true
    newsStore.error = '加载新闻失败'  // ✅ 改为这样
  } finally {
    isFetching.value = false
  }
}


// 修改 loadComments 函数
// 修改这部分代码
const loadComments = async () => {
  try {
    console.log('📡 加载评论，newsId:', newsId.value)
    
    if (!newsId.value || newsId.value === 'undefined') {
      console.error('❌ 无效的新闻ID')
      return
    }
    
    // 🔥 修复：确保只有一个变量控制加载状态
    isLoadingComments.value = true
    
    // 🔥 修复：传递正确的参数格式
    const response = await newsCommentService.getNewsComments(
      newsId.value,  // 第一个参数：newsId
      {              // 第二个参数：配置对象
        page: commentPage.value,
        limit: commentLimit,
        sortBy: sortBy.value
      }
    )
    
    console.log('✅ 评论API响应:', response)
    
    if (response.success) {
      // 🔥 修复：创建新的数组而不是修改原数组
      const responseData = response.data || []
      
      if (commentPage.value === 1) {
        comments.value = [...responseData]
      } else {
        comments.value = [...comments.value, ...responseData]
      }
      
      // 🔥 修复：直接赋值，不要尝试修改 .value 属性
      commentCount.value = response.total || 0
      hasMoreComments.value = response.hasMore || false
      
      console.log('✅ 评论加载成功，数量:', comments.value.length)
    } else {
      console.error('❌ 加载评论失败:', response.error)
      // 如果API失败，使用模拟数据
      const mockComments = getMockComments()
      comments.value = [...mockComments]  // 🔥 使用展开运算符创建新数组
      commentCount.value = mockComments.length
      hasMoreComments.value = false
    }
  } catch (error) {
    console.error('❌ 加载评论出错:', error)
    // 如果API调用失败，使用模拟数据
    const mockComments = getMockComments()
    comments.value = [...mockComments]  // 🔥 使用展开运算符创建新数组
    commentCount.value = mockComments.length
    hasMoreComments.value = false
  } finally {
    isLoadingComments.value = false
  }
}


// 模拟评论数据（备用）
const getMockComments = () => {
  return [
    {
      id: '1',
      content: '这个新闻很有价值！',
      author: { 
        id: 'user1',
        username: '玩家1', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1' 
      },
      likeCount: 5,
      replyCount: 0,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      content: '期待游戏更新！',
      author: { 
        id: 'user2',
        username: '玩家2', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2' 
      },
      likeCount: 3,
      replyCount: 1,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]
}

// 添加状态变量
const isLikingComment = (commentId: string) => {
  return false // 你可以根据实际需求实现防重逻辑
}

// 添加点赞状态管理
const likedComments = ref<Set<string>>(new Set())

// 检查评论是否被点赞
const isCommentLiked = (commentId: string) => {
  return likedComments.value.has(commentId)
}




// 修改 loadMoreComments 函数
const loadMoreComments = async () => {
  if (isLoadingMoreComments.value || !hasMoreComments.value) return
  
  isLoadingMoreComments.value = true
  commentPage.value++
  
  try {
    await loadComments()
  } finally {
    isLoadingMoreComments.value = false
  }
}

// 修改 loadRelatedNews 函数
const loadRelatedNews = async () => {
  try {
    console.log('📡 获取相关新闻，当前新闻ID:', newsId.value)
    const response = await newsService.getRelatedNews(newsId.value, 2)
    
    if (response.success && response.data) {
      relatedNews.value = response.data
      console.log('✅ 获取相关新闻成功:', relatedNews.value.length, '条')
    } else {
      console.warn('⚠️ 获取相关新闻失败，使用默认数据')
      // 如果API失败，使用默认数据
      getDefaultRelatedNews()
    }
  } catch (error) {
    console.error('❌ 获取相关新闻失败:', error)
    getDefaultRelatedNews()
  }
}

// 默认的相关新闻数据
const getDefaultRelatedNews = () => {
  // 从store中获取其他新闻，排除当前新闻
  const allNews = newsStore.news || []
  const otherNews = allNews
    .filter(news => news.id !== newsId.value)
    .slice(0, 2)
    .map(news => ({
      id: news.id,
      title: news.title,
      summary: news.summary || '暂无摘要',
      createdAt: news.createdAt || new Date().toISOString(),
      viewCount: news.viewCount || 0
    }))
  
  // 如果还没有新闻，使用数据库中的ID
  if (otherNews.length === 0) {
    relatedNews.value = [
      {
        id: 'cmkmqdnic0000xgd9sjdo67h6',
        title: '这是标题',
        summary: '这是摘要',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        viewCount: 1000,
      },
      {
        id: 'cmkgzm8j0001in3hmghv4izg',
        title: '符号是佛啊是发哦勁电话好',
        summary: '发蒂法蒂法蒂法的撒发的发',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        viewCount: 2000,
      },
    ]
  } else {
    relatedNews.value = otherNews
  }
}

// 修改 submitComment 函数
const submitComment = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  const content = newComment.value.trim()
  if (!content) {
    commentError.value = '评论内容不能为空'
    return
  }
  
  if (content.length > 1000) {
    commentError.value = '评论内容不能超过1000字'
    return
  }
  
  isSubmittingComment.value = true
  commentError.value = ''
  
  try {
    const response = await newsCommentService.createComment(newsId.value, {
      content,
      parentId: undefined // 这里可以扩展回复功能
    })
    
    if (response.success) {
      // 将新评论添加到列表顶部
      comments.value.unshift(response.data)
      commentCount.value++
      newComment.value = ''
      
      // 显示成功提示
      alert('评论发布成功！')
    } else {
      commentError.value = response.error || '评论发布失败'
    }
  } catch (error: any) {
    console.error('发表评论失败:', error)
    commentError.value = typeof error === 'string' ? error : '评论发布失败'
  } finally {
    isSubmittingComment.value = false
  }
}

// 修改 likeComment 函数
// 修改 likeComment 函数，添加乐观更新
const likeComment = async (commentId: string) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  const comment = comments.value.find(c => c.id === commentId)
  if (!comment) return
  
  // 保存原始状态用于回滚
  const originalLikeCount = comment.likeCount || 0
  const originalIsLiked = likedComments.value.has(commentId)
  
  // 乐观更新UI
  if (originalIsLiked) {
    likedComments.value.delete(commentId)
    comment.likeCount = Math.max(0, originalLikeCount - 1)
  } else {
    likedComments.value.add(commentId)
    comment.likeCount = originalLikeCount + 1
  }
  
  try {
    const response = await newsCommentService.toggleLike(commentId)
    
    if (response.success) {
      // 使用API返回的实际数据
      if (response.data?.liked !== undefined) {
        if (response.data.liked) {
          likedComments.value.add(commentId)
        } else {
          likedComments.value.delete(commentId)
        }
      }
      if (response.data?.likeCount !== undefined) {
        comment.likeCount = response.data.likeCount
      }
    } else {
      // API调用失败，回滚状态
      if (originalIsLiked) {
        likedComments.value.add(commentId)
        comment.likeCount = originalLikeCount
      } else {
        likedComments.value.delete(commentId)
        comment.likeCount = originalLikeCount
      }
      console.error('点赞失败:', response.error)
    }
  } catch (error) {
    console.error('点赞异常:', error)
    // 异常时也回滚
    if (originalIsLiked) {
      likedComments.value.add(commentId)
      comment.likeCount = originalLikeCount
    } else {
      likedComments.value.delete(commentId)
      comment.likeCount = originalLikeCount
    }
  }
}

// 分享新闻
const shareNews = () => {
  const url = window.location.href
  const text = newsStore.currentNews?.title || '游戏社区新闻'
  
  if (navigator.share) {
    navigator.share({
      title: text,
      text: text,
      url: url,
    })
  } else {
    navigator.clipboard.writeText(url)
      .then(() => alert('链接已复制到剪贴板'))
      .catch(() => prompt('复制链接分享:', url))
  }
}

// 打印新闻
const printNews = () => {
  window.print()
}

// 在script中修改goToNews函数
// 修改跳转到新闻详情的方法
const goToRelatedNews = async (newsId: string) => {
  console.log('🔍 点击相关新闻，ID:', newsId)
  
  // 验证ID是否有效
  if (!newsId || newsId === 'undefined' || newsId === 'news') {
    console.error('❌ 无效的新闻ID:', newsId)
    return
  }
  
  // 先重置当前新闻状态
  newsStore.currentNews = null
  comments.value = []
  relatedNews.value = []
  
  // 然后跳转
  router.push(`/news/${newsId}`)
  
  // 强制刷新（如果需要）
  setTimeout(() => {
    window.location.reload()
  }, 100)
}




onMounted(async() => {
  console.log('🔍 NewsDetailView mounted - 详细调试')
  console.log('📍 完整路由信息:', {
    fullPath: route.fullPath,
    path: route.path,
    params: route.params,
    query: route.query,
    name: route.name
  })
  
  console.log('📄 从URL路径解析新闻ID:')
  const pathParts = window.location.pathname.split('/')
  console.log('URL路径片段:', pathParts)
  console.log('最后一个片段:', pathParts[pathParts.length - 1])
  
  // 检查是否是有效ID
  const idFromPath = pathParts[pathParts.length - 1]
  console.log('🎯 从路径获取的ID:', idFromPath)
  console.log('ID是否有效:', idFromPath && idFromPath !== 'news' && idFromPath !== 'undefined')
  
  // 如果你的路由是嵌套的，可能要从params.id获取
  console.log('🎯 从路由参数获取的ID:', route.params.id)
  console.log('route.params 结构:', JSON.stringify(route.params, null, 2))
  
  // 如果是 undefined，手动从 URL 解析
  if (!route.params.id || route.params.id === 'news' || route.params.id === 'undefined') {
    console.warn('⚠️ 路由参数ID无效，尝试从URL解析')
    const urlPath = window.location.pathname
    const match = urlPath.match(/\/news\/([^/?#]+)/)
    if (match && match[1]) {
      console.log('✅ 从URL解析到ID:', match[1])
      // 重定向到正确的URL
      if (match[1] !== 'news') {
        router.replace(`/news/${match[1]}`)
        return
      }
    }
  }


   console.log('🔍 NewsDetailView mounted - 详细调试')
  console.log('🎯 当前新闻ID:', newsId.value)
  console.log('📁 store中新闻数量:', newsStore.news?.length)
  
  // 🔥 关键：确保在加载新闻详情前，先获取新闻列表
  if (!newsStore.news || newsStore.news.length === 0) {
    console.log('📋 store中没有新闻列表，先加载...')
    try {
      await newsStore.fetchNews()  // 确保获取新闻列表
      console.log('✅ 新闻列表加载完成，数量:', newsStore.news?.length)
    } catch (err) {
      console.error('❌ 加载新闻列表失败:', err)
    }
  }
  
  loadNews()
   // 加载评论
  if (newsStore.currentNews) {
    await loadComments()
  }
})

// 清理
onUnmounted(() => {
  isFetching.value = false
  notFound.value = false
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 3;  /* 添加这行 */
  -webkit-box-orient: vertical;
  box-orient: vertical; /* 添加这行 */
  overflow: hidden;
}

/* 打印样式 */
@media print {
  nav, 
  button,
  .prose + div,
  .card:last-child {
    display: none !important;
  }
  
  .prose {
    max-width: 100% !important;
    font-size: 12pt !important;
  }
}
</style>