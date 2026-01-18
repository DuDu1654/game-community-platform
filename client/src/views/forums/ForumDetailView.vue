<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 加载状态 -->
    <div v-if="postStore.isLoading && !postStore.currentPost" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="postStore.error" class="text-center py-12">
      <div class="inline-block p-3 bg-red-100 rounded-full mb-4">
        <span class="text-red-600 text-2xl">⚠️</span>
      </div>
      <p class="mt-2 text-red-600">{{ postStore.error }}</p>
      <button @click="loadPost" class="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
        重试
      </button>
    </div>

    <!-- 帖子内容 -->
    <div v-else-if="postStore.currentPost" class="space-y-8">
      <!-- 帖子头部 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <!-- 标签 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tag in postStore.currentPost.tags || []"
            :key="tag"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
          >
            {{ tag }}
          </span>
          <span v-if="postStore.currentPost.isPinned" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            置顶
          </span>
        </div>

        <!-- 标题 -->
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{ postStore.currentPost.title }}
        </h1>

        <!-- 作者信息和操作 -->
        <div class="flex items-center justify-between border-t border-b border-gray-200 py-4">
          <div class="flex items-center space-x-4">
            <router-link
              :to="`/profile/${postStore.currentPost.author?.id}`"
              class="flex items-center space-x-3"
            >
              <img
                :src="postStore.currentPost.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (postStore.currentPost.author?.username || 'user')"
                :alt="postStore.currentPost.author?.username"
                class="w-10 h-10 rounded-full border-2 border-blue-500"
              />
              <div>
                <div class="font-medium text-gray-900">
                  {{ postStore.currentPost.author?.username || '匿名用户' }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatTime(postStore.currentPost.createdAt) }}
                </div>
              </div>
            </router-link>
          </div>

          <div class="flex items-center space-x-4">
            <!-- 浏览量 -->
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {{ formatViewCount(postStore.currentPost.viewCount) }}
              </div>
              <div class="text-sm text-gray-500">浏览</div>
            </div>

            <!-- 点赞按钮 -->
            <button
              @click="handleLike"
              :disabled="isLiking"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              :class="[
                isLiked 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <span v-if="isLiked">❤️</span>
              <span v-else>🤍</span>
              <span>{{ postStore.currentPost.likeCount || 0 }}</span>
            </button>

            <!-- 更多操作菜单 -->
            <div class="relative">
              <button
                @click="showMoreActions = !showMoreActions"
                class="p-2 hover:bg-gray-100 rounded-lg"
                data-menu-button 
              >
                ⋮
              </button>
              <div
                v-if="showMoreActions"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                data-menu
                @click.stop
              >
                <button
                  @click="handleShare"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  📤 分享
                </button>
                <button
                  @click="handleReport"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ⚠️ 举报
                </button>
                <div v-if="isAuthor || isAdmin" class="border-t border-gray-100 my-1"></div>
                <button
                  v-if="isAuthor"
                  @click="handleEdit"
                  class="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                >
                  ✏️ 编辑
                </button>
                <button
                  v-if="isAuthor || isAdmin"
                  @click="handleDelete"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="prose max-w-none mt-6">
          {{ postStore.currentPost.content }}
        </div>

        <!-- 图片展示 -->
        <div v-if="postStore.currentPost.images?.length" class="mt-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="(image, index) in postStore.currentPost.images || []"
              :key="index"
              class="relative"
            >
              <img
                :src="image"
                :alt="`图片 ${index + 1}`"
                class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                @click="openImageGallery(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-xl font-semibold mb-6">
          评论 ({{ postStore.currentPost.commentCount || 0 }})
        </h3>

        <!-- 发表评论 -->
        <div class="mb-8">
          <div class="flex items-start space-x-4">
            <img
              :src="authStore.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (authStore.user?.username || 'user')"
              :alt="authStore.user?.username"
              class="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div class="flex-1">
              <textarea
                v-model="newComment"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  @click="handleSubmitComment"  
  :disabled="isSubmittingComment"  
  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
