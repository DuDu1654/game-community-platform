<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 头部 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">游戏论坛</h1>
      <p class="mt-2 text-gray-600">与玩家一起讨论游戏攻略、分享游戏心得</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 左侧：主内容 -->
      <div class="lg:col-span-3">
        <!-- 操作栏 -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                {{ tab.name }}
              </button>
            </div>
            <router-link
              to="/forums/create"
              class="btn-primary flex items-center"
            >
              <i class="el-icon-edit mr-2"></i>
              发帖
            </router-link>
          </div>

          <!-- 搜索和筛选 -->
          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索帖子..."
                  class="input-field pl-10"
                  @keyup.enter="handleSearch"
                />
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <i class="el-icon-search text-gray-400"></i>
                </div>
              </div>
            </div>
            <div>
              <select
                v-model="selectedTag"
                class="input-field"
                @change="handleTagChange"
              >
                <option value="">全部标签</option>
                <option v-for="tag in popularTags" :key="tag.tag" :value="tag.tag">
                  {{ tag.tag }} ({{ tag.count }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 帖子列表 -->
        <div v-if="postStore.isLoading && !postStore.posts.length" class="text-center py-12">
          <i class="el-icon-loading text-4xl text-primary-600"></i>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="postStore.error" class="text-center py-12">
          <i class="el-icon-warning text-4xl text-red-600"></i>
          <p class="mt-2 text-red-600">{{ postStore.error }}</p>
          <button @click="loadPosts" class="btn-secondary mt-4">
            重试
          </button>
        </div>

        <div v-else-if="!postStore.posts.length" class="text-center py-12">
          <i class="el-icon-document text-4xl text-gray-400"></i>
          <p class="mt-2 text-gray-600">暂无帖子</p>
          <router-link to="/forums/create" class="btn-primary mt-4 inline-block">
            发布第一个帖子
          </router-link>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="post in postStore.posts"
            :key="post.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="goToPost(post.id)"
          >
            <div class="flex">
              <!-- 左侧：投票/热度 -->
              <div class="w-20 flex-shrink-0 pr-4 border-r border-gray-100">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ post.likeCount }}</div>
                  <div class="text-sm text-gray-500">点赞</div>
                </div>
                <div class="mt-4 text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ post.commentCount }}</div>
                  <div class="text-sm text-gray-500">评论</div>
                </div>
              </div>

              <!-- 右侧：内容 -->
              <div class="flex-1 pl-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900 hover:text-primary-600">
                      {{ post.title }}
                    </h3>
                    <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <router-link
                        :to="`/profile/${post.author.id}`"
                        class="flex items-center space-x-2 hover:text-primary-600"
                      >
                        <img
                          :src="post.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.author.username"
                          :alt="post.author.username"
                          class="w-6 h-6 rounded-full"
                        />
                        <span>{{ post.author.username }}</span>
                      </router-link>
                      <span>发布于 {{ formatTime(post.createdAt) }}</span>
                      <span>{{ post.viewCount }} 次浏览</span>
                    </div>
                  </div>
                  <div v-if="post.isPinned" class="badge badge-primary">
                    置顶
                  </div>
                </div>

                <!-- 标签 -->
                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="badge badge-secondary hover:bg-gray-200 cursor-pointer"
                    @click.stop="filterByTag(tag)"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- 内容预览 -->
                <p class="mt-4 text-gray-600 line-clamp-2">
                  {{ post.content.substring(0, 150) }}{{ post.content.length > 150 ? '...' : '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="postStore.pagination.pages > 1" class="flex justify-center mt-8">
            <nav class="flex items-center space-x-2">
              <button
                @click="changePage(postStore.pagination.page - 1)"
                :disabled="!postStore.pagination.hasPrev"
                :class="[
                  'px-3 py-2 rounded-lg border',
                  postStore.pagination.hasPrev
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                ]"
              >
                上一页
              </button>
              
              <template v-for="page in visiblePages" :key="page">
                <button
                  @click="changePage(page)"
                  :class="[
                    'px-3 py-2 rounded-lg border',
                    postStore.pagination.page === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
              </template>
              
              <button
                @click="changePage(postStore.pagination.page + 1)"
                :disabled="!postStore.pagination.hasNext"
                :class="[
                  'px-3 py-2 rounded-lg border',
                  postStore.pagination.hasNext
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                ]"
              >
                下一页
              </button>
            </nav>
          </div>
        </div>
      </div>

      <!-- 右侧：侧边栏 -->
      <div class="lg:col-span-1">
        <!-- 热门标签 -->
        <div class="card mb-6">
          <h3 class="text-lg font-semibold mb-4">热门标签</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in popularTags"
              :key="tag.tag"
              @click="filterByTag(tag.tag)"
              class="badge badge-primary cursor-pointer hover:bg-primary-200"
            >
              {{ tag.tag }} ({{ tag.count }})
            </span>
          </div>
        </div>

        <!-- 论坛统计 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">论坛统计</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">总帖子数</span>
              <span class="font-semibold">{{ forumStats.totalPosts.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">今日发帖</span>
              <span class="font-semibold">{{ forumStats.todayPosts.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">总评论数</span>
              <span class="font-semibold">{{ forumStats.totalComments.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">在线用户</span>
              <span class="font-semibold text-green-600">{{ forumStats.onlineUsers.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- 发帖指南 -->
        <div class="card mt-6">
          <h3 class="text-lg font-semibold mb-4">发帖指南</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <i class="el-icon-check text-green-500 mt-0.5 mr-2"></i>
              发布与游戏相关的内容
            </li>
            <li class="flex items-start">
              <i class="el-icon-check text-green-500 mt-0.5 mr-2"></i>
              尊重他人，文明发言
            </li>
            <li class="flex items-start">
              <i class="el-icon-check text-green-500 mt-0.5 mr-2"></i>
              选择合适的标签
            </li>
            <li class="flex items-start">
              <i class="el-icon-check text-green-500 mt-0.5 mr-2"></i>
              禁止发布广告和不当内容
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()
const postStore = usePostStore()

// 状态
const activeTab = ref('latest')
const searchQuery = ref('')
const selectedTag = ref('')

// 标签页
const tabs = [
  { id: 'latest', name: '最新' },
  { id: 'popular', name: '热门' },
  { id: 'trending', name: '趋势' },
]

// 热门标签（从store获取）
const popularTags = ref<Array<{ tag: string; count: number }>>([])

// 论坛统计（模拟数据）
const forumStats = ref({
  totalPosts: 1234,
  todayPosts: 42,
  totalComments: 5678,
  onlineUsers: 256,
})

// 计算可见的页码
const visiblePages = computed(() => {
  const current = postStore.pagination.page
  const total = postStore.pagination.pages
  const range = 2 // 当前页码前后显示几个页码
  
  let start = Math.max(1, current - range)
  let end = Math.min(total, current + range)
  
  // 确保显示足够的页码数量
  if (end - start < range * 2) {
    if (current <= range) {
      end = Math.min(total, range * 2 + 1)
    } else if (current >= total - range) {
      start = Math.max(1, total - range * 2)
    }
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), { 
    addSuffix: true,
    locale: zhCN 
  })
}

// 加载帖子
const loadPosts = async () => {
  const params: any = {
    page: postStore.pagination.page,
    limit: postStore.pagination.limit,
    orderBy: activeTab.value,
  }
  
  if (selectedTag.value) {
    params.tag = selectedTag.value
  }
  
  if (searchQuery.value) {
    params.search = searchQuery.value
  }
  
  await postStore.fetchPosts(params)
}

// 加载热门标签
const loadPopularTags = async () => {
  const result = await postStore.fetchPopularTags(10)
  if (result.success) {
    popularTags.value = result.tags
  }
}

// 切换页码
const changePage = (page: number) => {
  if (page < 1 || page > postStore.pagination.pages) return
  postStore.pagination.page = page
  loadPosts()
}

// 搜索帖子
const handleSearch = () => {
  postStore.pagination.page = 1
  loadPosts()
}

// 按标签筛选
const filterByTag = (tag: string) => {
  selectedTag.value = tag
  postStore.pagination.page = 1
  loadPosts()
}

// 标签变化处理
const handleTagChange = () => {
  postStore.pagination.page = 1
  loadPosts()
}

// 跳转到帖子详情
const goToPost = (postId: string) => {
  router.push(`/forums/${postId}`)
}

// 监听标签页变化
watch(activeTab, () => {
  postStore.pagination.page = 1
  loadPosts()
})

// 初始化加载
onMounted(async () => {
  await Promise.all([
    loadPosts(),
    loadPopularTags(),
  ])
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>