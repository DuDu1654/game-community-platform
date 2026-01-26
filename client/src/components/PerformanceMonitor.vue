<template>
  <div v-if="showMonitor" :style="dragStyle" class="fixed bottom-4 right-4 z-50" 
       @mousedown.prevent="startDrag" @touchstart.prevent="startDragTouch">
    
    <!-- 拖动句柄 -->
    <div class="absolute -top-8 right-0 bg-primary-600 text-white text-xs px-3 py-1 rounded-t-lg cursor-move">
      <i class="el-icon-rank mr-1"></i> 拖动
    </div>

    <div class="bg-white rounded-lg shadow-xl border border-gray-200 w-80">
      <!-- 头部 -->
<div class="flex items-center justify-between p-4 border-b border-gray-200">
  <h3 class="font-semibold text-gray-900 flex items-center">
    <i v-if="isMonitoring" class="el-icon-success text-green-600 mr-2"></i>
    <i v-else class="el-icon-error text-red-600 mr-2"></i>
    性能监控
  </h3>
  
  <div class="flex items-center space-x-2">
    <!-- 状态指示器 -->
    <div v-if="isMonitoring" class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    <div v-else class="w-2 h-2 bg-red-500 rounded-full"></div>
    
    <!-- 🆕 简化控制按钮组 -->
    <div class="flex items-center space-x-1">
      <!-- 关闭按钮 -->
      <button
        @click="closeMonitor"
        class="p-1 hover:bg-gray-100 rounded text-gray-600"
        title="关闭监控面板"
      >
        <span class="text-xs">× 关闭</span>
      </button>
      
      <!-- 其他控制按钮 -->
      <div class="flex items-center space-x-1 bg-gray-100 rounded p-1">
        <button
          @click="toggleMonitoring"
          class="p-1 hover:bg-white rounded text-xs"
          :title="isMonitoring ? '暂停监控' : '开始监控'"
        >
          {{ isMonitoring ? '⏸️' : '▶️' }}
        </button>
        
        <button
          @click="clearData"
          class="p-1 hover:bg-white rounded text-xs"
          title="清除数据"
        >
          🧹
        </button>
        
        <button
          @click="exportData"
          class="p-1 hover:bg-white rounded text-xs"
          title="导出数据"
        >
          💾
        </button>
      </div>
    </div>
  </div>
