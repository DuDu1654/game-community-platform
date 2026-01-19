<!-- client/src/views/user/SettingsView.vue -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">账号设置</h1>
      <p class="text-gray-600">管理您的账号信息和隐私设置</p>
    </div>
    
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-600">加载中...</p>
    </div>
    
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- 设置选项卡 -->
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button v-for="tab in tabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
                    'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]">
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.name }}
          </button>
        </nav>
      </div>
      
      <!-- 账户设置 -->
      <div v-if="activeTab === 'account'" class="p-6">
        <div class="space-y-8">
          <!-- 基本信息 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">头像</label>
                <div class="flex items-center">
                  <div class="relative w-16 h-16 mr-4">
                    <!-- 头像显示 -->
                    <img v-if="formData.avatar" 
                         :src="formData.avatar" 
                         class="w-16 h-16 object-cover rounded-full border-2 border-white shadow-sm"
                         :alt="user.username">
                    <div v-else 
                         class="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <span class="text-2xl">👤</span>
                    </div>
                  </div>
                  <div>
                    <button @click="uploadAvatar"
                            :disabled="isSaving"
                            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {{ isUploading ? '上传中...' : '更换头像' }}
                    </button>
                    <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，大小不超过 5MB</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input type="text" id="username" 
                       v-model="formData.username"
                       :disabled="isSaving"
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                       placeholder="请输入用户名">
                <p class="text-xs text-gray-500 mt-1">用户名用于社区显示，修改后需要重新登录</p>
              </div>
              
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                <textarea id="bio" rows="3"
                          v-model="formData.bio"
                          :disabled="isSaving"
                          class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="介绍一下你自己..."></textarea>
              </div>
            </div>
          </div>
          
          <!-- 联系信息 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">联系信息</h3>
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
                <div class="flex items-center">
                  <input type="email" id="email" 
                         :value="user.email"
                         class="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                         disabled>
                  <span class="ml-3 px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">已验证</span>
                </div>
              </div>
              
              <!-- 手机号暂时隐藏 -->
              <!-- <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                <input type="tel" id="phone" 
                       v-model="formData.phone"
                       :disabled="isSaving"
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                       placeholder="请输入手机号码">
              </div> -->
            </div>
          </div>
          
          <!-- 保存按钮 -->
          <div class="pt-4 flex items-center space-x-4">
            <button @click="saveUserInfo" 
                    :disabled="isSaving || !hasChanges"
                    :class="[
                      'px-6 py-2 bg-blue-600 text-white font-medium rounded-lg transition-colors',
                      isSaving || !hasChanges
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    ]">
              {{ isSaving ? '保存中...' : '保存更改' }}
            </button>
            
            <div v-if="saveMessage" 
                 :class="[
                   'text-sm px-3 py-1 rounded',
                   saveMessage.type === 'success' 
                     ? 'bg-green-100 text-green-600' 
                     : 'bg-red-100 text-red-600'
                 ]">
              {{ saveMessage.text }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 隐私设置 -->
      <div v-if="activeTab === 'privacy'" class="p-6">
        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">隐私设置</h3>
            <div class="space-y-4">
              <div v-for="setting in privacySettings" :key="setting.id" 
                   class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 class="font-medium text-gray-800">{{ setting.title }}</h4>
                  <p class="text-sm text-gray-600">{{ setting.description }}</p>
                </div>
                <div class="flex items-center">
                  <button @click="togglePrivacySetting(setting.id)"
                          :class="[
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            setting.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          ]">
                    <span :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    ]"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 数据导出 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">数据管理</h3>
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="flex items-start">
                <div class="flex-shrink-0 mr-4">
                  <span class="text-2xl">📥</span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-800 mb-2">导出个人数据</h4>
                  <p class="text-sm text-gray-600 mb-4">导出您在本站的所有数据，包括帖子、评论、个人信息等</p>
                  <button class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          @click="exportData">
                    请求数据导出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 安全设置 -->
      <div v-if="activeTab === 'security'" class="p-6">
        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">密码与安全</h3>
            <div class="space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                <input type="password" id="currentPassword" 
                       v-model="passwordForm.currentPassword"
                       :disabled="isUpdatingPassword"
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                       placeholder="请输入当前密码">
              </div>
              
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input type="password" id="newPassword" 
                       v-model="passwordForm.newPassword"
                       :disabled="isUpdatingPassword"
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                       placeholder="请输入新密码">
                <p class="text-xs text-gray-500 mt-1">密码至少8位，包含字母和数字</p>
              </div>
              
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <input type="password" id="confirmPassword" 
                       v-model="passwordForm.confirmPassword"
                       :disabled="isUpdatingPassword"
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                       placeholder="请再次输入新密码">
              </div>
              
              <!-- 错误提示 -->
              <div v-if="passwordError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {{ passwordError }}
              </div>
              
              <!-- 成功提示 -->
              <div v-if="passwordSuccess" class="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                密码修改成功！
              </div>
              
              <button @click="updatePassword" 
                      :disabled="isUpdatingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword"
                      :class="[
                        'px-6 py-2 bg-blue-600 text-white font-medium rounded-lg transition-colors',
                        isUpdatingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      ]">
                {{ isUpdatingPassword ? '修改中...' : '修改密码' }}
              </button>
            </div>
          </div>
          
          <!-- 登录记录 -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">登录记录</h3>
            <div class="space-y-3">
              <div v-for="session in loginSessions" :key="session.id" 
                   class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-medium text-gray-800">{{ session.device }}</p>
                  <p class="text-sm text-gray-600">{{ session.location }} • {{ session.time }}</p>
                </div>
                <span v-if="session.current" class="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                  当前设备
                </span>
                <button v-else class="text-red-600 text-sm hover:text-red-800 transition-colors"
                        @click="logoutDevice(session.id)">
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 通知设置 -->
      <div v-if="activeTab === 'notifications'" class="p-6">
        <div class="space-y-8">
          <div v-for="category in notificationCategories" :key="category.id">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ category.name }}</h3>
            <div class="space-y-4">
              <div v-for="item in category.items" :key="item.id" 
                   class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 class="font-medium text-gray-800">{{ item.title }}</h4>
                  <p class="text-sm text-gray-600">{{ item.description }}</p>
                </div>
                <div class="flex items-center">
                  <button @click="toggleNotification(item.id)"
                          :class="[
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            item.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          ]">
                    <span :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      item.enabled ? 'translate-x-6' : 'translate-x-1'
                    ]"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import userService from '@/services/user.service'

