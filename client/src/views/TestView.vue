<!-- 前端：src/App.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 定义数据类型
interface TestData {
  success: boolean
  message: string
  timestamp: string
  data: {
    project: string
    version: string
    endpoints: string[]
  }
}

// 响应式数据
const apiResult = ref<TestData | null>(null)
const loading = ref(false)
const error = ref('')

// 1. 测试GET请求
const testGetAPI = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch('http://localhost:3000/api/test')
    const data = await response.json()
    apiResult.value = data
    console.log('✅ GET请求成功:', data)
  } catch (err) {
    error.value = '请求失败: ' + err
    console.error('❌ GET请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 2. 测试POST请求
const testLoginAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456'
      })
    })
    const data = await response.json()
    console.log('✅ 登录结果:', data)
    alert(data.message)
  } catch (err) {
    console.error('❌ 登录失败:', err)
  }
}

// 页面加载时自动测试
onMounted(() => {
  testGetAPI()
})
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-blue-600 mb-6">
      🎮 游戏社区平台 - 前后端联调测试
    </h1>
    
    <!-- 状态显示 -->
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">当前状态</h2>
      <p>前端: <span class="text-green-600 font-medium">http://localhost:5173</span></p>
      <p>后端: <span class="text-green-600 font-medium">http://localhost:3000</span></p>
    </div>
    
    <!-- 控制区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="p-6 bg-white shadow rounded-lg">
        <h3 class="text-xl font-semibold mb-4">API 测试</h3>
        
        <button 
          @click="testGetAPI"
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded mb-4 disabled:opacity-50"
        >
          {{ loading ? '请求中...' : '测试 GET /api/test' }}
        </button>
        
        <button 
          @click="testLoginAPI"
          class="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded"
        >
          测试 POST /api/login
        </button>
      </div>
      
      <!-- 结果显示 -->
      <div class="p-6 bg-white shadow rounded-lg">
        <h3 class="text-xl font-semibold mb-4">API 响应结果</h3>
        
        <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded">
          {{ error }}
        </div>
        
        <div v-if="apiResult" class="space-y-3">
          <div class="p-3 bg-green-50 border border-green-200 rounded">
            <p class="font-medium text-green-800">✅ {{ apiResult.message }}</p>
            <p class="text-sm text-gray-600 mt-1">时间: {{ apiResult.timestamp }}</p>
          </div>
          
          <div class="p-3 bg-blue-50 rounded">
            <p class="font-medium">项目: {{ apiResult.data.project }}</p>
            <p class="text-sm">版本: {{ apiResult.data.version }}</p>
          </div>
          
          <div>
            <p class="font-medium mb-2">可用接口:</p>
            <ul class="space-y-1">
              <li v-for="endpoint in apiResult.data.endpoints" 
                  :key="endpoint"
                  class="text-sm bg-gray-100 p-2 rounded">
                {{ endpoint }}
              </li>
            </ul>
          </div>
        </div>
        
        <div v-else-if="loading" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">正在请求后端数据...</p>
        </div>
      </div>
    </div>
    
    <!-- 调试信息 -->
    <div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h4 class="font-semibold text-yellow-800 mb-2">💡 调试提示</h4>
      <p class="text-sm text-yellow-700">
        1. 打开浏览器开发者工具（F12）查看控制台<br>
        2. 在"网络(Network)"标签页查看请求详情<br>
        3. 如果遇到跨域问题，确保后端启用了CORS
      </p>
    </div>
  </div>
</template>

<style scoped>
/* 简单的加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>