</div>

      <!-- 内容区域 -->
      <div class="p-4 max-h-[500px] overflow-y-auto">
        <!-- API测试区域 -->
        <div class="mb-4 p-3 bg-gray-50 rounded">
          <h4 class="font-medium text-gray-700 mb-2 text-sm">API测试工具</h4>
          <div class="grid grid-cols-3 gap-2">
            <!-- 修复：确保按钮是完整的，不只是图标 -->
            <button
              @click="testApi('fast')"
              class="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded flex items-center justify-center"
            >
              <i class="el-icon-success mr-1"></i>
              快速
            </button>
            
            <button
              @click="testApi('slow')"
              class="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-2 py-1 rounded flex items-center justify-center"
            >
              <i class="el-icon-time mr-1"></i>
              慢速
            </button>
            
            <button
              @click="testApi('error')"
              class="text-xs bg-red-100 text-red-800 hover:bg-red-200 px-2 py-1 rounded flex items-center justify-center"
            >
              <i class="el-icon-error mr-1"></i>
              错误
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">点击测试不同网络条件下的API响应</p>
        </div>

        <!-- 性能概览 -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-700 mb-3 text-sm flex items-center">
            <i class="el-icon-data-analysis mr-2"></i>
            性能概览
          </h4>
          <div class="grid grid-cols-4 gap-2">
            <div class="text-center p-2 bg-blue-50 rounded">
              <div class="text-lg font-semibold text-blue-700">
                {{ metrics.firstContentfulPaint || 0 }}ms
              </div>
              <div class="text-xs text-gray-600">首屏时间</div>
            </div>
            <div class="text-center p-2 bg-green-50 rounded">
              <div class="text-lg font-semibold text-green-700">
                {{ avgApiTime || 0 }}ms
              </div>
              <div class="text-xs text-gray-600">API延迟</div>
            </div>
            <div class="text-center p-2 bg-purple-50 rounded">
              <div class="text-lg font-semibold text-purple-700">
                {{ metrics.resourceTimings?.length || 0 }}
              </div>
              <div class="text-xs text-gray-600">资源数量</div>
            </div>
            <div class="text-center p-2 bg-yellow-50 rounded">
              <div class="text-lg font-semibold text-yellow-700">
                {{ metrics.interactionMetrics?.length || 0 }}
              </div>
              <div class="text-xs text-gray-600">用户交互</div>
            </div>
          </div>
        </div>

        <!-- API性能 -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-700 mb-3 text-sm flex items-center">
            <i class="el-icon-timer mr-2"></i>
            API性能
          </h4>
          <div class="space-y-2">
            <div v-for="api in recentApiCalls" :key="api.id" 
                 class="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded">
              <div class="flex items-center">
                <span :class="{
                  'text-green-600': api.status >= 200 && api.status < 300,
                  'text-red-600': api.status >= 400
                }" class="font-medium mr-2">
                  {{ api.method }}
                </span>
                <span class="text-gray-600 truncate max-w-[150px]">{{ getShortUrl(api.url) }}</span>
              </div>
              <div class="flex items-center">
                <span class="text-gray-500 text-xs mr-2">{{ formatTime(api.timestamp) }}</span>
                <span :class="{
                  'text-green-600': api.duration < 100,
                  'text-yellow-600': api.duration >= 100 && api.duration < 500,
                  'text-red-600': api.duration >= 500
                }" class="font-medium">
                  {{ api.duration }}ms
                </span>
              </div>
            </div>
            
            <div v-if="recentApiCalls.length === 0" class="text-center text-gray-500 text-sm py-4">
              <i class="el-icon-search mr-1"></i>
              暂无API请求数据
            </div>
          </div>
        </div>

        <!-- 网络信息 -->
        <div>
          <h4 class="font-medium text-gray-700 mb-3 text-sm flex items-center">
            <div class="flex items-center">
      <i class="el-icon-connection mr-2"></i>
      网络信息
    </div>
    <!-- 🔥 新增：网络信息刷新按钮 -->
    <button
      @click="refreshNetworkInfo"
      class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
      title="刷新网络信息"
    >
      <i class="el-icon-refresh mr-1"></i>
      刷新
    </button>
          </h4>
          <div class="grid grid-cols-2 gap-2">
            <div class="p-2 bg-gray-50 rounded">
              <div class="text-xs text-gray-500 mb-1">网络类型</div>
              <div class="font-medium">{{ networkType }}</div>
            </div>
            <div class="p-2 bg-gray-50 rounded">
              <div class="text-xs text-gray-500 mb-1">延迟</div>
              <div class="font-medium">{{ metrics.networkInfo?.rtt || 0 }}ms</div>
            </div>
            <div class="p-2 bg-gray-50 rounded col-span-2">
              <div class="text-xs text-gray-500 mb-1">下载速度</div>
              <div class="font-medium">{{ metrics.networkInfo?.downlink || 0 }} Mbps</div>
            <!-- 🔥 新增：网络速度指示器 -->
      <div class="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-green-500 transition-all duration-500"
          :style="{ width: networkSpeedPercentage + '%' }"
        ></div>
      </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <div class="text-gray-600 text-xs">
          <div>最后更新: {{ lastUpdate }}</div>
          <div v-if="isOnline" class="flex items-center text-green-600">
            <i class="el-icon-success mr-1"></i>
            在线
          </div>
          <div v-else class="flex items-center text-red-600">
            <i class="el-icon-error mr-1"></i>
            离线
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="refreshData"
            class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded flex items-center"
            title="刷新数据"
          >
            <i class="el-icon-refresh mr-1"></i>
            刷新
          </button>
          
          <button
            @click="sendToServer"
            class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
            title="发送到服务器"
          >
            <i class="el-icon-upload2 mr-1"></i>
            发送
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 打开按钮 -->
  <button
    v-else
    @click="showMonitor = true"
    class="fixed bottom-4 right-4 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors z-50"
    title="打开性能监控"
  >
    <i class="el-icon-monitor"></i>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive} from 'vue'
