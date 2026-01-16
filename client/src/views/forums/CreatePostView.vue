<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 头部 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">发布新帖子</h1>
      <p class="mt-2 text-gray-600">分享你的游戏心得、攻略或疑问</p>
    </div>

    <!-- 表单 -->
    <div class="card">
      <form @submit.prevent="handleSubmit">
        <!-- 标题 -->
        <div class="mb-6">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            标题
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="input-field"
            placeholder="请输入帖子标题"
            :class="{ 'border-red-300': errors.title }"
            @input="clearError('title')"
          />
          <p v-if="errors.title" class="mt-1 text-sm text-red-600">
            {{ errors.title }}
          </p>
        </div>

        <!-- 标签 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="badge badge-primary inline-flex items-center"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(tag)"
                class="ml-1 hover:text-red-600"
              >
                <i class="el-icon-close text-xs"></i>
              </button>
            </span>
          </div>
          <div class="relative">
            <input
              v-model="tagInput"
              type="text"
              class="input-field pr-20"
              placeholder="输入标签后按Enter添加"
              @keydown.enter.prevent="addTag"
            />
            <button
              type="button"
              @click="addTag"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary text-sm px-3 py-1"
            >
              添加
            </button>
          </div>
          <p class="mt-2 text-sm text-gray-500">
            热门标签：
            <button
              v-for="tag in popularTags.slice(0, 5)"
              :key="tag.tag"
              type="button"
              @click="addPopularTag(tag.tag)"
              class="text-primary-600 hover:text-primary-800 ml-2"
            >
              {{ tag.tag }}
            </button>
          </p>
        </div>

        <!-- 内容编辑器 -->
        <div class="mb-6">
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            内容
          </label>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <!-- 工具栏 -->
            <div class="bg-gray-50 border-b border-gray-300 p-2 flex items-center space-x-2">
              <button
                type="button"
                @click="insertText('**', '**')"
                class="p-1 hover:bg-gray-200 rounded"
                title="加粗"
              >
                <i class="el-icon-bold"></i>
              </button>
              <button
                type="button"
                @click="insertText('*', '*')"
                class="p-1 hover:bg-gray-200 rounded"
                title="斜体"
              >
                <i class="el-icon-italic"></i>
              </button>
              <button
                type="button"
                @click="insertText('```\n', '\n```')"
                class="p-1 hover:bg-gray-200 rounded"
                title="代码块"
              >
                <i class="el-icon-document"></i>
              </button>
              <button
                type="button"
                @click="insertText('- ', '')"
                class="p-1 hover:bg-gray-200 rounded"
                title="无序列表"
              >
                <i class="el-icon-list"></i>
              </button>
              <button
                type="button"
                @click="insertText('1. ', '')"
                class="p-1 hover:bg-gray-200 rounded"
                title="有序列表"
              >
                <i class="el-icon-tickets"></i>
              </button>
              <button
                type="button"
                @click="insertText('> ', '')"
                class="p-1 hover:bg-gray-200 rounded"
                title="引用"
              >
                <i class="el-icon-quote"></i>
              </button>
              <div class="flex-1"></div>
              <span class="text-sm text-gray-500">
                {{ form.content.length }}/10000
              </span>
            </div>
            
            <!-- 文本区域 -->
            <textarea
              id="content"
              v-model="form.content"
              required
              rows="12"
              class="w-full px-4 py-3 focus:outline-none resize-none"
              placeholder="请输入帖子内容，支持Markdown格式..."
              :class="{ 'border-red-300': errors.content }"
              @input="clearError('content')"
            ></textarea>
          </div>
          <p v-if="errors.content" class="mt-1 text-sm text-red-600">
            {{ errors.content }}
          </p>
        </div>

        <!-- 图片上传 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            图片
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            <div
              v-for="(image, index) in form.images"
              :key="index"
              class="relative group"
            >
              <img
                :src="image"
                alt="预览"
                class="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <i class="el-icon-close"></i>
              </button>
            </div>
            <label
              for="image-upload"
              class="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
            >
              <div class="text-center">
                <i class="el-icon-plus text-3xl text-gray-400"></i>
                <p class="mt-1 text-sm text-gray-500">添加图片</p>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleImageUpload"
              />
            </label>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="postStore.error" class="mb-6 rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="el-icon-warning text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                发布失败
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ postStore.error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="router.back()"
            class="btn-secondary"
            :disabled="postStore.isLoading"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="postStore.isLoading || !isFormValid"
            class="btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
          >
            <span v-if="postStore.isLoading">
              <i class="el-icon-loading mr-2"></i>
              发布中...
            </span>
            <span v-else>
              发布帖子
            </span>
          </button>
        </div>
      </form>
    </div>

    <!-- 预览 -->
    <div class="card mt-8">
      <h3 class="text-lg font-semibold mb-4">预览</h3>
      <div v-if="!form.content" class="text-gray-500 text-center py-8">
        输入内容后将在此处预览
      </div>
      <div v-else class="prose max-w-none">
        <h2>{{ form.title || '无标题' }}</h2>
        <div v-html="compiledMarkdown"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { usePostStore } from '@/stores/post'