// 添加这行 ↓
import { useAuthStore } from '@/stores/auth'
// 导入 router
import { useRouter } from 'vue-router'  // ✅ 添加这行

import type { User } from '@/types/user'

// 初始化 auth store
const authStore = useAuthStore()

// ✅ 创建 router 实例
const router = useRouter()

// 活动选项卡
const activeTab = ref('account')

// 选项卡数据
const tabs = ref([
  { id: 'account', name: '账户', icon: '👤' },
  { id: 'privacy', name: '隐私', icon: '🔒' },
  { id: 'security', name: '安全', icon: '🛡️' },
  { id: 'notifications', name: '通知', icon: '🔔' }
])

// 隐私设置
const privacySettings = ref([
  { 
    id: 'profileVisibility', 
    title: '个人资料公开', 
    description: '允许其他用户查看您的个人资料',
    enabled: true 
  },
  { 
    id: 'onlineStatus', 
    title: '在线状态显示', 
    description: '在社区中显示您的在线状态',
    enabled: true 
  },
  { 
    id: 'activityVisibility', 
    title: '活动记录公开', 
    description: '公开您的发帖、评论等活动记录',
    enabled: false 
  },
  { 
    id: 'messageFromStrangers', 
    title: '接收陌生人消息', 
    description: '允许非好友用户向您发送消息',
    enabled: true 
  }
])

// 登录会话
const loginSessions = ref([
  { 
    id: 1, 
    device: 'Windows Chrome 浏览器', 
    location: '北京, 中国', 
    time: '2024-01-08 14:30', 
    current: true 
  },
  { 
    id: 2, 
    device: 'Android Chrome 浏览器', 
    location: '北京, 中国', 
    time: '2024-01-07 20:15', 
    current: false 
  },
  { 
    id: 3, 
    device: 'iPhone Safari 浏览器', 
    location: '上海, 中国', 
    time: '2024-01-05 10:45', 
    current: false 
  }
])