import { performanceMonitor, type PerformanceMetrics, setupPerformanceMonitoring } from '@/utils/performance'

// 状态管理
const showMonitor = ref(true)
const forceUpdate = ref(0)
const lastUpdate = ref('')
const isOnline = ref(navigator.onLine)
const isMonitoring = ref(true)

// 拖动状态
interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

const dragState = reactive<DragState>({
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0
})

// 计算属性
const dragStyle = computed(() => {
  const style: Record<string, string> = {
    transform: `translate(${dragState.currentX}px, ${dragState.currentY}px)`,
    cursor: dragState.isDragging ? 'grabbing' : 'grab',
  }
  
  if (dragState.isDragging) {
    style.userSelect = 'none'
  }
  
  return style
})

const metrics = computed(() => performanceMonitor.metrics)
const recentApiCalls = computed(() => [...metrics.value.apiResponseTimes].slice(-5).reverse())
const avgApiTime = computed(() => {
  if (metrics.value.apiResponseTimes.length === 0) return 0
  const sum = metrics.value.apiResponseTimes.reduce((total, api) => total + api.duration, 0)
  return Math.round(sum / metrics.value.apiResponseTimes.length)
})

const networkType = computed(() => {
  const effectiveType = metrics.value.networkInfo?.effectiveType || 'unknown'
  const types: Record<string, string> = {
    'slow-2g': '2G',
    '2g': '2G',
    '3g': '3G',
    '4g': '4G',
    '5g': '5G',
    'unknown': '未知'
  }
  return types[effectiveType] || effectiveType
})

// 方法
const getShortUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    if (path.length > 20) {
      return '...' + path.substring(path.length - 20)
    }
    return path
  } catch {
    if (url.length > 20) {
      return '...' + url.substring(url.length - 20)
    }
    return url
  }
}

// 计算下载速度（格式化显示）
const downloadSpeed = computed(() => {
  const downlink = metrics.value.networkInfo?.downlink || 0
  return downlink.toFixed(1) // 保留一位小数
})

// 计算网络速度百分比（用于进度条）
const networkSpeedPercentage = computed(() => {
  const downlink = metrics.value.networkInfo?.downlink || 0
  // 假设最大速度为 100 Mbps
  const maxSpeed = 100
  const percentage = Math.min((downlink / maxSpeed) * 100, 100)
  return Math.round(percentage)
})

// 🔥 新增：刷新网络信息的方法
const refreshNetworkInfo = async () => {
  console.log('🔄 刷新网络信息...')
  
  // 显示加载状态
  const originalNetworkType = networkType.value
  
  // 触发网络信息重新收集
  if ((performanceMonitor as any).refreshNetworkInfo) {
  await (performanceMonitor as any).refreshNetworkInfo()
}
  
  // 强制重新渲染
  forceUpdate.value++
  updateLastUpdate()
  
  alert(`网络信息已刷新\n\n网络类型: ${networkType.value}\n延迟: ${metrics.value.networkInfo?.rtt || 0}ms\n下载速度: ${downloadSpeed.value} Mbps`)
}


