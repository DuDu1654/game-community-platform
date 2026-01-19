// client/src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginData, RegisterData, ApiResponse } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // 初始化用户信息
  const initUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('解析用户信息失败:', err)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }


  // 确保有 setUser 方法
  const setUser = (userData: Partial<User>) => {
    if (user.value) {
      // 更新现有用户
      user.value = { ...user.value, ...userData }
    } else {
      // 创建新用户
      user.value = {
        id: userData.id || '',
        username: userData.username || '',
        email: userData.email || '',
        avatar: userData.avatar || '',
        bio: userData.bio || '',
        role: userData.role || 'USER',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString()
      }
    }
    
    // 如果需要，存储到localStorage
    if (userData.username) {
      localStorage.setItem('username', userData.username)
    }
  }

  // 登录（修改为接收对象参数）
  const login = async (credentials: LoginData) => {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('发送到后端的登录数据:', credentials) // 调试用
      
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials) // 确保只stringify一次
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('登录响应数据:', data) // 调试用
      
      if (data.success) {
        token.value = data.token
        user.value = data.user
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        return { success: true, data }
      } else {
        error.value = data.error || '登录失败'
        return { success: false, error: error.value }
      }
    } catch (err: any) {
      console.error('完整登录错误:', err)
      error.value = err.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }
  // 注册
const register = async (data: { username: string; email: string; password: string }) => {
  isLoading.value = true
  error.value = null
  
  try {
    console.log('🎯 发送注册请求...')
    console.log('注册数据:', data)
    console.log('JSON化的数据:', JSON.stringify(data))
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    
    console.log('📥 响应状态码:', response.status)
    console.log('📥 响应状态文本:', response.statusText)
    
    // 首先获取原始响应文本
    const responseText = await response.text()
    console.log('📥 原始响应文本:', responseText)
    
    let result
    try {
      result = JSON.parse(responseText)
      console.log('✅ 解析后的响应数据:', result)
    } catch (parseError) {
      console.error('❌ 解析JSON失败:', parseError)
      console.error('原始响应文本:', responseText)
      error.value = '服务器返回了无效的响应格式'
      return { success: false, error: error.value }
    }
    
    if (result.success) {
      console.log('✅ 注册成功')
      // 自动登录
      token.value = result.token
      user.value = result.user
      
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      
      return { success: true, data: result }
    } else {
      console.error('❌ 注册失败:', result.error)
      error.value = result.error || '注册失败'
      return { success: false, error: error.value }
    }
  } catch (err: any) {
    console.error('💥 注册异常:', err)
    error.value = err.message || '注册失败'
    return { success: false, error: error.value }
  } finally {
    isLoading.value = false
  }
}

  // 退出登录
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 检查登录状态
  const checkAuth = async () => {
    if (!token.value) {
      return false
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          user.value = data.user
          localStorage.setItem('user', JSON.stringify(data.user))
          return true
        }
      }
      
      logout()
      return false
    } catch (err: any) {
      console.error('检查登录状态失败:', err)
      logout()
      return false
    }
  }

  // 更新用户信息的方法
  const updateUser = (userData: Partial<User>) => {
    console.log('🏪 authStore.updateUser 被调用:', userData)
    
    if (user.value) {
      // 合并用户数据
      user.value = { ...user.value, ...userData }
      
      // 更新 localStorage
      localStorage.setItem('user', JSON.stringify(user.value))
      
      console.log('✅ authStore.user 已更新:', user.value)
      return { success: true, user: user.value }
    } else {
      console.error('❌ 更新用户信息失败：用户未登录')
      return { success: false, error: '用户未登录' }
    }
  }

  // 初始化
  initUser()

  return {
    // 状态
    user,
    token,
    isLoading,
    error,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    
    // 方法
    setUser,
    login,
    register,
    logout,
    checkAuth,
    updateUser // ✅ 导出这个方法
  }
})