// 通知设置
const notificationCategories = ref([
  {
    id: 'community',
    name: '社区通知',
    items: [
      { 
        id: 'postReply', 
        title: '帖子回复', 
        description: '当有人回复您的帖子时通知您',
        enabled: true 
      },
      { 
        id: 'commentReply', 
        title: '评论回复', 
        description: '当有人回复您的评论时通知您',
        enabled: true 
      },
      { 
        id: 'postLike', 
        title: '帖子点赞', 
        description: '当有人点赞您的帖子时通知您',
        enabled: true 
      },
      { 
        id: 'commentLike', 
        title: '评论点赞', 
        description: '当有人点赞您的评论时通知您',
        enabled: false 
      }
    ]
  },
  {
    id: 'system',
    name: '系统通知',
    items: [
      { 
        id: 'systemUpdate', 
        title: '系统更新', 
        description: '系统更新和维护通知',
        enabled: true 
      },
      { 
        id: 'policyChange', 
        title: '政策变更', 
        description: '社区规则和政策变更通知',
        enabled: true 
      },
      { 
        id: 'securityAlert', 
        title: '安全提醒', 
        description: '账号安全相关提醒',
        enabled: true 
      }
    ]
  }
])

// 用户数据
const user = ref({
  id: '',
  username: '',
  email: '',
  avatar: '',
  bio: '',
  role: 'USER' as 'USER' | 'ADMIN',
  isActive: true,
  createdAt: '',
  updatedAt: ''
})