const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const updateLastUpdate = () => {
  const now = new Date()
  lastUpdate.value = now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// API测试
const testApi = async (type: 'fast' | 'slow' | 'error') => {
  const baseUrl = 'https://jsonplaceholder.typicode.com'
  let url = ''
  let message = ''
  
  switch (type) {
    case 'fast':
      url = `${baseUrl}/todos/1`
      message = '正在测试快速API...'
      break
    case 'slow':
      url = `${baseUrl}/todos/2`
      message = '正在测试慢速API（模拟1秒延迟）...'
      break
    case 'error':
      url = `${baseUrl}/invalid-endpoint`
      message = '正在测试错误API（404错误）...'
      break
  }
  
  alert(message)
  
  const startTime = performance.now()
  try {
    if (type === 'slow') {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    const response = await fetch(url)
    const data = await response.json()
    const duration = Math.round(performance.now() - startTime)
    
    alert(`✅ API测试成功！\nURL: ${url}\n状态: ${response.status}\n耗时: ${duration}ms`)
    
  } catch (error: any) {
    const duration = Math.round(performance.now() - startTime)
    alert(`❌ API测试失败！\nURL: ${url}\n错误: ${error.message}\n耗时: ${duration}ms`)
  }
}

// 控制方法
const toggleMonitoring = () => {
  isMonitoring.value = !isMonitoring.value
  if (isMonitoring.value) {
    performanceMonitor.startMonitoring()
  } else {
    performanceMonitor.stopMonitoring()
  }
}

const clearData = () => {
  if (confirm('确定要清除所有性能数据吗？')) {
    performanceMonitor.clear()
    forceUpdate.value++
  }
}

const exportData = () => {
  const data = performanceMonitor.exportData('json')
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  alert('数据已导出为JSON文件')
}

const closeMonitor = () => {
  showMonitor.value = false
}

const refreshData = () => {
  forceUpdate.value++
  updateLastUpdate()
  performanceMonitor.refreshPerformanceMetrics()
  alert('数据已刷新')
}

const sendToServer = async () => {
  try {
    const success = await performanceMonitor.sendToServer('/api/performance-metrics')
    if (success) {
      alert('✅ 性能数据已发送到服务器')
    } else {
      alert('❌ 发送失败，请检查服务器连接')
    }
  } catch (error) {
    alert('❌ 发送失败: ' + (error as Error).message)
  }
}

// 拖动功能
const startDrag = (e: MouseEvent) => {
  dragState.isDragging = true
  dragState.startX = e.clientX - dragState.currentX
  dragState.startY = e.clientY - dragState.currentY
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 拖动功能
const startDragTouch = (e: TouchEvent) => {
  if (e.touches?.[0]) {  // 使用可选链
    dragState.isDragging = true
    dragState.startX = e.touches[0].clientX - dragState.currentX!
    dragState.startY = e.touches[0].clientY - dragState.currentY!
    document.addEventListener('touchmove', onDragTouch)
    document.addEventListener('touchend', stopDrag)
  }
}

const onDrag = (e: MouseEvent) => {
  if (!dragState.isDragging) return
  dragState.currentX = e.clientX - dragState.startX
  dragState.currentY = e.clientY - dragState.startY
}

// 修复：同样添加可选链
const onDragTouch = (e: TouchEvent) => {
  if (!dragState.isDragging || !e.touches?.[0]) return
  e.preventDefault()
  dragState.currentX = e.touches[0].clientX - dragState.startX!
  dragState.currentY = e.touches[0].clientY - dragState.startY!
}

const stopDrag = () => {
  if (!dragState.isDragging) return
  dragState.isDragging = false
  
  // 边界限制
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const panelWidth = 320
  const panelHeight = 600
  
  if (dragState.currentX < -windowWidth + 100) {
    dragState.currentX = -windowWidth + 100
  } else if (dragState.currentX > windowWidth - panelWidth - 20) {
    dragState.currentX = windowWidth - panelWidth - 20
  }
  
  if (dragState.currentY < -windowHeight + 150) {
    dragState.currentY = -windowHeight + 150
  } else if (dragState.currentY > windowHeight - panelHeight - 20) {
    dragState.currentY = windowHeight - panelHeight - 20
  }
  
  // 保存位置
  localStorage.setItem('perf-monitor-position', JSON.stringify({
    x: dragState.currentX,
    y: dragState.currentY
  }))
  
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDragTouch)
  document.removeEventListener('touchend', stopDrag)
}

// 生命周期
onMounted(() => {
  console.log('🚀 PerformanceMonitor组件已挂载')
  
  // 加载保存的位置
  const savedPosition = localStorage.getItem('perf-monitor-position')
  if (savedPosition) {
    try {
      const { x, y } = JSON.parse(savedPosition)
      dragState.currentX = Math.max(x, -100)
      dragState.currentY = Math.max(y, -100)
    } catch (e) {
      localStorage.removeItem('perf-monitor-position')
    }
  }
  
  // 启动性能监控
  setupPerformanceMonitoring()
  
  // 注册更新监听器
  performanceMonitor.onUpdate(() => {
    forceUpdate.value++
    updateLastUpdate()
  })
  
  // 初始更新时间
  updateLastUpdate()
  
  // 网络状态监听
  window.addEventListener('online', () => {
    isOnline.value = true
  })
  window.addEventListener('offline', () => {
    isOnline.value = false
  })

  // 🔥 新增：添加网络信息变化的监听
  window.addEventListener('load', () => {
    // 等待页面完全加载后再收集网络信息
    setTimeout(() => {
      // 尝试获取最新网络信息
      const connection = (navigator as any).connection
      if (connection && connection.addEventListener) {
        connection.addEventListener('change', () => {
          console.log('📶 网络信息变化:', {
            effectiveType: connection.effectiveType,
            rtt: connection.rtt,
            downlink: connection.downlink
          })
          forceUpdate.value++ // 强制重新渲染
        })
      }
    }, 1000)
  })
  
  // 定时刷新
  const interval = setInterval(() => {
    forceUpdate.value++
    updateLastUpdate()
  }, 5000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})

onUnmounted(() => {
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
})
</script>

<style scoped>
.fixed {
  position: fixed;
}

.z-50 {
  z-index: 50;
}

.cursor-move {
  cursor: move;
}

.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

.user-select-none {
  user-select: none;
}

.max-h-\[500px\] {
  max-height: 500px;
}

.overflow-y-auto {
  overflow-y: auto;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-x-1 > * + * {
  margin-left: 0.25rem;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.max-w-\[150px\] {
  max-width: 150px;
}

.hover\:bg-gray-100:hover {
  background-color: rgba(243, 244, 246, 1);
}

.hover\:bg-green-200:hover {
  background-color: rgba(187, 247, 208, 1);
}

.hover\:bg-yellow-200:hover {
  background-color: rgba(254, 240, 199, 1);
}

.hover\:bg-red-200:hover {
  background-color: rgba(254, 202, 202, 1);
}

.hover\:bg-gray-300:hover {
  background-color: rgba(209, 213, 219, 1);
}

.hover\:bg-red-600:hover {
  background-color: rgba(220, 38, 38, 1);
}

.hover\:bg-primary-700:hover {
  background-color: rgba(29, 78, 216, 1);
}

.bg-primary-600 {
  background-color: rgba(37, 99, 235, 1);
}

.bg-green-100 {
  background-color: rgba(220, 252, 231, 1);
}

.bg-yellow-100 {
  background-color: rgba(254, 249, 195, 1);
}

.bg-red-100 {
  background-color: rgba(254, 226, 226, 1);
}

.bg-blue-50 {
  background-color: rgba(239, 246, 255, 1);
}

.bg-green-50 {
  background-color: rgba(240, 253, 244, 1);
}

.bg-purple-50 {
  background-color: rgba(250, 245, 255, 1);
}

.bg-yellow-50 {
  background-color: rgba(254, 252, 232, 1);
}

.bg-gray-50 {
  background-color: rgba(249, 250, 251, 1);
}

.bg-gray-200 {
  background-color: rgba(229, 231, 235, 1);
}

.bg-red-500 {
  background-color: rgba(239, 68, 68, 1);
}

.text-green-600 {
  color: rgba(22, 163, 74, 1);
}

.text-yellow-600 {
  color: rgba(202, 138, 4, 1);
}

.text-red-600 {
  color: rgba(220, 38, 38, 1);
}

.text-green-800 {
  color: rgba(22, 101, 52, 1);
}

.text-yellow-800 {
  color: rgba(133, 77, 14, 1);
}

.text-red-800 {
  color: rgba(153, 27, 27, 1);
}

.text-blue-700 {
  color: rgba(29, 78, 216, 1);
}

.text-green-700 {
  color: rgba(21, 128, 61, 1);
}

.text-purple-700 {
  color: rgba(126, 34, 206, 1);
}

.text-yellow-700 {
  color: rgba(161, 98, 7, 1);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>