>
                  <span v-if="isSubmittingComment">
                    提交中...
                  </span>
                  <span v-else>发表评论</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="postStore.currentComments.length === 0" class="text-center py-8 text-gray-500">
          还没有评论，快来发表第一条评论吧！
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="comment in postStore.currentComments"
            :key="comment.id"
            class="border-b border-gray-100 pb-6 last:border-0"
          >
            <!-- 评论 -->
            <div class="flex space-x-4">
              <!-- 作者头像 -->
              <router-link
                :to="`/profile/${comment.author?.id || ''}`"
                class="flex-shrink-0"
              >
                <img
                  :src="comment.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (comment.author?.username || 'user')"
                  :alt="comment.author?.username"
                  class="w-8 h-8 rounded-full"
                />
              </router-link>

              <!-- 评论内容 -->
              <div class="flex-1">
                <!-- 评论头部 -->
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <router-link
                      :to="`/profile/${comment.author?.id || ''}`"
                      class="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {{ comment.author?.username || '匿名用户' }}
                    </router-link>
                    <span class="text-sm text-gray-500 ml-2">
                      {{ formatTime(comment.createdAt) }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <!-- 点赞 -->
                    <button
                      @click="likeComment(comment.id)"
                      :disabled="isLikingComment"
                      class="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                    >
                      <span v-if="isCommentLiked(comment.id)">❤️</span>
                      <span v-else>🤍</span>
                      <span>{{ comment.likeCount || 0 }}</span>
                    </button>

                    <!-- 回复 -->
                    <button
                      @click="toggleReply(comment.id)"
                      class="text-sm text-gray-500 hover:text-blue-600"
                    >
                      回复
                    </button>

                    <!-- 更多操作 -->
                    <div class="relative">
                      <button
                        @click="toggleCommentActions(comment.id)"
                        class="p-1 hover:bg-gray-100 rounded"
                        data-menu-button
                      >
                        ⋮
                      </button>
                      <div
                        v-if="activeCommentActions === comment.id"
                        class="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                        data-menu
                        @click.stop
                      >
                        <button
                          v-if="isCommentAuthor(comment.author?.id) || isAdmin"
                          @click="editComment(comment)"
                          class="block w-full text-left px-3 py-1 text-sm text-blue-600 hover:bg-gray-100"
                        >
                          ✏️ 编辑
                        </button>
                        <button
                          v-if="isCommentAuthor(comment.author?.id) || isAdmin"
                          @click="deleteComment(comment.id)"
                          class="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
                        >
                          🗑️ 删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 评论内容 -->
                <p class="text-gray-700 mb-3">
                  {{ comment.content }}
                </p>

                <!-- 回复表单 -->
                <div v-if="showReplyTo === comment.id" class="mt-4">
                  <textarea
                    v-model="replyContent"
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    placeholder="写下你的回复..."
                  ></textarea>
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="cancelReply"
                      class="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      @click="submitReply(comment.id)"
                      :disabled="!replyContent.trim()"
                      class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      回复
                    </button>
                  </div>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies?.length" class="mt-4 pl-4 border-l-2 border-gray-200">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="py-3"
                  >
                    <div class="flex items-start space-x-3">
                      <router-link
                        :to="`/profile/${reply.author?.id || ''}`"
                        class="flex-shrink-0"
                      >
                        <img
                          :src="reply.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (reply.author?.username || 'user')"
                          :alt="reply.author?.username"
                          class="w-6 h-6 rounded-full"
                        />
                      </router-link>
                      <div class="flex-1">
                        <div class="flex items-center space-x-2">
                          <router-link
                            :to="`/profile/${reply.author?.id || ''}`"
                            class="text-sm font-medium text-gray-900"
                          >
                            {{ reply.author?.username || '匿名用户' }}
                          </router-link>
                          <span class="text-xs text-gray-500">
                            {{ formatTime(reply.createdAt) }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-700 mt-1">
                          {{ reply.content }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 查看更多回复 -->
                  <div
                    v-if="comment._count?.replies && comment._count.replies > (comment.replies?.length || 0)"
                    class="mt-2"
                  >
                    <button
                      @click="loadMoreReplies(comment.id)"
                      class="text-sm text-blue-600 hover:text-blue-800"
                    >
                      查看全部 {{ comment._count?.replies || 0 }} 条回复
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 没有帖子的状态 -->
    <div v-else class="text-center py-12">
      <div class="inline-block p-3 bg-gray-100 rounded-full mb-4">
        <span class="text-gray-600 text-2xl">📄</span>
      </div>
      <p class="mt-2 text-gray-600">帖子不存在或已被删除</p>
      <router-link to="/forums" class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        返回帖子列表
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'  // ✅ 使用真正的store
import { useAuthStore } from '@/stores/auth'  // ✅ 使用真正的auth store
import { useCommentStore } from '@/stores/comment'







type Comment = any // 简化Comment类型






//评论点赞
const commentStore = useCommentStore()

// ✅ 正确定义router
const route = useRoute()
const router = useRouter()

// ✅ 使用真正的store
const postStore = usePostStore()
const authStore = useAuthStore()

// 状态
const newComment = ref('')
const replyContent = ref('')
const showReplyTo = ref<string | null>(null)
const activeCommentActions = ref<string | null>(null)
const showMoreActions = ref(false)
const isLiking = ref(false)
const isLikingComment = ref(false)
const isSubmittingComment = ref(false)
const isLoadingMoreComments = ref(false)
const commentError = ref('')
const likedComments = ref<Set<string>>(new Set())
const commentPage = ref(1)
const commentLimit = 20
const isLiked = ref(false)

// 获取帖子ID
const postId = computed(() => route.params.id as string)

// 检查是否是作者
const isAuthor = computed(() => {
  if (!postStore.currentPost || !authStore.user) return false
  return postStore.currentPost.author?.id === authStore.user.id
})

// 检查是否是管理员
const isAdmin = computed(() => {
  return authStore.user?.role === 'ADMIN'
})

// 检查是否还有更多评论
const hasMoreComments = computed(() => {
  if (!postStore.currentPost) return false
  const totalComments = postStore.currentPost.commentCount || 0
  const loadedComments = postStore.currentComments.length
  return totalComments > loadedComments
})

// 格式化浏览量
const formatViewCount = (viewCount: string | number | undefined) => {
  if (!viewCount) return '0'
  
  const count = typeof viewCount === 'string' ? parseInt(viewCount, 10) : viewCount
  if (isNaN(count)) return '0'
  
  return count.toLocaleString()
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '刚刚'
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}

// 检查评论是否被点赞
const isCommentLiked = (commentId: string) => {
  return likedComments.value.has(commentId)
}

// 检查是否是评论作者
const isCommentAuthor = (authorId?: string) => {
  if (!authorId) return false
  return authStore.user?.id === authorId
}

/// ✅ 加载帖子
const loadPost = async () => {
  if (!postId.value) {
    console.error('没有帖子ID')
    return
  }
  
  try {
    console.log('开始加载帖子:', postId.value)
    
    // 清空当前帖子
    postStore.currentPost = null
    postStore.currentComments = []
    
    // 调用store的方法获取帖子
    await postStore.fetchPostById(postId.value, true)  // true表示增加浏览量
    
    // 检查结果
    console.log('帖子加载结果:', {
      hasPost: !!postStore.currentPost,
      post: postStore.currentPost,
      error: postStore.error
    })
    
    if (postStore.currentPost) {
      console.log('✅ 帖子加载成功，标题:', (postStore.currentPost as any).title)
      
      // 如果有评论数据，设置到currentComments
      if ((postStore.currentPost as any)?.comments) {
        const comments = (postStore.currentPost as any).comments
        console.log('📊 原始评论数据:', comments)
        
        // 关键：构建评论树
        const commentTree = buildCommentTree(comments)
        postStore.currentComments = commentTree
        console.log('🌳 构建的评论树:', commentTree)
      }
      
      // 检查点赞状态
      if (authStore.user && (postStore.currentPost as any)?.likes) {
        const userLike = (postStore.currentPost as any).likes.find(
          (like: any) => like.userId === authStore.user?.id
        )
        isLiked.value = !!userLike
      }
    } else {
      console.error('❌ 帖子加载失败，currentPost为空')
      if (postStore.error) {
        console.error('错误信息:', postStore.error)
      }
    }
  } catch (error) {
    console.error('加载帖子异常:', error)
  }
}



// 构建评论树结构的函数
const buildCommentTree = (comments: any[] = []): any[] => {
  if (!comments || !Array.isArray(comments)) {
    console.warn('评论数据为空或不是数组')
    return []
  }
  
  console.log('🌳 开始构建评论树，评论数量:', comments.length)
  console.log('🌳 原始评论数据示例:', comments.slice(0, 3))
  
  const commentMap = new Map()
  const rootComments: any[] = []
  
  // 1. 创建映射
  comments.forEach((comment) => {
    // 确保每个评论都有replies数组
    if (!comment.replies) {
      comment.replies = []
    }
    
    // 确保有_count对象
    if (!comment._count) {
      comment._count = { replies: 0, likes: 0 }
    }
    
    // 设置初始的回复计数
    comment._count.replies = comment.replies?.length || 0
    
    commentMap.set(comment.id, comment)
    
    console.log('🔹 处理评论:', {
      id: comment.id,
      parentId: comment.parentId,
      isReply: comment.isReply,
      content: comment.content?.substring(0, 30) + '...'
    })
  })
  
  // 2. 构建树结构
  comments.forEach((comment) => {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      // 这是回复
      const parent = commentMap.get(comment.parentId)
      
      // 确保父评论有replies数组
      if (!parent.replies) {
        parent.replies = []
      }
      
      // 避免重复添加
      const existingIndex = parent.replies.findIndex((r: any) => r.id === comment.id)
      if (existingIndex === -1) {
        parent.replies.push(comment)
        
        // 更新回复计数
        if (parent._count) {
          parent._count.replies = parent.replies.length
        } else {
          parent._count = { replies: parent.replies.length, likes: parent.likes?.length || 0 }
        }
        
        console.log('↪️ 将评论添加到父评论:', {
          '子评论ID': comment.id,
          '父评论ID': parent.id,
          '父评论现有回复数': parent.replies.length
        })
      } else {
        console.log('⏭️ 评论已存在，跳过:', comment.id)
      }
    } else {
      // 这是一级评论
      const existingIndex = rootComments.findIndex((c: any) => c.id === comment.id)
      if (existingIndex === -1) {
        rootComments.push(comment)
        console.log('↪️ 添加为一级评论:', comment.id)
      }
    }
  })
  
  // 3. 验证树结构
  console.log('🌳 评论树构建完成:')
  console.log('🌳 总评论数:', comments.length)
  console.log('🌳 一级评论数:', rootComments.length)
  console.log('🌳 所有评论:')
  
  const printCommentTree = (comments: any[], level = 0) => {
    const indent = '  '.repeat(level)
    comments.forEach(comment => {
      console.log(`${indent}├─ ${comment.id}: ${comment.content?.substring(0, 30)}... (parent: ${comment.parentId || 'none'}, replies: ${comment.replies?.length || 0})`)
      if (comment.replies && comment.replies.length > 0) {
        printCommentTree(comment.replies, level + 1)
      }
    })
  }
  
  printCommentTree(rootComments)
  
  return rootComments
}

// 加载评论
const loadComments = async () => {
  if (!postId.value) return
  
  try {
    console.log('正在加载帖子评论:', postId.value)
    
    // 从当前帖子中获取评论
    if (postStore.currentPost && (postStore.currentPost as any)?.comments) {
      postStore.currentComments = (postStore.currentPost as any).comments
      console.log('从帖子中获取的评论:', postStore.currentComments)
    } else {
      // 如果帖子中没有评论字段，调用API获取评论
      await fetchCommentsFromAPI()
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 从API获取评论
const fetchCommentsFromAPI = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.log('用户未登录，无法获取评论')
    return
  }
  
  try {
    const response = await fetch(`http://localhost:3000/api/comments/post/${postId.value}?page=${commentPage.value}&limit=${commentLimit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('从API获取的评论:', data)
      
      if (data && Array.isArray(data.comments)) {
        postStore.currentComments = data.comments
      }
    }
  } catch (error) {
    console.error('获取评论API调用失败:', error)
  }
}

// 加载更多评论
const loadMoreComments = async () => {
  if (!hasMoreComments.value) return
  
  isLoadingMoreComments.value = true
  commentPage.value++
  await loadComments()
  isLoadingMoreComments.value = false
}

// 加载更多回复
const loadMoreReplies = async (commentId: string) => {
  console.log('加载评论回复:', commentId)
  // 实现加载更多回复的逻辑
}

// 点赞帖子
const handleLike = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  console.log('🔄 开始点赞')
  console.log('当前点赞状态:', isLiked.value)
  console.log('当前点赞数:', postStore.currentPost?.likeCount)
  
  isLiking.value = true
  
  // 记录原始状态
  const originalLiked = isLiked.value
  
  // 1. 立即切换图标（乐观更新UI）
  isLiked.value = !originalLiked
  
  try {
    // 2. 调用API
    const result = await postStore.likePost(postId.value)
    
    if (result.success) {
      console.log('✅ API调用成功')
      
      // ✅ 关键：从store获取最新的点赞数
      const latestLikeCount = postStore.currentPost?.likeCount || 0
      const latestLiked = result.liked
      
      console.log('🔄 更新UI状态:', {
        liked: latestLiked,
        likeCount: latestLikeCount
      })
      
      // 3. 使用API返回的实际数据
      isLiked.value = latestLiked
      
      // 4. 确保likeCount正确显示
      if (postStore.currentPost) {
        postStore.currentPost.likeCount = latestLikeCount
      }
      
    } else {
      // 出错时回滚
      console.error('❌ API调用失败:', result.error)
      isLiked.value = originalLiked
      alert(result.error || '点赞失败')
    }
    
  } catch (error: any) {
    console.error('❌ 点赞异常:', error)
    isLiked.value = originalLiked
    alert('点赞失败: ' + error.message)
  } finally {
    isLiking.value = false
  }
}

// 点赞评论
const likeComment = async (commentId: string) => {
  console.log('💬 开始点赞评论，ID:', commentId)
  
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  isLikingComment.value = true
  
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('未登录')
    
    // ✅ 1. 获取当前评论
    const comment = postStore.currentComments.find(c => c.id === commentId)
    if (!comment) {
      throw new Error('评论不存在')
    }
    
    console.log('📊 评论原始数据:', {
      id: comment.id,
      likeCount: comment.likeCount || 0,
      isLiked: likedComments.value.has(commentId)
    })
    
    // ✅ 2. 记录原始状态
    const originalLikeCount = comment.likeCount || 0
    const originalIsLiked = likedComments.value.has(commentId)
    
    console.log('🔄 乐观更新前:', {
      wasLiked: originalIsLiked,
      originalLikeCount
    })
    
    // ✅ 3. 乐观更新：这里是关键，要确保逻辑和API一致
    if (originalIsLiked) {
      // 取消点赞：点赞数-1
      likedComments.value.delete(commentId)
      comment.likeCount = Math.max(0, originalLikeCount - 1)
    } else {
      // 点赞：点赞数+1
      likedComments.value.add(commentId)
      comment.likeCount = originalLikeCount + 1
    }
    
    console.log('🔵 乐观更新后:', {
      newLikeCount: comment.likeCount,
      likedComments: Array.from(likedComments.value)
    })
    
    // ✅ 4. 调用点赞API
    const response = await fetch(`http://localhost:3000/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 API响应状态:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ API调用失败:', errorData)
      
      // ✅ 5. 失败时回滚
      if (originalIsLiked) {
        likedComments.value.add(commentId)
        comment.likeCount = originalLikeCount
      } else {
        likedComments.value.delete(commentId)
        comment.likeCount = originalLikeCount
      }
      
      throw new Error(errorData.error || '点赞失败')
    }
    
    const data = await response.json()
    console.log('✅ API返回数据（完整）:', JSON.stringify(data, null, 2))
    
    // ✅ 6. 关键修复：根据API返回的正确数据更新UI
    // 这里API可能返回不同的结构，比如：
    // 1. { liked: true, likeCount: 1, message: "点赞成功" }
    // 2. { success: true, liked: false, likeCount: 0 }
    // 3. 或者其他结构
    
    // 先解析API返回的数据
    let apiLiked = false
    let apiLikeCount = originalLikeCount
    
    if (data.liked !== undefined) {
      // 情况1: 有liked字段
      apiLiked = data.liked
      apiLikeCount = data.likeCount !== undefined ? data.likeCount : (apiLiked ? originalLikeCount + 1 : Math.max(0, originalLikeCount - 1))
    } else if (data.success !== undefined) {
      // 情况2: 有success字段
      apiLiked = data.liked || false
      apiLikeCount = data.likeCount !== undefined ? data.likeCount : originalLikeCount
    } else {
      // 情况3: 其他结构，根据message判断
      if (data.message && data.message.includes('点赞成功')) {
        apiLiked = true
        apiLikeCount = originalLikeCount + 1
      } else if (data.message && data.message.includes('取消点赞')) {
        apiLiked = false
        apiLikeCount = Math.max(0, originalLikeCount - 1)
      } else {
        // 默认回退到原始逻辑
        apiLiked = !originalIsLiked
        apiLikeCount = originalIsLiked ? Math.max(0, originalLikeCount - 1) : originalLikeCount + 1
      }
    }
    
    console.log('🔄 解析API返回数据:', {
      apiLiked,
      apiLikeCount,
      originalIsLiked,
      originalLikeCount
    })
    
    // ✅ 7. 使用API返回的数据更新UI
    if (apiLiked) {
      likedComments.value.add(commentId)
    } else {
      likedComments.value.delete(commentId)
    }
    
    // 确保点赞数是有效数字
    comment.likeCount = Math.max(0, apiLikeCount)
    
    console.log('🎉 最终更新:', {
      isLiked: likedComments.value.has(commentId),
      likeCount: comment.likeCount
    })
    
  } catch (error: any) {
    console.error('❌ 点赞评论失败:', error)
    alert('点赞失败: ' + error.message)
  } finally {
    isLikingComment.value = false
  }
}

// 发表评论
const handleSubmitComment = async () => {
  console.log('🔄 开始提交评论...')
  console.log('用户是否登录:', authStore.isAuthenticated)
  console.log('评论内容:', newComment.value)
  console.log('内容长度:', newComment.value.length)
  console.log('内容是否为空:', !newComment.value.trim())
  
  if (!authStore.isAuthenticated) {
    console.log('❌ 用户未登录，跳转到登录页')
    router.push('/login')
    return
  }
  
  if (!newComment.value.trim()) {
    console.log('❌ 评论内容为空，显示错误信息')
    commentError.value = '评论内容不能为空'
    
    // 添加红色边框效果
    setTimeout(() => {
      commentError.value = ''
    }, 3000)
    
    return
  }
  
  console.log('✅ 验证通过，开始提交...')
  isSubmittingComment.value = true
  
  try {
    console.log('📤 调用创建评论API...')
    console.log('帖子ID:', postId.value)
    console.log('评论内容:', newComment.value)
    
    // 直接调用API创建评论
    const result = await createComment()
    
    if (result && result.success) {
      console.log('✅ 评论创建成功:', result)
      
      // 清空输入框
      newComment.value = ''
      
      // 清空错误信息
      commentError.value = ''
      
      // 刷新评论列表
      await loadComments()
      
      // 显示成功消息
      alert('评论发表成功！')
      
      console.log('✅ 评论流程完成')
    } else {
      console.error('❌ 评论创建失败:', result?.error)
      alert(result?.error || '评论失败')
    }
    
  } catch (error: any) {
    console.error('❌ 创建评论异常:', error)
    alert('评论失败: ' + (error.message || '未知错误'))
  } finally {
    isSubmittingComment.value = false
    console.log('🔄 提交状态重置')
  }
}

// 创建评论的API调用函数
const createComment = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  const token = localStorage.getItem('token')
  if (!token) {
    return { success: false, error: '请先登录' }
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        postId: postId.value,
        content: newComment.value.trim(),
        images: []
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 评论创建API调用成功:', data)
      
      // 清空输入框
      newComment.value = ''
      
      // 刷新页面显示新评论
      await loadPost()
      await loadComments()
      
      return { success: true, data }
    } else {
      return { 
        success: false, 
        error: data.error || data.message || '评论失败' 
      }
    }
  } catch (error: any) {
    console.error('API调用失败:', error)
    return { 
      success: false, 
      error: error.message || '网络错误，请检查连接' 
    }
  }
}

// 直接调用API的方法
const submitCommentDirectly = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('请先登录')
    return
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        postId: postId.value,
        content: newComment.value.trim(),
        images: []
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ API调用成功:', data)
      
      // 清空输入框
      newComment.value = ''
      
      // 刷新页面显示新评论
      await loadPost()
      await loadComments()
      
      alert('评论成功！')
      
      return { success: true, data }
    } else {
      throw new Error(data.error || '评论失败')
    }
  } catch (error: any) {
    console.error('API调用失败:', error)
    throw error
  }
}

