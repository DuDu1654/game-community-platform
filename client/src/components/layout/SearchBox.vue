<template>
  <div class="relative">
    <!-- 搜索输入框 -->
    <div class="relative">
      <input
        ref="searchInput"
        v-model="keyword"
        type="text"
        placeholder="搜索帖子、资讯、用户..."
        class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
        @input="debouncedSearch"
        @focus="showDropdown = true"
        @keydown.esc="showDropdown = false"
        @keydown.enter="handleEnter"
      />
      <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
        <i class="el-icon-search text-gray-400"></i>
      </div>
    </div>

    <!-- 搜索结果下拉框 -->
    <div 
      v-if="showDropdown && keyword.trim()" 
      class="absolute top-full mt-1 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
    >
      <div v-if="loading" class="p-4 text-center text-gray-500">
        搜索中...
      </div>
      
      <div v-else-if="error" class="p-4 text-center text-red-500">
        搜索失败: {{ error }}
      </div>
      
      <div v-else>
        <!-- 结果统计 -->
        <div v-if="results.total > 0" class="px-4 py-2 border-b border-gray-100 text-xs text-gray-500 bg-gray-50">
          找到 {{ results.total }} 个结果
        </div>
        
        <!-- 帖子结果 -->
        <div v-if="results.posts.length > 0">
          <div class="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
            帖子
          </div>
          <div v-for="post in results.posts" :key="'post-' + post.id" 
               class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
               @click="goToPost(post.id)"> 
            <div class="flex items-start">
              <div class="flex-shrink-0 mt-1">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="el-icon-document text-blue-500 text-sm"></i>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900 truncate">{{ post.title }}</span>
                  <span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">帖子</span>
                </div>
                <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ post.content }}</p>
                <div class="flex items-center mt-1 text-xs text-gray-400">
                  <span class="flex items-center">
                    <i class="el-icon-user text-xs mr-1"></i>
                    {{ post.author.username }}
                  </span>
                  <span class="mx-2">•</span>
                  <span>{{ formatTime(post.createdAt) }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ post.viewCount }} 浏览</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 资讯结果 -->
        <div v-if="results.news.length > 0">
          <div class="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
            资讯
          </div>
          <div v-for="news in results.news" :key="'news-' + news.id" 
               class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
               @click="goToNews(news.id)"> 
            <div class="flex items-start">
              <div class="flex-shrink-0 mt-1">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="el-icon-news text-green-500 text-sm"></i>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900 truncate">{{ news.title }}</span>
                  <span class="ml-2 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">资讯</span>
                </div>
                <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ news.content }}</p>
                <div class="flex items-center mt-1 text-xs text-gray-400">
                  <span class="flex items-center">
                    <i class="el-icon-user text-xs mr-1"></i>
                    {{ news.author.username }}
                  </span>
                  <span class="mx-2">•</span>
                  <span>{{ formatTime(news.createdAt) }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ news.viewCount }} 浏览</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户结果 -->
        <div v-if="results.users.length > 0">
          <div class="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
            用户
          </div>
          <div v-for="user in results.users" :key="'user-' + user.id" 
               class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
               @click="goToUser(user.id)">
            <div class="flex items-center">
              <img 
                :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username" 
                :alt="user.username"
                class="w-8 h-8 rounded-full border border-gray-300"
              />
              <div class="ml-3">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900">{{ user.username }}</span>
                  <span class="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">用户</span>
                </div>
                <p class="text-xs text-gray-500 mt-1 truncate">{{ user.bio }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 无结果 -->
        <div v-if="results.total === 0 && !loading" class="p-8 text-center text-gray-500">
          <i class="el-icon-search text-3xl text-gray-300 mb-2"></i>
          <p class="text-sm">没有找到相关结果</p>
          <p class="text-xs text-gray-400 mt-1">请尝试其他关键词</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'  // 导入 useRouter
import axios from 'axios'
import debounce from 'lodash-es/debounce'

const router = useRouter()  // 创建 router 实例

// 定义结果类型
interface BaseResultItem {
  id: string
  type: 'post' | 'news' | 'user'
  createdAt: string
}

interface PostResult extends BaseResultItem {
  type: 'post'
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar: string
  }
  viewCount: number
  likeCount: number
  commentCount: number
}

interface NewsResult extends BaseResultItem {
  type: 'news'
  title: string
  content: string
  author: {
    id: string
    username: string
    avatar: string
  }
  viewCount: number
  coverImage?: string
}

interface UserResult extends BaseResultItem {
  type: 'user'
  username: string
  bio: string
  avatar: string
}

interface SearchResponse {
  posts: PostResult[]
  news: NewsResult[]
  users: UserResult[]
  total: number
}

// 响应式数据
const keyword = ref('')
const showDropdown = ref(false)
const loading = ref(false)
const error = ref('')
const searchInput = ref<HTMLInputElement>()

// 搜索结果
const results = reactive<SearchResponse>({
  posts: [],
  news: [],
  users: [],
  total: 0
})


// 跳转到帖子详情页
const goToPost = (postId: string) => {
  showDropdown.value = false
  keyword.value = ''
  // 使用完整路径，强制新页面加载
  window.location.href = `/forums/${postId}`
}

// 跳转到资讯详情页
const goToNews = (newsId: string) => {
  showDropdown.value = false
  keyword.value = ''
  window.location.href = `/news/${newsId}`
}

// 跳转到用户个人页
const goToUser = (userId: string) => {
  showDropdown.value = false
  keyword.value = ''
  window.location.href = `/user/${userId}`
}


// 搜索函数
const search = async () => {
  if (!keyword.value.trim()) {
    results.posts = []
    results.news = []
    results.users = []
    results.total = 0
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.get('/api/search', {
      params: {
        keyword: keyword.value.trim(),
        limit: 5
      }
    })
    
    // 确保数据结构正确
    results.posts = response.data.posts || []
    results.news = response.data.news || []
    results.users = response.data.users || []
    results.total = response.data.total || 0
  } catch (err) {
    console.error('搜索错误:', err)
    error.value = err instanceof Error ? err.message : '搜索失败'
  } finally {
    loading.value = false
  }
}

// 防抖搜索
const debouncedSearch = debounce(search, 300)

// 处理回车键
const handleEnter = () => {
  if (keyword.value.trim()) {
    search()
  }
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  if (searchInput.value && !searchInput.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>