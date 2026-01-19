// client/src/services/user.service.ts
import api from './api'
import type { User } from '@/types/user'

interface UpdateUserData {
  username?: string
  bio?: string
  avatar?: string
}

interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  // 添加这些属性来支持头像上传响应
  avatar?: string
  url?: string
  // 或者使用更通用的方式
  [key: string]: any
}

const userService = {
  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    try {
      console.log('🔍 开始获取用户信息...')
      const response = await api.get('/auth/me')
      console.log('✅ 获取用户信息成功:', response)
      
      const responseData = response.data
      
      if (responseData && responseData.success === true) {
        if (responseData.data) {
          console.log('📊 返回标准结构用户数据:', responseData.data)
          return responseData.data
        } else {
          const { success, message, ...userData } = responseData
          if (userData.id || userData.username) {
            return userData as User
          }
        }
      }
      
      if (responseData && (responseData.id || responseData.username)) {
        console.log('📊 返回直接用户对象:', responseData)
        return responseData
      }
      
      console.error('❌ 无法识别的API响应结构:', responseData)
      throw new Error('无法识别的API响应格式')
      
    } catch (error: any) {
      console.error('❌ 获取用户信息失败:', error.response || error)
      throw error
    }
  },

  // 更新用户信息（包括头像）
  async updateUser(data: UpdateUserData): Promise<ApiResponse<User>> {
    try {
      console.log('🔄 发送更新用户信息请求:', data)
      const response = await api.put('/user/profile', data)
      console.log('✅ 更新用户信息响应:', response.data)
      
      const responseData = response.data
      
      if (responseData && responseData.success === true) {
        console.log('✅ 更新用户信息成功（标准响应）')
        
        if (responseData.data) {
          return responseData
        } else {
          const { success, message, ...userData } = responseData
          return {
            success: true,
            data: userData as User,
            message: message || '更新成功'
          }
        }
      }
      
      if (responseData && (responseData.id || responseData.username)) {
        console.log('✅ 更新用户信息成功（直接用户对象）')
        return {
          success: true,
          data: responseData as User,
          message: '更新成功'
        }
      }
      
      console.warn('⚠️ API返回非标准响应，尝试解析:', responseData)
      return {
        success: true,
        data: responseData as User,
        message: '更新成功'
      }
      
    } catch (error: any) {
      console.error('❌ 更新用户信息失败:', error.response || error)
      throw error
    }
  },

  // 上传头像（通过Base64方式）- 修复这个方法
  async uploadAvatar(formData: FormData) {
    try {
      console.log('📤 上传头像文件...')
      
      // 从 FormData 中获取文件
      const file = formData.get('avatar') as File
      if (!file) {
        throw new Error('没有选择文件')
      }
      
      // 1. 将文件转换为 Base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            resolve(e.target.result.toString())
          } else {
            reject(new Error('文件读取失败'))
          }
        }
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsDataURL(file)
      })
      
      console.log('✅ 文件转换为Base64完成，长度:', base64String.length)
      
      // 2. 通过 updateUser 接口更新头像
      const response = await this.updateUser({ avatar: base64String })
      
      console.log('✅ 头像上传API响应:', response)
      return response
      
    } catch (error) {
      console.error('❌ 上传头像失败:', error)
      throw error
    }
  },

  // 更新密码
  async updatePassword(data: UpdatePasswordData) {
    try {
      console.log('🔐 发送更新密码请求:', data)
      const response = await api.put('/user/password', data)
      console.log('✅ 更新密码响应:', response.data)
      
      const responseData = response.data
      
      if (responseData && responseData.success === true) {
        console.log('✅ 更新密码成功')
        return responseData
      }
      
      if (responseData && responseData.error) {
        throw new Error(responseData.error)
      }
      
      return {
        success: true,
        message: '密码更新成功'
      }
      
    } catch (error: any) {
      console.error('❌ 更新密码失败:', error.response || error)
      throw error
    }
  },



// client/src/services/user.service.ts
// 修改 getUserStats 方法
async getUserStats(userId: string): Promise<ApiResponse> {
  try {
    const response = await api.get(`/users/${userId}/stats`)
    return response.data
  } catch (error: any) {
    console.error('获取用户统计失败:', error)
    return { 
      success: false, 
      error: error.response?.data?.message || '获取用户统计失败',
      data: { posts: 0, comments: 0, likes: 0 } // 返回默认值
    }
  }
}


}

// 如果需要全局访问，可以导出到 window
if (typeof window !== 'undefined') {
  (window as any).userService = userService
  console.log('🌍 userService 已全局导出')
}

export default userService