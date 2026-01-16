<!-- client/src/views/admin/DashboardView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 管理后台头部 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">管理后台</h1>
          <p class="text-gray-600 mt-2">管理游戏社区平台的所有内容和用户</p>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-right">
            <p class="text-sm text-gray-500">管理员</p>
            <p class="font-medium text-gray-800">admin</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
            <span class="text-xl">👑</span>
          </div>
        </div>
      </div>
      
      <!-- 管理员状态栏 -->
      <div class="mt-4 flex items-center">
        <div class="flex items-center px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full mr-3">
          <span class="mr-1">🚧</span>
          开发版本
        </div>
        <div class="text-sm text-gray-500">
          最后更新: 2024-01-08 15:30
        </div>
      </div>
    </div>
    
    <!-- 统计数据卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in stats" :key="stat.title" 
           class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500">{{ stat.title }}</h3>
          <div class="p-2 rounded-lg" :class="stat.bgColor">
            <span class="text-lg">{{ stat.icon }}</span>
          </div>
        </div>
        <div class="flex items-baseline">
          <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
          <p class="ml-2 text-sm font-medium" :class="stat.change > 0 ? 'text-green-600' : 'text-red-600'">
            {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
          </p>
        </div>
        <p class="mt-1 text-xs text-gray-500">相比上月</p>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 左侧内容 -->
      <div class="lg:col-span-2 space-y-8">
        <!-- 快捷操作 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">快捷操作</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button v-for="action in quickActions" :key="action.label" 
                      class="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                <div class="p-3 rounded-full mb-2" :class="action.bgColor">
                  <span class="text-xl">{{ action.icon }}</span>
                </div>
                <span class="font-medium text-gray-800 group-hover:text-blue-600">{{ action.label }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 最近活动 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800">最近活动</h3>
              <span class="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">查看全部 →</span>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.id" 
                   class="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex-shrink-0 mr-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="activity.bgColor">
                    <span class="text-sm">{{ activity.icon }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-800">{{ activity.description }}</p>
                  <div class="flex items-center mt-1 text-xs text-gray-500">
                    <span>{{ activity.user }}</span>
                    <span class="mx-2">•</span>
                    <span>{{ activity.time }}</span>
                  </div>
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded-full" 
                      :class="getStatusClass(activity.type)">
                  {{ getStatusLabel(activity.type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧边栏 -->
      <div class="space-y-8">
        <!-- 系统状态 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">系统状态</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="status in systemStatus" :key="status.label" 
                   class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="p-1 rounded mr-3" :class="status.bgColor">
                    <span class="text-lg">{{ status.icon }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ status.label }}</p>
                    <p class="text-sm text-gray-500">{{ status.description }}</p>
                  </div>
                </div>
                <span class="text-sm font-medium" 
                      :class="status.status === 'normal' ? 'text-green-600' : 
                              status.status === 'warning' ? 'text-yellow-600' : 'text-red-600'">
                  {{ status.value }}
                </span>
              </div>
            </div>
            
            <!-- 系统健康度 -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-800">系统健康度</span>
                <span class="text-sm font-semibold text-green-600">95%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" style="width: 95%"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 待处理事项 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800">待处理</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                {{ pendingItems.length }}
              </span>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div v-for="item in pendingItems" :key="item.id" 
                   class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div class="flex items-center">
                  <div class="p-2 rounded mr-3" :class="item.bgColor">
                    <span class="text-sm">{{ item.icon }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ item.title }}</p>
                    <p class="text-xs text-gray-500">{{ item.subtitle }}</p>
                  </div>
                </div>
                <button class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  处理
                </button>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="pendingItems.length === 0" class="text-center py-6">
              <div class="inline-block p-3 rounded-full bg-green-100 mb-3">
                <span class="text-xl text-green-600">✅</span>
              </div>
              <p class="text-sm font-medium text-gray-800 mb-1">暂无待处理事项</p>
              <p class="text-xs text-gray-500">所有工作都已处理完毕</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 开发进度 -->
    <div class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
      <div class="flex items-start">
        <div class="flex-shrink-0 mr-4">
          <span class="text-2xl">🚀</span>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">管理后台开发进度</h3>
          <div class="space-y-4">
            <div v-for="module in developmentModules" :key="module.name" 
                 class="flex items-center">
              <span class="w-32 text-sm text-gray-600">{{ module.name }}</span>
              <div class="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                <div class="h-2 rounded-full transition-all duration-500" 
                     :class="module.bgColor" 
                     :style="{ width: module.progress + '%' }"></div>
              </div>
              <span class="text-sm font-medium" :class="module.textColor">
                {{ module.progress }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- client/src/views/admin/DashboardView.vue（续） -->
<script setup lang="ts">
import { onMounted } from 'vue'

// 统计数据
const stats = [
  { 
    title: '总用户数', 
    value: '2,841', 
    change: 12.5, 
    icon: '👥', 
    bgColor: 'bg-blue-100' 
  },
  { 
    title: '今日活跃', 
    value: '156', 
    change: 8.2, 
    icon: '🔥', 
    bgColor: 'bg-red-100' 
  },
  { 
    title: '总帖子数', 
    value: '5,672', 
    change: 5.7, 
    icon: '📝', 
    bgColor: 'bg-green-100' 
  },
  { 
    title: '今日新增', 
    value: '42', 
    change: 15.3, 
    icon: '📈', 
    bgColor: 'bg-purple-100' 
  }
]

// 快捷操作
const quickActions = [
  { label: '新增用户', icon: '👤', bgColor: 'bg-blue-100' },
  { label: '内容审核', icon: '📋', bgColor: 'bg-green-100' },
  { label: '数据分析', icon: '📊', bgColor: 'bg-yellow-100' },
  { label: '系统设置', icon: '⚙️', bgColor: 'bg-purple-100' },
  { label: '公告管理', icon: '📢', bgColor: 'bg-red-100' },
  { label: '日志查看', icon: '📁', bgColor: 'bg-indigo-100' }
]

// 最近活动
const recentActivities = [
  { 
    id: 1, 
    type: 'user', 
    description: '新用户 "游戏玩家" 注册成功', 
    user: '系统', 
    time: '2分钟前', 
    icon: '👤', 
    bgColor: 'bg-blue-100' 
  },
  { 
    id: 2, 
    type: 'content', 
    description: '帖子 "最新游戏攻略" 发布成功', 
    user: 'user123', 
    time: '15分钟前', 
    icon: '📝', 
    bgColor: 'bg-green-100' 
  },
  { 
    id: 3, 
    type: 'report', 
    description: '收到一条新的举报信息', 
    user: '匿名用户', 
    time: '1小时前', 
    icon: '⚠️', 
    bgColor: 'bg-red-100' 
  },
  { 
    id: 4, 
    type: 'system', 
    description: '系统自动备份完成', 
    user: '系统', 
    time: '2小时前', 
    icon: '💾', 
    bgColor: 'bg-purple-100' 
  }
]

// 系统状态
const systemStatus = [
  { 
    label: 'API 服务', 
    value: '运行正常', 
    status: 'normal', 
    icon: '🌐', 
    bgColor: 'bg-green-100', 
    description: '后端接口服务' 
  },
  { 
    label: '数据库', 
    value: '运行正常', 
    status: 'normal', 
    icon: '🗃️', 
    bgColor: 'bg-blue-100', 
    description: 'PostgreSQL 数据库' 
  },
  { 
    label: '缓存服务', 
    value: '运行正常', 
    status: 'normal', 
    icon: '⚡', 
    bgColor: 'bg-yellow-100', 
    description: 'Redis 缓存服务' 
  },
  { 
    label: '存储空间', 
    value: '85%', 
    status: 'warning', 
    icon: '💾', 
    bgColor: 'bg-orange-100', 
    description: '磁盘使用率' 
  }
]

// 待处理事项
const pendingItems = [
  { 
    id: 1, 
    title: '待审核帖子', 
    subtitle: '3 条内容需要审核', 
    icon: '📋', 
    bgColor: 'bg-blue-100' 
  },
  { 
    id: 2, 
    title: '用户举报', 
    subtitle: '2 条举报待处理', 
    icon: '⚠️', 
    bgColor: 'bg-red-100' 
  },
  { 
    id: 3, 
    title: '反馈建议', 
    subtitle: '5 条新建议', 
    icon: '💡', 
    bgColor: 'bg-green-100' 
  }
]

// 开发模块
const developmentModules = [
  { name: '用户管理', progress: 100, bgColor: 'bg-green-500', textColor: 'text-green-600' },
  { name: '内容管理', progress: 80, bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
  { name: '系统监控', progress: 60, bgColor: 'bg-yellow-500', textColor: 'text-yellow-600' },
  { name: '数据分析', progress: 40, bgColor: 'bg-purple-500', textColor: 'text-purple-600' },
  { name: '权限管理', progress: 30, bgColor: 'bg-red-500', textColor: 'text-red-600' }
]

// 获取状态标签
const getStatusLabel = (type: string) => {
  const labels: Record<string, string> = {
    'user': '用户',
    'content': '内容',
    'report': '举报',
    'system': '系统'
  }
  return labels[type] || '未知'
}

// 获取状态类
const getStatusClass = (type: string) => {
  const classes: Record<string, string> = {
    'user': 'bg-blue-100 text-blue-600',
    'content': 'bg-green-100 text-green-600',
    'report': 'bg-red-100 text-red-600',
    'system': 'bg-purple-100 text-purple-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  console.log('DashboardView: 管理后台页面加载成功')
  // 这里未来会加载管理数据
})
</script>

<style scoped>
/* 自定义样式 */
</style>