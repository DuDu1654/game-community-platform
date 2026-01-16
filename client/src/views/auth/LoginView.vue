<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 animate-fade-in">
      <!-- Logo和标题 -->
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-game-blue rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white text-2xl font-bold">G</span>
          </div>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          登录到游戏社区
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          还没有账号？
          <router-link to="/register" class="font-medium text-game-blue hover:text-game-purple transition-colors">
            立即注册
          </router-link>
        </p>
      </div>

      <!-- 登录表单 -->
      <div class="card">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用户名或邮箱 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              用户名或邮箱
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="el-icon-user text-gray-400"></i>
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="input-field pl-10"
                placeholder="请输入用户名或邮箱"
                :class="{ 'border-red-300': errors.username }"
              />
            </div>
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- 密码 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="el-icon-lock text-gray-400"></i>
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="input-field pl-10"
                placeholder="请输入密码"
                :class="{ 'border-red-300': errors.password }"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'el-icon-view' : 'el-icon-view-off'" class="text-gray-400 hover:text-gray-600"></i>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- 记住我和忘记密码 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                记住我
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-game-blue hover:text-game-purple transition-colors">
                忘记密码？
              </a>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="el-icon-warning text-red-400"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  登录失败
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ authStore.error }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div>
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-game-blue hover:bg-game-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="authStore.isLoading">
                <i class="el-icon-loading mr-2"></i>
                登录中...
              </span>
              <span v-else>
                登录
              </span>
            </button>
          </div>

          <!-- 分割线 -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">其他登录方式</span>
            </div>
          </div>

          <!-- 社交登录 -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <i class="el-icon-mobile-phone mr-2"></i>
              QQ登录
            </button>
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <i class="el-icon-user mr-2"></i>
              微信登录
            </button>
          </div>
        </form>
      </div>

      <!-- 演示账号提示 -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          测试账号: testuser / password123
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)

const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  username: '',
  password: '',
})

// 表单验证
const validateForm = () => {
  let isValid = true
  errors.username = ''
  errors.password = ''

  if (!form.username.trim()) {
    errors.username = '用户名或邮箱不能为空'
    isValid = false
  }

  if (!form.password) {
    errors.password = '密码不能为空'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度不能少于6位'
    isValid = false
  }

  return isValid
}

// 处理登录
const handleLogin = async () => {
  if (!validateForm()) return

  try {
    // 确保发送正确的JSON格式
    const credentials = {
      username: form.username,
      password: form.password
    }
    
    console.log('发送的登录数据:', credentials) // 调试用
    
    const result = await authStore.login(credentials) // 改为发送对象
    
    if (result.success) {
      if (form.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
      router.push('/')
    }
  } catch (err) {
    console.error('登录错误:', err)
  }
}

onMounted(() => {
  if (localStorage.getItem('rememberMe') === 'true') {
    form.rememberMe = true
  }
})
</script>