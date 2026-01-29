<template>
  <div class="news-editor">
    <el-card>
      <template #header>
        <div class="editor-header">
          <span class="editor-title">
            {{ isEditMode ? '编辑新闻' : '发布新闻' }}
          </span>
          <div class="editor-actions">
            <el-button @click="previewContent" :disabled="!form.content">
              预览
            </el-button>
            <el-button @click="saveDraft" :loading="saving">
              保存草稿
            </el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">
              发布
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="top"
      >
        <!-- 标题和分类 -->
        <div class="form-grid">
          <el-form-item label="新闻标题" prop="title" class="title-item">
            <el-input
              v-model="form.title"
              placeholder="请输入新闻标题"
              size="large"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="分类" prop="category" class="category-item">
            <el-select
              v-model="form.category"
              placeholder="请选择分类"
              style="width: 100%"
            >
              <el-option label="游戏新闻" value="game" />
              <el-option label="攻略指南" value="guide" />
              <el-option label="赛事资讯" value="tournament" />
              <el-option label="社区公告" value="announcement" />
              <el-option label="版本更新" value="update" />
              <el-option label="活动资讯" value="event" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="作者" prop="author" class="author-item">
            <el-input
              v-model="form.author"
              placeholder="请输入作者"
            />
          </el-form-item>
        </div>
        
        <!-- 摘要 -->
        <el-form-item label="摘要" prop="summary" class="summary-item">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入新闻摘要，将显示在列表页"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        
        <!-- 封面图 -->
        <el-form-item label="封面图" class="cover-item">
          <div class="cover-container">
            <!-- 预览部分 -->
            <div v-if="coverPreviewUrl" class="cover-preview">
              <img :src="coverPreviewUrl" :alt="form.title" class="cover-image" />
              <button @click="removeCoverImage" class="cover-remove-button">×</button>
            </div>
            
            <!-- 上传按钮 -->
            <div class="upload-cover">
              <input
                type="file"
                accept="image/*"
                ref="coverInput"
                @change="handleCoverImageSelect"
                style="display: none"
              />
              <el-button 
                type="primary" 
                size="small"
                @click="triggerCoverInput"
              >
                选择封面图
              </el-button>
              <div class="upload-tip">建议尺寸 1200×600，支持 JPG、PNG 格式，最大 5MB</div>
            </div>
          </div>
        </el-form-item>
        
        <!-- 富文本编辑器 -->
        <el-form-item label="新闻内容" prop="content" class="content-item">
          <RichTextEditor
            v-model="form.content"
            placeholder="请输入新闻内容，支持图片上传、富文本编辑..."
            @content-change="handleEditorChange"
            style="min-height: 400px;"
          />
        </el-form-item>
        
        <!-- 标签 -->
        <el-form-item label="标签" prop="tags" class="tags-item">
          <div class="tags-container">
            <el-select
              v-model="form.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入标签"
              style="flex: 1;"
            >
              <el-option
                v-for="tag in tagOptions"
                :key="tag.value"
                :label="tag.label"
                :value="tag.value"
              />
            </el-select>
            <el-button @click="suggestTags" type="text">
              智能推荐
            </el-button>
          </div>
          <div class="tags-count">
            已选择 {{ form.tags.length }} 个标签
          </div>
        </el-form-item>
        
        <!-- 状态和发布设置 -->
        <div class="form-grid-2">
          <el-form-item label="发布状态" prop="status" class="status-item">
            <el-radio-group v-model="form.status">
              <el-radio label="draft" border>草稿</el-radio>
              <el-radio label="published" border>发布</el-radio>
              <el-radio label="scheduled" border>定时发布</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item
            v-if="form.status === 'scheduled'"
            label="发布时间"
            prop="publishAt"
            class="schedule-item"
          >
            <el-date-picker
              v-model="form.publishAt"
              type="datetime"
              placeholder="选择发布时间"
              style="width: 100%;"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-card>
    
    <!-- 预览模态框 -->
    <el-dialog
      v-model="previewVisible"
      title="预览"
      width="80%"
      top="5vh"
    >
      <div class="news-preview">
        <h1 class="preview-title">{{ form.title }}</h1>
        <div class="preview-meta">
          <span>作者：{{ form.author }}</span>
          <span class="meta-divider">|</span>
          <span>{{ formatTime(new Date()) }}</span>
          <span class="meta-divider">|</span>
          <span>分类：{{ getCategoryLabel(form.category) }}</span>
        </div>
        
        <!-- 封面图预览 -->
        <div v-if="form.coverImage" class="preview-cover">
          <img
            :src="form.coverImage"
            alt="封面图"
            class="cover-image-preview"
          />
        </div>
        
        <!-- 内容预览 -->
        <div class="preview-content" v-html="form.content"></div>
        
        <!-- 标签预览 -->
        <div v-if="form.tags.length > 0" class="preview-tags">
          <div class="tags-container-preview">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="tag-item"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import RichTextEditor from '@/components/editor/RichTextEditor.vue'
