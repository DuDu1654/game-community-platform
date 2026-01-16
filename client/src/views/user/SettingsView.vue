<!-- client/src/views/user/SettingsView.vue -->
<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">账号设置</h1>
      <p class="text-gray-600">管理您的账号信息和隐私设置</p>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  <div class="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mr-4">
                    <span class="text-2xl">👤</span>
                  </div>
                  <div>
                    <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                      更换头像
                    </button>
                    <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，大小不超过 5MB</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                <input type="text" id="username" 
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                       placeholder="请输入用户名"
                       value="user123">
                <p class="text-xs text-gray-500 mt-1">用户名用于社区显示，修改后需要重新登录</p>
              </div>
              
              <div>
                <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                <textarea id="bio" rows="3"
                          class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="介绍一下你自己...">这个人很懒，还没有写简介...</textarea>
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
                         class="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                         value="user@example.com"
                         disabled>
                  <span class="ml-3 px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">已验证</span>
                </div>
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                <input type="tel" id="phone" 
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                       placeholder="请输入手机号码">
              </div>
            </div>
          </div>
          
          <!-- 保存按钮 -->
          <div class="pt-4">
            <button class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              保存更改
            </button>
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
                  <button :class="[
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
                  <button class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
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
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                       placeholder="请输入当前密码">
              </div>
              
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input type="password" id="newPassword" 
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                       placeholder="请输入新密码">
                <p class="text-xs text-gray-500 mt-1">密码至少8位，包含字母和数字</p>
              </div>
              
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <input type="password" id="confirmPassword" 
                       class="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                       placeholder="请再次输入新密码">
              </div>
              
              <button class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                修改密码
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
                <button v-else class="text-red-600 text-sm hover:text-red-800 transition-colors">
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
                  <button :class="[
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
import { ref } from 'vue'

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
</script>