// 切换回复
const toggleReply = (commentId: string) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  if (showReplyTo.value === commentId) {
    showReplyTo.value = null
    replyContent.value = ''
  } else {
    showReplyTo.value = commentId
  }
  activeCommentActions.value = null
}

// 取消回复
const cancelReply = () => {
  showReplyTo.value = null
  replyContent.value = ''
}

// 提交回复
// 在 ForumDetailView.vue 中修改 submitReply 函数
// 提交回复 - 修复版本
// 提交回复 - 修复版本
const submitReply = async (parentId: string) => {
  console.log('🎯 开始提交回复...')
  console.log('父评论ID:', parentId)
  console.log('回复内容:', replyContent.value)
  console.log('当前帖子ID:', postId.value)
  
  if (!replyContent.value.trim()) {
    alert('回复内容不能为空')
    return
  }
  
  if (!authStore.isAuthenticated) {
    alert('请先登录')
    router.push('/login')
    return
  }
  
  if (!authStore.user?.id) {
    alert('用户信息不完整')
    return
  }
  
  const token = localStorage.getItem('token')
  if (!token) {
    alert('请先登录')
    return
  }
  
  try {
    // 1. 找到父评论
    const parentComment = findCommentRecursive(postStore.currentComments, parentId)
    if (!parentComment) {
      throw new Error('找不到父评论')
    }
    
    console.log('🔍 找到父评论:', {
      id: parentComment.id,
      content: parentComment.content.substring(0, 50) + '...',
      是否有replies: !!parentComment.replies,
      现有回复数: parentComment.replies?.length || 0
    })
    
    // 2. 确保数据结构完整
    if (!parentComment.replies) {
      parentComment.replies = []
    }
    if (!parentComment._count) {
      parentComment._count = { replies: 0, likes: 0 }
    }
    
    // 3. 创建临时回复对象
    const tempReply = {
      id: `temp_reply_${Date.now()}`,
      content: replyContent.value.trim(),
      author: {
        id: authStore.user.id,
        username: authStore.user.username,
        avatar: authStore.user.avatar
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: parentId,
      isReply: true,
      likeCount: 0,
      replies: [],
      _count: {
        likes: 0,
        replies: 0
      }
    }
    
    console.log('📝 临时回复对象:', {
      id: tempReply.id,
      parentId: tempReply.parentId,
      isReply: tempReply.isReply
    })
    
    // 4. 添加临时回复到父评论
    parentComment.replies.unshift(tempReply as Comment)
    parentComment._count.replies = (parentComment._count.replies || 0) + 1
    
    console.log('✅ 临时回复已添加到父评论，当前回复数:', parentComment._count.replies)
    
    // 5. 立即清空回复框
    const replyContentBackup = replyContent.value
    replyContent.value = ''
    showReplyTo.value = null
    
    // 6. 调用API创建回复
    console.log('📤 调用API创建回复...')
    const response = await fetch('http://localhost:3000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        postId: postId.value,
        content: replyContentBackup.trim(),  // 使用备份的内容
        parentId: parentId,
        isReply: true
      })
    })
    
    console.log('📡 API响应状态:', response.status)
    console.log('📡 API响应URL:', response.url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ API调用失败:', errorData)
      
      // 移除临时回复
      if (parentComment && parentComment.replies) {
        const index = parentComment.replies.findIndex((r: any) => r.id === tempReply.id)
        if (index > -1) {
          parentComment.replies.splice(index, 1)
          if (parentComment._count) {
            parentComment._count.replies = Math.max(0, (parentComment._count.replies || 1) - 1)
          }
        }
      }
      
      alert(errorData.error || errorData.message || '回复失败')
      return
    }
    
    const data = await response.json()
    console.log('✅ API返回数据:', JSON.stringify(data, null, 2))
    
    // 7. 解析API返回的评论
    let newComment = null
    if (data.success && data.data) {
      newComment = data.data
    } else if (data.comment) {
      newComment = data.comment
    } else {
      console.error('无法解析返回的评论数据:', data)
      throw new Error('无法解析返回的评论数据')
    }
    
    // 8. 验证返回的评论数据
    if (!newComment) {
      throw new Error('返回的评论数据为空')
    }
    
    // 9. 关键：确保返回的评论包含正确的层级信息
    if (!newComment.parentId) {
      console.warn('⚠️ API返回的评论没有parentId，手动设置')
      newComment.parentId = parentId
    }
    
    if (!newComment.isReply) {
      newComment.isReply = true
    }
    
    // 确保有replies数组
    if (!newComment.replies) {
      newComment.replies = []
    }
    
    // 确保有_count
    if (!newComment._count) {
      newComment._count = { replies: 0, likes: 0 }
    }
    
    console.log('🔍 解析后的评论:', {
      id: newComment.id,
      parentId: newComment.parentId,
      isReply: newComment.isReply,
      是否有replies数组: !!newComment.replies
    })
    
    // 10. 替换临时回复
    if (parentComment && parentComment.replies) {
      const tempReplyIndex = parentComment.replies.findIndex((r: any) => r.id === tempReply.id)
      
      if (tempReplyIndex > -1) {
        // 找到临时回复，用真实数据替换
        console.log('🔄 替换临时回复，索引:', tempReplyIndex)
        
        // 确保替换的对象包含所有必需字段
        parentComment.replies[tempReplyIndex] = {
          ...newComment,
          replies: newComment.replies || [],
          _count: newComment._count || { replies: 0, likes: 0 }
        }
        console.log('✅ 临时回复替换成功')
      } else {
        // 如果没有临时回复，添加到开头
        console.warn('⚠️ 未找到临时回复，将新回复添加到父评论')
        parentComment.replies.unshift({
          ...newComment,
          replies: newComment.replies || [],
          _count: newComment._count || { replies: 0, likes: 0 }
        })
      }
    }
    
    // 11. 更新帖子评论计数
    if (postStore.currentPost) {
      postStore.currentPost.commentCount = (postStore.currentPost.commentCount || 0) + 1
    }
    
    console.log('🎉 回复处理完成')
    console.log('📊 最终父评论状态:', {
      父评论ID: parentComment.id,
      回复数: parentComment._count.replies,
      回复列表: parentComment.replies.map((r: any) => ({ 
        id: r.id, 
        content: r.content,
        parentId: r.parentId,
        isReply: r.isReply
      }))
    })
    
    // 12. 不调用 loadPost() 或 loadComments()，只重新获取单个评论的回复
    setTimeout(() => {
      // 可选：重新获取这个父评论的所有回复，确保数据一致性
      fetchCommentReplies(parentId)
    }, 300)
    
    alert('回复成功！')
    
  } catch (error: any) {
    console.error('❌ 回复失败:', error)
    alert('回复失败: ' + (error.message || '未知错误'))
  }
}

