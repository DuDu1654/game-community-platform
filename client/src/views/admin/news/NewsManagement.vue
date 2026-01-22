<!-- client/src/views/admin/news/NewsManagement.vue -->
<template>
  <div class="news-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索新闻标题或内容..."
        clearable
        @clear="fetchNews"
        @keyup.enter="fetchNews"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="filters.status"
        placeholder="状态"
        clearable
        @change="fetchNews"
        class="filter-select"
      >
        <el-option label="全部" value="" />
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
      
      <el-select
        v-model="filters.category"
        placeholder="分类"
        clearable
        @change="fetchNews"
        class="filter-select"
      >
        <el-option label="全部" value="" />
        <el-option label="游戏新闻" value="game" />
        <el-option label="攻略指南" value="guide" />
        <el-option label="赛事资讯" value="tournament" />
        <el-option label="社区公告" value="announcement" />
      </el-select>
      
      <el-button
        type="primary"
        :icon="Search"
        @click="fetchNews"
      >
        搜索
      </el-button>
      
      <el-button
        type="success"
        :icon="Refresh"
        @click="handleReset"
      >
        重置
      </el-button>
    </div>
    
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        新增新闻
      </el-button>
      
      <el-button
        :icon="Delete"
        @click="handleBatchDelete"
        :disabled="selectedRows.length === 0"
      >
        批量删除
      </el-button>
      
      <el-button
        :icon="Download"
        @click="handleExport"
      >
        导出
      </el-button>
    </div>
    
    <!-- 数据表格 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="newsList"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        border
      >
        <el-table-column type="selection" width="50" />
        
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <div class="cover-cell">
              <img
                v-if="row.coverImage"
                :src="row.coverImage"
                :alt="row.title"
                class="cover-image"
                @click="previewImage(row.coverImage)"
              />
              <div v-else class="no-cover">无封面</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="标题" min-width="300">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="title-text">{{ row.title }}</span>
              <div class="title-tags">
                <el-tag
                  v-if="row.status === 'published'"
                  type="success"
                  size="small"
                >
                  已发布
                </el-tag>
                <el-tag
                  v-else
                  type="warning"
                  size="small"
                >
                  草稿
                </el-tag>
                <el-tag
                  v-if="row.category"
                  size="small"
                >
                  {{ getCategoryLabel(row.category) }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="author" label="作者" width="120" />
        
        <el-table-column label="阅读/点赞" width="120">
          <template #default="{ row }">
            <div class="stats-cell">
              <span class="stat-item">👁️ {{ row.views || 0 }}</span>
              <span class="stat-item">👍 {{ row.likes || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                size="small"
                :icon="View"
                @click="handlePreview(row)"
                link
              />
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                @click="handleEdit(row)"
                link
              />
              <el-button
                v-if="row.status !== 'published'"
                type="success"
                size="small"
                :icon="Upload"
                @click="handlePublish(row)"
                link
              />
              <el-button
                v-else
                type="warning"
                size="small"
                :icon="Download"
                @click="handleUnpublish(row)"
                link
              />
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDelete(row)"
                link
              />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, Plus, Delete, Refresh, 
  Download, View, Edit, Upload 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElMessageBoxOptions } from 'element-plus'

// 定义类型
interface NewsItem {
  _id: string
  title: string
  content: string
  summary: string
  coverImage: string
  author: string
  views: number
  likes: number
  status: 'draft' | 'published' | 'deleted'
  category: string
  tags: string[]
  source: string
  sourceUrl: string
  publishTime: string
  createdAt: string
  updatedAt: string
}

interface CategoryOption {
  value: string
  label: string
}

const router = useRouter()

// 数据
const newsList = ref<NewsItem[]>([])
const loading = ref(false)
const selectedRows = ref<NewsItem[]>([])
const total = ref(0)

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20
})

// 筛选
const searchQuery = ref('')
const filters = reactive({
  status: '',
  category: ''
})

// 分类标签
const categoryOptions: CategoryOption[] = [
  { value: 'game', label: '游戏新闻' },
  { value: 'guide', label: '攻略指南' },
  { value: 'tournament', label: '赛事资讯' },
  { value: 'announcement', label: '社区公告' }
]

// 获取新闻列表
const fetchNews = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.currentPage.toString(),
      pageSize: pagination.pageSize.toString(),
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(filters.status && { status: filters.status }),
      ...(filters.category && { category: filters.category })
    })
    
    const response = await fetch(`/api/admin/news?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    
    if (!response.ok) throw new Error('请求失败')
    
    const data = await response.json()
    
    if (data.success) {
      newsList.value = data.data.news
      total.value = data.data.total
    } else {
      ElMessage.error(data.message || '获取新闻列表失败')
    }
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchNews()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchNews()
}

// 创建新闻
const handleCreate = () => {
  router.push('/admin/news/create')
}

// 编辑新闻
const handleEdit = (news: NewsItem) => {
  router.push(`/admin/news/edit/${news._id}`)
}

// 预览
const handlePreview = (news: NewsItem) => {
  window.open(`/news/${news._id}`, '_blank')
}

// 发布
const handlePublish = async (news: NewsItem) => {
  try {
    const response = await fetch(`/api/admin/news/${news._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({ status: 'published' })
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('发布成功')
      fetchNews()
    } else {
      ElMessage.error(data.message || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
  }
}

// 取消发布
const handleUnpublish = async (news: NewsItem) => {
  try {
    const response = await fetch(`/api/admin/news/${news._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({ status: 'draft' })
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('已取消发布')
      fetchNews()
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    console.error('取消发布失败:', error)
  }
}

// 删除
const handleDelete = async (news: NewsItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${news.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      } as ElMessageBoxOptions
    )
    
    const response = await fetch(`/api/admin/news/${news._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('删除成功')
      fetchNews()
    } else {
      ElMessage.error(data.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的新闻')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条新闻吗？此操作不可恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      } as ElMessageBoxOptions
    )
    
    const ids = selectedRows.value.map(row => row._id)
    
    const response = await fetch('/api/admin/news/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({ action: 'delete', ids })
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      fetchNews()
    } else {
      ElMessage.error(data.message || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

// 导出
const handleExport = () => {
  const params = new URLSearchParams({
    ...(searchQuery.value && { search: searchQuery.value }),
    ...(filters.status && { status: filters.status }),
    ...(filters.category && { category: filters.category })
  })
  
  const url = `/api/admin/news/export?${params}&token=${localStorage.getItem('admin_token')}`
  window.open(url, '_blank')
}

// 重置
const handleReset = () => {
  searchQuery.value = ''
  filters.status = ''
  filters.category = ''
  pagination.currentPage = 1
  fetchNews()
}

// 选择行
const handleSelectionChange = (rows: NewsItem[]) => {
  selectedRows.value = rows
}

// 预览图片
const previewImage = (url: string) => {
  if (url) {
    window.open(url, '_blank')
  }
}

// 获取分类标签
const getCategoryLabel = (value: string): string => {
  const option = categoryOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

// 格式化时间
const formatDateTime = (dateString: string): string => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.news-management {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  width: 120px;
}

.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cover-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  cursor: pointer;
}

.cover-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.3s;
}

.cover-image:hover {
  transform: scale(1.1);
}

.no-cover {
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.stats-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-item {
  font-size: 12px;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
  background: white;
  border-radius: 8px;
}
</style>