import { format } from 'date-fns'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const coverInput = ref<HTMLInputElement>()  // 添加这行
const saving = ref(false)
const submitting = ref(false)
const previewVisible = ref(false)
const coverPreviewUrl = ref('')

// 表单数据接口
interface FormData {
  title: string
  content: string
  summary: string
  category: string
  tags: string[]
  coverImage: string
  images: string[]
  author: string
  status: 'draft' | 'published' | 'scheduled'
  publishAt?: Date
}

// 表单数据
const form = reactive<FormData>({
  title: '',
  content: '',
  summary: '',
  category: 'game',
  tags: [],
  coverImage: '',
  images: [],
  author: '管理员',
  status: 'draft',
  publishAt: new Date()
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, message: '标题至少3个字符', trigger: 'blur' },
    { max: 100, message: '标题不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, message: '内容至少10个字符', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ],
  summary: [
    { max: 300, message: '摘要不能超过300个字符', trigger: 'blur' }
  ]
}

// 标签选项
const tagOptions = [
  { value: '英雄联盟', label: '英雄联盟' },
  { value: '王者荣耀', label: '王者荣耀' },
  { value: '原神', label: '原神' },
  { value: 'CS:GO', label: 'CS:GO' },
  { value: 'DOTA2', label: 'DOTA2' },
  { value: '赛事', label: '赛事' },
  { value: '攻略', label: '攻略' },
  { value: '更新', label: '更新' },
  { value: '活动', label: '活动' },
  { value: '新版本', label: '新版本' },
  { value: '电竞', label: '电竞' }
]

// 触发封面图选择
const triggerCoverInput = () => {
  if (coverInput.value) {
    coverInput.value.click()
  } else {
    console.error('封面图输入框未找到')
  }
}

// 处理封面图选择
const handleCoverImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const file = input.files[0]
  if (!file) {
    ElMessage.error('文件选择失败')
    return
  }
  
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！支持 JPG、PNG 等格式')
    return
  }
  
  // 验证文件大小
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB！')
    return
  }
  
  // 生成预览URL
  coverPreviewUrl.value = URL.createObjectURL(file)
  
  // 将图片转为Base64保存
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      form.coverImage = e.target.result as string
      ElMessage.success('图片已选择，发布时会随表单一起提交')
    }
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败，请重试')
  }
  reader.readAsDataURL(file)
}

// 移除封面图
const removeCoverImage = () => {
  coverPreviewUrl.value = ''
  form.coverImage = ''
  if (coverInput.value) {
    coverInput.value.value = ''
  }
  ElMessage.success('已移除封面图')
}

// 计算是否是编辑模式
const isEditMode = computed(() => {
  return !!route.params.id
})

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categories: Record<string, string> = {
    game: '游戏新闻',
    guide: '攻略指南',
    tournament: '赛事资讯',
    announcement: '社区公告',
    update: '版本更新',
    event: '活动资讯'
  }
  return categories[category] || '未知'
}

// 格式化时间
const formatTime = (date: Date) => {
  return format(date, 'yyyy年MM月dd日 HH:mm')
}

// 编辑器内容变化
const handleEditorChange = (content: string, images: string[]) => {
  form.content = content
  form.images = images
  
  // 如果没有设置封面图，使用第一张图片作为封面
  if (!form.coverImage && images.length > 0 && images[0]) {
    form.coverImage = images[0]
  }
}

// 图片上传前的验证
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB！')
    return false
  }
  return true
}

// 智能推荐标签
const suggestTags = () => {
  const suggestions: string[] = []
  if (form.content.includes('英雄联盟') || form.content.includes('LOL')) {
    suggestions.push('英雄联盟')
  }
  if (form.content.includes('王者荣耀') || form.content.includes('王者')) {
    suggestions.push('王者荣耀')
  }
  if (form.content.includes('原神') || form.content.includes('Genshin')) {
    suggestions.push('原神')
  }
  if (form.content.includes('赛事') || form.content.includes('比赛')) {
    suggestions.push('赛事')
  }
  if (form.content.includes('攻略') || form.content.includes('指南')) {
    suggestions.push('攻略')
  }
  if (form.content.includes('新版本') || form.content.includes('更新')) {
    suggestions.push('新版本')
  }
  
  // 去重并添加到现有标签
  const newTags = [...new Set([...form.tags, ...suggestions])]
  form.tags = newTags.slice(0, 10) // 最多10个标签
  
  if (suggestions.length > 0) {
    ElMessage.success(`已推荐 ${suggestions.length} 个标签`)
  } else {
    ElMessage.info('无法自动推荐标签，请手动输入')
  }
}