// 表单数据
const formData = reactive({
  username: '',
  bio: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 状态
const isLoading = ref(false)
const isSaving = ref(false)
const isUpdatingPassword = ref(false)
const isUploading = ref(false)
const saveMessage = ref<{type: 'success' | 'error', text: string} | null>(null)
const passwordError = ref('')
const passwordSuccess = ref(false)

// 计算属性：是否有更改
const hasChanges = computed(() => {
  return formData.username !== user.value.username ||
         formData.bio !== (user.value.bio || '')
})

// 加载用户数据
const loadUserData = async () => {
  isLoading.value = true
  try {
    const response = await userService.getCurrentUser()
    user.value = response as any
    formData.username = response.username
    formData.bio = response.bio || ''
    formData.avatar = response.avatar || ''
    console.log('✅ 用户数据加载成功:', response)
  } catch (error) {
    console.error('加载用户数据失败:', error)
    saveMessage.value = {
      type: 'error',
      text: '加载用户信息失败'
    }
  } finally {
    isLoading.value = false
  }
}

const saveUserInfo = async () => {
  if (!hasChanges.value) return
  
  isSaving.value = true
  saveMessage.value = null
  
  try {
    const updateData: any = {}
    if (formData.username !== user.value.username) {
      updateData.username = formData.username
    }
    if (formData.bio !== (user.value.bio || '')) {
      updateData.bio = formData.bio
    }
    
    console.log('📤 发送更新数据:', updateData)
    
    const response = await userService.updateUser(updateData)
    console.log('📥 更新用户信息响应:', response)
    
    if (response && (response.success === true || response.data)) {
      const updatedData = (response as any).data || response
      
      if (updatedData) {
        console.log('🔄 更新用户信息...')
        
        // 1. 更新本地 user
        user.value = { ...user.value, ...updatedData }
        
        // 2. 更新 authStore
        updateAuthStore(updatedData)
        
        // 3. 更新 localStorage
        updateLocalStorage(updatedData)
        
        saveMessage.value = {
          type: 'success',
          text: (response as any).message || '保存成功！'
        }
        
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
      }
      
    } else {
      throw new Error((response as any)?.error || '保存失败')
    }
    
  } catch (error: any) {
    console.error('保存用户信息失败:', error)
    saveMessage.value = {
      type: 'error',
      text: error.response?.data?.error || error.message || '保存失败，请重试'
    }
  } finally {
    isSaving.value = false
  }
}

// 方法1：使用可选链操作符
const updateAuthStore = (userData: any) => {
  if (!authStore) {
    console.warn('❌ authStore 不存在')
    return
  }
  
  console.log('🔧 更新 authStore...')
  console.log('authStore.user 之前:', authStore.user)
  
  // 使用更安全的合并方式
  const mergedUser = authStore.user 
    ? { ...authStore.user, ...userData }  // 如果存在则合并
    : userData  // 不存在则直接用新数据
    
  console.log('🔄 合并后的用户数据:', mergedUser)
  
  // 现在用 mergedUser 更新
  if (authStore.updateUser && typeof authStore.updateUser === 'function') {
    console.log('✅ 使用方法: updateUser()')
    authStore.updateUser(mergedUser)
  } else if (authStore.$patch && typeof authStore.$patch === 'function') {
    console.log('✅ 使用方法: $patch()')
    authStore.$patch({ user: mergedUser })
  } else if (typeof authStore.setUser === 'function') {
    console.log('✅ 使用方法: setUser()')
    authStore.setUser(mergedUser)
  } else if (authStore.user && typeof authStore.user === 'object') {
    console.log('✅ 使用方法: Object.assign()')
    Object.assign(authStore.user, userData)
  } else {
    console.error('❌ 无法找到可用的更新方法')
    
    // 最后的方法：直接赋值
    if ('user' in authStore) {
      authStore.user = mergedUser
      console.log('✅ 通过直接赋值更新成功')
    }
  }
  
  console.log('authStore.user 之后:', authStore.user)
}

// 更新 localStorage
const updateLocalStorage = (userData: any) => {
  console.log('💾 更新 localStorage...')
  
  // 获取当前存储的用户
  const storedUserStr = localStorage.getItem('user')
  if (storedUserStr) {
    try {
      const storedUser = JSON.parse(storedUserStr)
      const updatedUser = { ...storedUser, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      console.log('✅ localStorage.user 已更新')
    } catch (error) {
      console.error('解析用户信息失败:', error)
    }
  }
  
  // 单独存储用户名
  if (userData.username) {
    localStorage.setItem('username', userData.username)
    console.log('✅ localStorage.username 已更新:', userData.username)
  }
}

// 修改密码
const updatePassword = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    passwordError.value = '请填写所有密码字段'
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }
  
  if (passwordForm.newPassword.length < 8) {
    passwordError.value = '密码至少需要8位'
    return
  }
  
  isUpdatingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = false
  
  try {
    console.log('🔐 发送密码更新请求...')
    await userService.updatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    passwordSuccess.value = true
    setTimeout(() => {
      passwordSuccess.value = false
    }, 3000)
    
  } catch (error: any) {
    console.error('更新密码失败:', error)
    passwordError.value = error.response?.data?.error || '密码修改失败'
  } finally {
    isUpdatingPassword.value = false
  }
}

// 上传头像 - 简化优化版
const uploadAvatar = () => {
  // 创建文件输入框
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/png,image/gif,image/webp'
  input.onchange = async (e) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    if (!file) return

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('只支持 JPG、PNG、GIF、WEBP 格式的图片')
      return
    }

    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过5MB')
      return
    }

    isUploading.value = true
    saveMessage.value = null

    try {
      console.log('📤 开始处理头像文件:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)}KB`
      })

      // 1. 生成 Base64 预览
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            resolve(event.target.result.toString())
          } else {
            reject(new Error('文件读取失败'))
          }
        }
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsDataURL(file)
      })

      console.log('✅ 生成Base64预览完成')

      // 2. 立即显示预览
      user.value.avatar = base64String
      formData.avatar = base64String

      // 3. 创建 FormData
      const formDataToSend = new FormData()
      formDataToSend.append('avatar', file)
      console.log('📦 FormData创建完成')

      // 4. 上传到服务器
      console.log('🚀 开始调用上传接口...')
      let response
      
      // 先尝试使用 uploadAvatar
      if (userService.uploadAvatar) {
        try {
          console.log('使用 uploadAvatar 方法')
          response = await userService.uploadAvatar(formDataToSend)
        } catch (avatarError) {
          console.warn('uploadAvatar 失败，尝试 updateUser:', avatarError)
          // 如果失败，尝试使用 updateUser
          response = await userService.updateUser({ avatar: base64String })
        }
      } else {
        // 如果没有 uploadAvatar，直接使用 updateUser
        console.log('使用 updateUser 方法')
        response = await userService.updateUser({ avatar: base64String })
      }
      
      console.log('📥 服务器响应:', response)

      // 5. 处理响应
      if (response) {
        // 获取返回的头像URL
        let avatarUrl = ''
        
        if (response.avatar) {
          avatarUrl = response.avatar
        } else if (response.data && response.data.avatar) {
          avatarUrl = response.data.avatar
        } else if (response.url) {
          avatarUrl = response.url
        } else {
          // 如果没有返回新的URL，使用我们的Base64
          avatarUrl = base64String
        }
        
        console.log('✅ 头像URL:', avatarUrl.substring(0, 50) + '...')

        // 6. 更新所有数据
        user.value.avatar = avatarUrl
        formData.avatar = avatarUrl

        // 7. 更新 authStore
        if (authStore && authStore.user) {
          console.log('🔧 更新 authStore...')
          
          // 创建新的用户对象
          const updatedUser = { ...authStore.user, avatar: avatarUrl }
          
          // 尝试各种更新方法
          if (typeof authStore.updateUser === 'function') {
            authStore.updateUser(updatedUser)
            console.log('✅ 通过 updateUser 方法更新')
          } else if (typeof authStore.$patch === 'function') {
            authStore.$patch({ user: updatedUser })
            console.log('✅ 通过 $patch 更新')
          } else if (typeof authStore.setUser === 'function') {
            authStore.setUser(updatedUser)
            console.log('✅ 通过 setUser 更新')
          } else if (authStore.user && typeof authStore.user === 'object') {
            // 直接修改
            Object.assign(authStore.user, { avatar: avatarUrl })
            console.log('✅ 通过 Object.assign 更新')
          } else if ('user' in authStore) {
            // 最后的方法：直接赋值
            authStore.user = updatedUser
            console.log('✅ 通过直接赋值更新')
          }
          
          console.log('authStore.user 更新完成:', authStore.user)
        }

        // 8. 更新 localStorage
        try {
          const storedUserStr = localStorage.getItem('user')
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr)
            storedUser.avatar = avatarUrl
            localStorage.setItem('user', JSON.stringify(storedUser))
            console.log('💾 localStorage 已更新')
          }
        } catch (storageError) {
          console.warn('更新 localStorage 失败:', storageError)
        }

        // 9. 显示成功消息
        saveMessage.value = {
          type: 'success',
          text: response.message || '头像更新成功！'
        }

        console.log('✅ 头像更新流程完成')
        
      } else {
        throw new Error('服务器没有返回数据')
      }

    } catch (error: any) {
      console.error('❌ 上传头像失败:', error)
      
      // 显示错误信息
      const errorMsg = error.response?.data?.error || error.message || '上传失败，请重试'
      saveMessage.value = {
        type: 'error',
        text: errorMsg
      }
      
      // 恢复之前的头像
      try {
        const storedUserStr = localStorage.getItem('user')
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr)
          if (storedUser.avatar) {
            user.value.avatar = storedUser.avatar
            formData.avatar = storedUser.avatar
            console.log('🔄 已恢复之前的头像')
          }
        }
      } catch (e) {
        console.error('恢复头像失败:', e)
      }
    } finally {
      isUploading.value = false
      setTimeout(() => {
        saveMessage.value = null
      }, 3000)
    }
  }
  input.click()
}

// 切换隐私设置
const togglePrivacySetting = (id: string) => {
  const setting = privacySettings.value.find(s => s.id === id)
  if (setting) {
    setting.enabled = !setting.enabled
    // TODO: 这里应该调用API保存设置
    console.log('🔧 更新隐私设置:', id, setting.enabled)
  }
}

// 切换通知设置
const toggleNotification = (id: string) => {
  for (const category of notificationCategories.value) {
    const item = category.items.find(i => i.id === id)
    if (item) {
      item.enabled = !item.enabled
      // TODO: 这里应该调用API保存设置
      console.log('🔔 更新通知设置:', id, item.enabled)
      break
    }
  }
}

// 退出设备
const logoutDevice = (id: number) => {
  console.log('🔐 退出设备:', id)
  // TODO: 实现退出登录功能
  alert('退出登录功能待实现')
}

// 导出数据
const exportData = () => {
  console.log('📤 请求导出数据')
  // TODO: 实现数据导出功能
  alert('数据导出功能待实现')
}

// 页面加载时获取数据
onMounted(() => {
  console.log('🔍 开始加载用户数据...')
  loadUserData()
})
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>