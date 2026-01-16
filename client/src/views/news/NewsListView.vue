<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 头部 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">游戏资讯</h1>
      <p class="mt-2 text-gray-600">最新的游戏新闻、版本更新和行业动态</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 主内容 -->
      <div class="lg:col-span-3">
        <!-- 搜索和筛选 -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="relative flex-1 mr-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索资讯..."
                class="input-field pl-10"
                @keyup.enter="handleSearch"
              />
              <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                <i class="el-icon-search text-gray-400"></i>
              </div>
            </div>
            <button
              @click="toggleFeatured"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                showFeatured
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              热门资讯
            </button>
          </div>
        </div>

        <!-- 资讯列表 -->
        <div v-if="newsStore.isLoading && !newsStore.news.length" class="text-center py-12">
          <i class="el-icon-loading text-4xl text-primary-600"></i>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <div v-else-if="newsStore.error" class="text-center py-12">
          <i class="el-icon-warning text-4xl text-red-600"></i>
          <p class="mt-2 text-red-600">{{ newsStore.error }}</p>
          <button @click="loadNews" class="btn-secondary mt-4">
            重试
          </button>
        </div>

        <div v-else-if="!newsStore.news.length" class="text-center py-12">
          <i class="el-icon-news text-4xl text-gray-400"></i>
          <p class="mt-2 text-gray-600">暂无资讯</p>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="newsItem in newsStore.news"
            :key="newsItem.id"
            class="card hover:shadow-lg transition-shadow cursor-pointer"
            @click="goToNews(newsItem.id)"
          >
            <div class="flex">
              <!-- 封面图 -->
              <div v-if="newsItem.coverImage" class="w-48 h-48 flex-shrink-0 mr-6">
                <img
                  :src="newsItem.coverImage"
                  :alt="newsItem.title"
                  class="w-full h-full object-cover rounded-lg"
                />
              </div>

              <!-- 内容 -->
              <div class="flex-1">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">
                      {{ newsItem.title }}
                      <span v-if="newsItem.isFeatured" class="badge badge-primary ml-2">
                        热门
                      </span>
                    </h3>
                    <p v-if="newsItem.summary" class="text-gray-600 mb-4 line-clamp-2">
                      {{ newsItem.summary }}
                    </p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                      <span>发布于 {{ formatTime(newsItem.createdAt) }}</span>
                      <span>{{ newsItem.viewCount }} 次浏览</span>
                      <span v-if="newsItem.source">来源：{{ newsItem.source }}</span>
                    </div>
                  </div>
                </div>

                <!-- 标签 -->
                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="tag in newsItem.tags"
                    :key="tag"
                    class="badge badge-secondary"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="newsStore.pagination.pages > 1" class="flex justify-center mt-8">
            <nav class="flex items-center space-x-2">
              <button
                @click="changePage(newsStore.pagination.page - 1)"
                :disabled="!newsStore.pagination.hasPrev"
                :class="[
                  'px-3 py-2 rounded-lg border',
                  newsStore.pagination.hasPrev
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                ]"
              >
                上一页
              </button>
              
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-3 py-2 rounded-lg border',
                  newsStore.pagination.page === page
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="changePage(newsStore.pagination.page + 1)"
                :disabled="!newsStore.pagination.hasNext"
                :class="[
                  'px-3 py-2 rounded-lg border',
                  newsStore.pagination.hasNext
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

      <!-- 侧边栏 -->
      <div class="lg:col-span-1">
        <!-- 热门资讯 -->
        <div class="card mb-6">
          <h3 class="text-lg font-semibold mb-4">热门资讯</h3>
          <div v-if="!newsStore.featuredNews.length" class="text-gray-500 text-center py-4">
            暂无热门资讯
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="newsItem in newsStore.featuredNews"
              :key="newsItem.id"
              class="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              @click="goToNews(newsItem.id)"
            >
              <h4 class="font-medium text-gray-900 hover:text-primary-600 cursor-pointer line-clamp-2">
                {{ newsItem.title }}
              </h4>
              <p class="text-sm text-gray-500 mt-1">
                {{ formatTime(newsItem.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 资讯统计 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">资讯统计</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">总资讯数</span>
              <span class="font-semibold">{{ newsStore.pagination.total.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">今日更新</span>
              <span class="font-semibold">{{ todayNewsCount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">热门资讯</span>
              <span class="font-semibold">{{ featuredNewsCount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">平均浏览</span>
              <span class="font-semibold">{{ avgViews.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- 订阅提醒 -->
        <div class="card mt-6">
          <h3 class="text-lg font-semibold mb-4">订阅最新资讯</h3>
          <p class="text-sm text-gray-600 mb-4">
            订阅后，我们将通过邮件通知您最新的游戏资讯
          </p>
          <div class="space-y-3">
            <input
              v-model="email"
              type="email"
              placeholder="请输入邮箱地址"
              class="input-field"
            />
            <button
              @click="handleSubscribe"
              class="btn-primary w-full"
            >
              订阅
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/news'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()
const newsStore = useNewsStore()

// 状态
const searchQuery = ref('')
const showFeatured = ref(false)
const email = ref('')

// 计算可见页码
const visiblePages = computed(() => {
  const current = newsStore.pagination.page
  const total = newsStore.pagination.pages
  const range = 2
  
  let start = Math.max(1, current - range)
  let end = Math.min(total, current + range)
  
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

// 统计信息
const todayNewsCount = ref(12)
const featuredNewsCount = computed(() => {
  return newsStore.news.filter(n => n.isFeatured).length
})
const avgViews = computed(() => {
  if (!newsStore.news.length) return 0
  const total = newsStore.news.reduce((sum, n) => sum + n.viewCount, 0)
  return Math.round(total / newsStore.news.length)
})

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), { 
    addSuffix: true,
    locale: zhCN 
  })
}

// 加载资讯
const loadNews = async () => {
  await newsStore.fetchNews({
    page: newsStore.pagination.page,
    limit: newsStore.pagination.limit,
    featured: showFeatured.value || undefined,
    search: searchQuery.value || undefined,
  })
}

// 加载热门资讯
const loadFeaturedNews = async () => {
  await newsStore.fetchFeaturedNews(5)
}

// 切换页码
const changePage = (page: number) => {
  if (page < 1 || page > newsStore.pagination.pages) return
  newsStore.pagination.page = page
  loadNews()
}

// 搜索
const handleSearch = () => {
  newsStore.pagination.page = 1
  loadNews()
}

// 切换热门资讯
const toggleFeatured = () => {
  showFeatured.value = !showFeatured.value
  newsStore.pagination.page = 1
  loadNews()
}

// 跳转到资讯详情
const goToNews = (newsId: string) => {
  router.push(`/news/${newsId}`)
}

// 订阅
const handleSubscribe = () => {
  if (!email.value) {
    alert('请输入邮箱地址')
    return
  }
  
  if (!/\S+@\S+\.\S+/.test(email.value)) {
    alert('请输入有效的邮箱地址')
    return
  }
  
  alert(`订阅成功！我们将发送最新资讯到 ${email.value}`)
  email.value = ''
}

// 监听搜索和筛选变化
watch([searchQuery, showFeatured], () => {
  newsStore.pagination.page = 1
  loadNews()
})

// 初始化加载
onMounted(async () => {
  await Promise.all([
    loadNews(),
    loadFeaturedNews(),
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