// 预览内容
const previewContent = () => {
  if (!form.content) {
    ElMessage.warning('请先输入内容')
    return
  }
  previewVisible.value = true
}

// 保存草稿
const saveDraft = async () => {
  await submitForm(true)
}

// 提交表单
const submitForm = async (isDraft = false) => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (isDraft) {
      form.status = 'draft'
      saving.value = true
    } else {
      submitting.value = true
    }
    
    console.log('提交的表单数据:', form)
    
    // 准备数据
    const requestData = {
      title: form.title,
      content: form.content,
      summary: form.summary,
      category: form.category,
      tags: JSON.stringify(form.tags),
      coverImage: form.coverImage,
      images: JSON.stringify(form.images),
      author: form.author,
      status: form.status,
      publishAt: form.status === 'scheduled' && form.publishAt 
        ? format(form.publishAt, "yyyy-MM-dd'T'HH:mm:ss") 
        : null
    }
    
    console.log('发送的请求数据:', requestData)
    
    const url = isEditMode.value
      ? `/api/admin/news/${route.params.id}`
      : '/api/admin/news'
    
    const method = isEditMode.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(requestData)
    })
    
    console.log('响应状态:', response.status)
    
    const data = await response.json()
    console.log('响应数据:', data)
    
    if (data.success) {
      ElMessage.success(
        isEditMode.value 
          ? '更新成功' 
          : (isDraft ? '保存草稿成功' : '发布成功')
      )
      
      if (isDraft) {
        if (!isEditMode.value && data.data?.id) {
          router.push(`/admin/news/edit/${data.data.id}`)
        }
      } else {
        router.push('/admin/news')
      }
    } else {
      ElMessage.error(data.message || '操作失败')
      console.error('API返回错误:', data)
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + (error as Error).message)
  } finally {
    saving.value = false
    submitting.value = false
  }
}

// 取消
const cancel = () => {
  if (form.content || form.title) {
    if (confirm('您有未保存的内容，确定要离开吗？')) {
      router.push('/admin/news')
    }
  } else {
    router.push('/admin/news')
  }
}

// 加载数据
onMounted(async () => {
  const id = route.params.id
  if (id && typeof id === 'string') {
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        Object.assign(form, {
          ...data.data,
          tags: data.data.tags ? JSON.parse(data.data.tags) : [],
          publishAt: data.data.publishAt ? new Date(data.data.publishAt) : new Date()
        })
        
        // 如果有封面图，设置预览URL
        if (data.data.coverImage) {
          form.coverImage = data.data.coverImage
        }
      }
    } catch (error) {
      console.error('加载新闻失败:', error)
      ElMessage.error('加载新闻失败')
    }
  }
})
</script>

<style scoped>
.news-editor {
  padding: 1rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  .title-item {
    grid-column: span 3;
  }
}

.summary-item {
  margin-bottom: 1.5rem;
}

.cover-container {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.cover-preview {
  position: relative;
  width: 8rem;
  height: 4rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-remove-button {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: #ef4444;
  color: white;
  border-radius: 9999px;
  width: 1.25rem;
  height: 1.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  border: none;
  z-index: 10;
}

.cover-preview:hover .cover-remove-button {
  opacity: 1;
}

.cover-remove-button:hover {
  background-color: #dc2626;
}

.upload-cover {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-tip {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.content-item {
  margin-bottom: 1.5rem;
}

.tags-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tags-count {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid-2 {
    grid-template-columns: 1fr 1fr;
  }
}

/* 预览样式 */
.news-preview {
  padding: 1rem;
}

.preview-title {
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #111827;
}

.preview-meta {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-divider {
  margin: 0 0.5rem;
  color: #d1d5db;
}

.preview-cover {
  margin-bottom: 1.5rem;
}

.cover-image-preview {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.preview-content {
  color: #374151;
  line-height: 1.75;
  font-size: 1rem;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.preview-content h1 {
  font-size: 1.875rem;
}

.preview-content h2 {
  font-size: 1.5rem;
}

.preview-content h3 {
  font-size: 1.25rem;
}

.preview-content p {
  margin-bottom: 1rem;
}

.preview-content img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 0.375rem;
}

.preview-content ul,
.preview-content ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.preview-content ul {
  list-style-type: disc;
}

.preview-content ol {
  list-style-type: decimal;
}

.preview-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.preview-content a:hover {
  color: #2563eb;
}

.preview-content blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  font-style: italic;
  margin: 1rem 0;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
}

.preview-content pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-size: 0.875rem;
}

.preview-content code {
  background-color: #f3f4f6;
  color: #dc2626;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.preview-tags {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.tags-container-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 9999px;
  font-size: 0.75rem;
}
</style>