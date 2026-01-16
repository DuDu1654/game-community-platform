// client/src/services/api.ts
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // 基础URL
  timeout: 10000,  // 10秒超时
})

// 请求拦截器 - 每次请求前执行
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 每次响应后执行
api.interceptors.response.use(
  (response) => {
    // 成功响应直接返回data
    return response.data
  },
  (error) => {
    console.error('API请求错误:', error)
    
    // token过期处理
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 跳转到登录页
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api