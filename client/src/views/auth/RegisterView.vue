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
          注册新账号
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          已有账号？
          <router-link to="/login" class="font-medium text-game-blue hover:text-game-purple transition-colors">
            立即登录
          </router-link>
        </p>
      </div>

      <!-- 注册表单 -->
      <div class="card">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 用户名 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              用户名
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
                placeholder="请输入用户名（3-20位字母、数字或下划线）"
                :class="{ 'border-red-300': errors.username }"
                @input="validateUsername"
              />
            </div>
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
            <p v-else class="mt-1 text-sm text-gray-500">
              用户名将用于显示和登录
            </p>
          </div>

          <!-- 邮箱 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              邮箱地址
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="el-icon-message text-gray-400"></i>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="input-field pl-10"
                placeholder="请输入有效的邮箱地址"
                :class="{ 'border-red-300': errors.email }"
                @input="validateEmail"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
            <p v-else class="mt-1 text-sm text-gray-500">
              用于接收重要通知和找回密码
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
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pl-10"
                placeholder="请输入密码（至少6位）"
                :class="{ 'border-red-300': errors.password }"
                @input="validatePassword"
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
            <div v-else class="mt-1">
              <div class="flex space-x-2 mb-1">
                <div 
                  :class="[
                    'h-1 flex-1 rounded',
                    passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-200'
                  ]"
                ></div>
                <div 
                  :class="[
                    'h-1 flex-1 rounded',
                    passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'
                  ]"
                ></div>
                <div 
                  :class="[
                    'h-1 flex-1 rounded',
                    passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-200'
                  ]"
                ></div>
                <div 
                  :class="[
                    'h-1 flex-1 rounded',
                    passwordStrength >= 4 ? 'bg-green-600' : 'bg-gray-200'
                  ]"
                ></div>
              </div>
              <p class="text-xs text-gray-500">
                密码强度: {{ passwordStrengthText }}
              </p>
            </div>
          </div>

          <!-- 确认密码 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              确认密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="el-icon-lock text-gray-400"></i>
              </div>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="input-field pl-10"
                placeholder="请再次输入密码"
                :class="{ 'border-red-300': errors.confirmPassword }"
                @input="validateConfirmPassword"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'el-icon-view' : 'el-icon-view-off'" class="text-gray-400 hover:text-gray-600"></i>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- 用户协议 -->
          <div class="flex items-center">
            <input
              id="terms"
              v-model="form.agreeTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-700">
              我已阅读并同意
              <a href="#" class="text-game-blue hover:text-game-purple transition-colors">
                用户协议
              </a>
              和
              <a href="#" class="text-game-blue hover:text-game-purple transition-colors">
                隐私政策
              </a>
            </label>
          </div>

          <!-- 错误信息 -->
          <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="el-icon-warning text-red-400"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  注册失败
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
                注册中...
              </span>
              <span v-else>
                立即注册
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- 提示信息 -->
      <div class="rounded-md bg-blue-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="el-icon-info text-blue-400"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              注册提示
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc pl-5 space-y-1">
                <li>用户名和邮箱在注册后不可更改</li>
                <li>请使用真实邮箱以便接收验证邮件</li>
                <li>建议使用强密码保护账号安全</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 密码强度计算
const passwordStrength = computed(() => {
  let strength = 0
  const password = form.password
  
  if (password.length >= 6) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  const texts = ['非常弱', '弱', '中等', '强', '非常强']
  return texts[strength]
})

// 表单验证方法
const validateUsername = () => {
  const username = form.username.trim()
  if (!username) {
    errors.username = '用户名不能为空'
  } else if (username.length < 3 || username.length > 20) {
    errors.username = '用户名长度必须在3-20位之间'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = '用户名只能包含字母、数字和下划线'
  } else {
    errors.username = ''
  }
}

const validateEmail = () => {
  const email = form.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    errors.email = '邮箱不能为空'
  } else if (!emailRegex.test(email)) {
    errors.email = '请输入有效的邮箱地址'
  } else {
    errors.email = ''
  }
}

const validatePassword = () => {
  const password = form.password
  
  if (!password) {
    errors.password = '密码不能为空'
  } else if (password.length < 6) {
    errors.password = '密码长度不能少于6位'
  } else {
    errors.password = ''
  }
  
  // 同时验证确认密码
  if (form.confirmPassword) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  const password = form.password
  const confirmPassword = form.confirmPassword
  
  if (!confirmPassword) {
    errors.confirmPassword = '请确认密码'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.confirmPassword = ''
  }
}

const validateForm = () => {
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  return !errors.username && !errors.email && !errors.password && !errors.confirmPassword && form.agreeTerms
}

// 处理注册
const handleRegister = async () => {
  if (!validateForm()) return
  
  // ✅ 修改这里：传递对象而不是多个参数
  const result = await authStore.register({
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password
  })
  
  if (result.success) {
    // 注册成功，跳转到首页
    router.push('/')
  }
}
</script>