const router = useRouter()
const postStore = usePostStore()

// 表单数据
const form = reactive({
  title: '',
  content: '',
  tags: [] as string[],
  images: [] as string[],
})

// 标签输入
const tagInput = ref('')

// 错误信息
const errors = reactive({
  title: '',
  content: '',
})

// 热门标签
const popularTags = ref<Array<{ tag: string; count: number }>>([])

// 表单验证
const isFormValid = computed(() => {
  return form.title.trim() && form.content.trim() && form.tags.length > 0
})

// 编译Markdown
const compiledMarkdown = computed(() => {
  if (!form.content) return ''
  return DOMPurify.sanitize(marked.parse(form.content) as string)
})

// 加载热门标签
const loadPopularTags = async () => {
  const result = await postStore.fetchPopularTags(10)
  if (result.success) {
    popularTags.value = result.tags
  }
}

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim()
  if (!tag) return
  
  if (form.tags.includes(tag)) {
    tagInput.value = ''
    return
  }
  
  if (form.tags.length >= 5) {
    alert('最多只能添加5个标签')
    return
  }
  
  form.tags.push(tag)
  tagInput.value = ''
}

// 添加热门标签
const addPopularTag = (tag: string) => {
  if (form.tags.includes(tag)) return
  if (form.tags.length >= 5) {
    alert('最多只能添加5个标签')
    return
  }
  form.tags.push(tag)
}

// 移除标签
const removeTag = (tag: string) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

// 清除错误
const clearError = (field: keyof typeof errors) => {
  errors[field] = ''
}

// 插入文本
const insertText = (before: string, after: string) => {
  const textarea = document.getElementById('content') as HTMLTextAreaElement
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.content.substring(start, end)
  
  const newText = form.content.substring(0, start) + 
                  before + selectedText + after + 
                  form.content.substring(end)
  
  form.content = newText
  
  // 恢复焦点和选择位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + before.length, end + before.length)
  }, 0)
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const files = Array.from(input.files)
  if (files.length + form.images.length > 9) {
    alert('最多只能上传9张图片')
    return
  }
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert(`文件 ${file.name} 不是图片`)
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert(`图片 ${file.name} 太大，请选择小于5MB的图片`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        form.images.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
  
  input.value = ''
}

// 移除图片
const removeImage = (index: number) => {
  form.images.splice(index, 1)
}

// 处理表单提交
const handleSubmit = async () => {
  // 验证
  if (!form.title.trim()) {
    errors.title = '标题不能为空'
    return
  }
  
  if (!form.content.trim()) {
    errors.content = '内容不能为空'
    return
  }
  
  if (form.tags.length === 0) {
    alert('请至少添加一个标签')
    return
  }
  
  const result = await postStore.createPost({
    title: form.title,
    content: form.content,
    tags: form.tags,
    images: form.images,
  })
  
  if (result.success) {
    // 发布成功，跳转到帖子详情页
    router.push(`/forums/${result.data.id}`)
  }
}

// 初始化
onMounted(() => {
  loadPopularTags()
})
</script>

<style scoped>
.prose {
  color: #374151;
}

.prose h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.prose h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  line-height: 1.625;
}

.prose ul {
  list-style-type: disc;
  padding-left: 1.625rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.625rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.prose li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
}
</style>