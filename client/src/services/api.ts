// client/src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // ✅ 为GET请求添加时间戳，防止缓存
    if (config.method === 'get') {
      // 确保params存在
      config.params = config.params || {}
      // 添加时间戳参数
      config.params._t = Date.now()
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ✅ 关键修改：响应拦截器
api.interceptors.response.use(
  (response) => {
    // 对于聊天接口，需要特殊处理
    const url = response.config.url || ''
    
    // ✅ 如果是聊天相关接口，返回整个响应对象
    if (url.includes('/chat/rooms/') && url.includes('/messages')) {
      console.log('💬 聊天消息接口，返回完整响应:', {
        url: url,
        状态: response.status,
        数据类型: typeof response.data,
        是否为数组: Array.isArray(response.data)
      })
      return response
    }
    
    // ✅ 对于其他接口，保持原来的行为（只返回data）
    return response.data
  },
  (error) => {
    console.error('❌ API请求错误:', {
      状态码: error.response?.status,
      错误信息: error.response?.data || error.message,
      请求URL: error.config?.url
    })
    
    // token过期处理
    if (error.response?.status === 401) {
      console.warn('⚠️ Token已过期，跳转到登录页')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 跳转到登录页
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api