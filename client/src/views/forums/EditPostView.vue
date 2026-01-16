<!-- client/src/views/forums/EditPostView.vue -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 头部 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">编辑帖子</h1>
      <p class="mt-2 text-gray-600">修改你的帖子内容</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">加载帖子中...</p>
    </div>

    <!-- 帖子不存在 -->
    <div v-else-if="!currentPost" class="text-center py-12">
      <span class="text-5xl mb-4 block">📄</span>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">帖子不存在</h2>
      <p class="text-gray-600 mb-6">您要编辑的帖子可能已被删除或不存在</p>
      <router-link to="/forums" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        返回论坛
      </router-link>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="card">
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
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(tag)"
                class="ml-1 hover:text-red-600"
              >
                ×
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
              class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              添加
            </button>
          </div>
        </div>

        <!-- 内容编辑器 -->
        <div class="mb-6">
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            内容
          </label>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-300 p-2">
              <span class="text-sm text-gray-500">
                {{ form.content.length }}/10000
              </span>
            </div>
            
            <textarea
              id="content"
              v-model="form.content"
              required
              rows="12"
              class="w-full px-4 py-3 focus:outline-none resize-none"
              placeholder="请输入帖子内容..."
              :class="{ 'border-red-300': errors.content }"
              @input="clearError('content')"
            ></textarea>
          </div>
          <p v-if="errors.content" class="mt-1 text-sm text-red-600">
            {{ errors.content }}
          </p>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage" class="mb-6 rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="text-red-400">⚠️</span>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                编辑失败
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isSubmitting"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">
              保存中...
            </span>
            <span v-else>
              保存修改
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const currentPost = ref<any>(null)

// 表单数据
const form = reactive({
  title: '',
  content: '',
  tags: [] as string[],
})

// 标签输入
const tagInput = ref('')

// 错误信息
const errors = reactive({
  title: '',
  content: '',
})

// 表单验证
const isFormValid = computed(() => {
  return form.title.trim() && form.content.trim() && form.tags.length > 0
})

// 加载帖子数据
const loadPost = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    const postId = route.params.id as string
    const response = await api.get(`/posts/${postId}`)
    
    if (response.data) {
      currentPost.value = response.data
      form.title = response.data.title || ''
      form.content = response.data.content || ''
      
      // 处理标签
      if (response.data.tags) {
        if (typeof response.data.tags === 'string') {
          // 如果是逗号分隔的字符串
          form.tags = response.data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        } else if (Array.isArray(response.data.tags)) {
          form.tags = [...response.data.tags]
        }
      }
    } else {
      errorMessage.value = '帖子不存在'
    }
  } catch (err: any) {
    console.error('加载帖子失败:', err)
    errorMessage.value = err.response?.data?.error || '加载帖子失败'
  } finally {
    loading.value = false
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
  errorMessage.value = ''
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
  
  try {
    isSubmitting.value = true
    errorMessage.value = ''
    
    const postId = route.params.id as string
    
    const response = await api.put(`/posts/${postId}`, {
      title: form.title,
      content: form.content,
      tags: form.tags,
    })
    
    if (response.data.success || response.data.id) {
      // 编辑成功，跳转到帖子详情页
      router.push(`/forums/${postId}`)
    } else {
      errorMessage.value = response.data.error || '编辑失败'
    }
  } catch (err: any) {
    console.error('编辑帖子失败:', err)
    errorMessage.value = err.response?.data?.error || err.message || '编辑失败'
  } finally {
    isSubmitting.value = false
  }
}

// 初始化
onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>