// 辅助函数：递归查找评论
const findCommentRecursive = (comments: any[], commentId: string): any => {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment
    }
    
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentRecursive(comment.replies, commentId)
      if (found) return found
    }
  }
  return null
}


// 重新获取评论的回复
const fetchCommentReplies = async (commentId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    
    const response = await fetch(`http://localhost:3000/api/comments/${commentId}/replies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('🔁 重新加载评论回复:', commentId, data)
      
      // 找到对应的评论并更新它的回复
      const parentComment = findCommentRecursive(postStore.currentComments, commentId)
      if (parentComment && data.comments) {
        parentComment.replies = data.comments
        parentComment._count.replies = data.comments.length
        console.log('✅ 更新评论回复成功')
      }
    }
  } catch (error) {
    console.error('重新加载评论回复失败:', error)
  }
}



// 切换评论操作菜单
const toggleCommentActions = (commentId: string) => {
  if (activeCommentActions.value === commentId) {
    activeCommentActions.value = null
  } else {
    activeCommentActions.value = commentId
  }
}

// 编辑评论
const editComment = (comment: any) => {
  console.log('编辑评论:', comment)
  // 实现编辑评论逻辑
}

// 删除评论
const deleteComment = async (commentId: string) => {
  if (!confirm('确定要删除这条评论吗？')) return
  console.log('删除评论:', commentId)
  // 实现删除评论逻辑
}

// 分享帖子
const handleShare = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url)
    .then(() => {
      alert('链接已复制到剪贴板')
    })
    .catch(() => {
      prompt('复制链接分享:', url)
    })
}

// 举报帖子
const handleReport = () => {
  const reason = prompt('请输入举报原因：')
  if (reason) {
    alert('举报已提交，我们会尽快处理')
  }
}

// 编辑帖子
const handleEdit = () => {
  router.push(`/forums/${postId.value}/edit`)
}

// 删除帖子
const handleDelete = async () => {
  if (!confirm('确定要删除这篇帖子吗？此操作不可恢复。')) return
  
  try {
    const result = await postStore.deletePost(postId.value)
    if (result.success) {
      alert('帖子删除成功')
      router.push('/forums')
    } else {
      alert('删除失败: ' + result.error)
    }
  } catch (error) {
    console.error('删除帖子失败:', error)
    alert('删除失败')
  }
}

// 打开图片画廊
const openImageGallery = (index: number) => {
  console.log('打开图片画廊:', index)
  // 实现图片画廊逻辑
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('帖子详情页挂载，帖子ID:', postId.value)
  console.log('当前store状态:', {
    currentPost: postStore.currentPost,
    isLoading: postStore.isLoading,
    error: postStore.error
  })
  
  // 加载帖子
  loadPost()
  
  // ✅ 正确的点击事件处理
  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    
    // 检查点击的元素是否是菜单按钮或菜单
    const isMenuButton = target.closest('[data-menu-button]')
    const isMenu = target.closest('[data-menu]')
    
    console.log('文档点击，目标:', target, '是菜单按钮?', isMenuButton, '是菜单?', isMenu)
    
    // 如果是菜单按钮或菜单，什么都不做
    if (isMenuButton || isMenu) {
      console.log('点击了菜单相关元素，保持菜单打开')
      return
    }
    
    // 否则关闭所有菜单
    console.log('点击其他地方，关闭所有菜单')
    showMoreActions.value = false
    activeCommentActions.value = null
  }
  
  // 添加事件监听
  setTimeout(() => {
    document.addEventListener('click', handleDocumentClick)
  }, 100)
  
  // 清理
  onUnmounted(() => {
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isMenuButton = target.closest('[data-menu-button]')
      const isMenu = target.closest('[data-menu]')
      
      if (!isMenuButton && !isMenu) {
        showMoreActions.value = false
        activeCommentActions.value = null
      }
    }
    document.removeEventListener('click', clickHandler)
  })
})

// 清理
onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('click', () => {
    showMoreActions.value = false
    activeCommentActions.value = null
  })
})

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId && newId !== postId.value) {
    console.log('帖子ID变化，重新加载:', newId)
    loadPost()
  }
})

// 清理
onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('click', () => {
    showMoreActions.value = false
    activeCommentActions.value = null
  })
})
</script>

<style scoped>
/* 可以添加一些自定义样式 */
.prose {
  line-height: 1.8;
  color: #374151;
  font-size: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.prose p {
  margin-bottom: 1.5em;
}
</style>