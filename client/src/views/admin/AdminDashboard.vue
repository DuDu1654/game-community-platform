<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background: #e6f7ff;">
            <el-icon size="24" color="#1890ff"><Document /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">总新闻数</div>
            <div class="card-value">{{ stats.totalNews }}</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background: #f6ffed;">
            <el-icon size="24" color="#52c41a"><Check /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">已发布</div>
            <div class="card-value">{{ stats.publishedNews }}</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background: #fff7e6;">
            <el-icon size="24" color="#fa8c16"><Edit /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">草稿</div>
            <div class="card-value">{{ stats.draftNews }}</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="stats-card">
        <div class="card-content">
          <div class="card-icon" style="background: #f9f0ff;">
            <el-icon size="24" color="#722ed1"><View /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">总阅读量</div>
            <div class="card-value">{{ formatNumber(stats.totalViews) }}</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 快速操作 -->
    <el-card shadow="never" class="quick-actions">
      <template #header>
        <div class="card-header">
          <span>快速操作</span>
        </div>
      </template>
      <div class="action-buttons">
        <el-button
          type="primary"
          :icon="Plus"
          @click="goToCreateNews"
          class="action-button"
        >
          新增新闻
        </el-button>
        <el-button
          :icon="Upload"
          @click="goToImport"
          class="action-button"
        >
          批量导入
        </el-button>
        <el-button
          :icon="Setting"
          @click="goToSettings"
          class="action-button"
        >
          系统设置
        </el-button>
      </div>
    </el-card>
    
    <!-- 最新新闻 -->
    <el-card shadow="never" class="recent-news">
      <template #header>
        <div class="card-header">
          <span>最新新闻</span>
          <el-button
            type="text"
            @click="goToNews"
          >
            查看更多
          </el-button>
        </div>
      </template>
      <el-table
        :data="recentNews"
        style="width: 100%"
        empty-text="暂无新闻"
      >
        <el-table-column prop="title" label="标题" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="news-title">
              <span class="title-text">{{ row.title }}</span>
              <el-tag
                v-if="row.status === 'draft'"
                type="warning"
                size="small"
              >
                草稿
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="阅读数" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="editNews(row._id)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Document, Check, Edit, View, 
  Plus, Upload, Setting 
} from '@element-plus/icons-vue'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()

// 统计数据
const stats = ref({
  totalNews: 0,
  publishedNews: 0,
  draftNews: 0,
  totalViews: 0
})

// 最新新闻
const recentNews = ref([])

// 分类标签
const categoryOptions = [
  { value: 'game', label: '游戏新闻' },
  { value: 'guide', label: '攻略指南' },
  { value: 'tournament', label: '赛事资讯' },
  { value: 'announcement', label: '社区公告' }
]

// 加载数据
const loadData = async () => {
  try {
    // 加载统计数据
    const statsRes = await fetch('/api/admin/news/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    if (statsRes.ok) {
      const data = await statsRes.json()
      if (data.success) {
        stats.value = data.data
      }
    }
    
    // 加载最新新闻
    const newsRes = await fetch('/api/admin/news?page=1&pageSize=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    if (newsRes.ok) {
      const data = await newsRes.json()
      if (data.success) {
        recentNews.value = data.data.news || []
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千'
  }
  return num.toString()
}

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
    locale: zhCN
  })
}

// 获取分类标签
const getCategoryLabel = (value: string) => {
  const option = categoryOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

// 导航
const goToCreateNews = () => {
  router.push('/admin/news/create')
}

const goToImport = () => {
  // 这里实现批量导入功能
  console.log('批量导入')
}

const goToSettings = () => {
  router.push('/admin/settings')
}

const goToNews = () => {
  router.push('/admin/news')
}

const editNews = (id: string) => {
  router.push(`/admin/news/edit/${id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  border-radius: 8px;
  border: none;
  transition: all 0.3s;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.quick-actions {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-button {
  padding: 8px 20px;
  border-radius: 6px;
}

.recent-news {
  border-radius: 8px;
}

.news-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>