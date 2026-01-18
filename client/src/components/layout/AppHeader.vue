<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- 左侧：Logo和导航 -->
        <div class="flex items-center space-x-8">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-game-blue rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">G</span>
            </div>
            <span class="text-xl font-bold text-gray-900">GameCommunity</span>
          </router-link>

          <!-- 导航菜单 -->
          <nav class="hidden md:flex space-x-4">
            <router-link 
              to="/" 
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-game-blue hover:bg-gray-100 transition-colors"
              active-class="text-game-blue bg-gray-100"
            >
              首页
            </router-link>
            <router-link 
              to="/forums" 
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-game-blue hover:bg-gray-100 transition-colors"
              active-class="text-game-blue bg-gray-100"
            >
              论坛
            </router-link>
            <router-link 
              to="/news" 
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-game-blue hover:bg-gray-100 transition-colors"
              active-class="text-game-blue bg-gray-100"
            >
              资讯
            </router-link>
            <router-link 
              to="/chat" 
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-game-blue hover:bg-gray-100 transition-colors"
              active-class="text-game-blue bg-gray-100"
            >
              聊天室
            </router-link>
          </nav>
        </div>

        <!-- 右侧：用户相关 -->
        <div class="flex items-center space-x-4">
          <!-- 搜索框 -->
          <div class="hidden md:block relative">
            <input
              type="text"
              placeholder="搜索帖子、用户..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-64"
            />
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
              <i class="el-icon-search text-gray-400"></i>
            </div>
          </div>

          <!-- 用户菜单 -->
          <div v-if="isAuthenticated" class="flex items-center space-x-3">
            <button 
              @click="goToChat"
              class="p-2 text-gray-600 hover:text-game-blue relative"
              title="聊天室"
            >
              <i class="el-icon-chat-dot-round text-xl"></i>
              <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ unreadCount }}
              </span>
            </button>
            
            <button 
              @click="goToNotifications"
              class="p-2 text-gray-600 hover:text-game-blue relative"
              title="通知"
            >
              <i class="el-icon-bell text-xl"></i>
              <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <!-- 用户头像下拉菜单 -->
  <div class="relative" ref="userMenuRef">
    <button 
      @click.stop="toggleDropdown"
      class="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 px-2 py-1 rounded transition-colors"
    >
      <img 
        :src="user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.username" 
        :alt="user?.username"
        class="w-8 h-8 rounded-full border-2 border-primary-500"
      />
      <span class="text-sm font-medium text-gray-700 hidden md:block">
        {{ user?.username }}
      </span>
      <i 
        :class="[
          'el-icon-arrow-down',
          'text-gray-500',
          'transition-transform',
          'duration-200',
          dropdownOpen ? 'transform rotate-180' : ''
        ]"
      ></i>
    </button>
              
              <!-- 下拉菜单 -->
              <div 
                v-if="dropdownOpen" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                @click.stop
              >
                <router-link 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="dropdownOpen = false"
                >
                  <i class="el-icon-user mr-2"></i>
                  个人中心
                </router-link>
                <router-link 
                  to="/settings" 
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="dropdownOpen = false"
                >
                  <i class="el-icon-setting mr-2"></i>
                  设置
                </router-link>
                <div class="border-t border-gray-100 my-1"></div>
                <button 
                  @click="logout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <i class="el-icon-switch-button mr-2"></i>
                  退出登录
                </button>
              </div>
            </div>
          </div>

          <!-- 登录/注册按钮 -->
          <div v-else class="flex items-center space-x-3">
            <router-link 
              to="/login" 
              class="text-sm font-medium text-gray-700 hover:text-game-blue transition-colors"
            >
              登录
            </router-link>
            <router-link 
              to="/register" 
              class="btn-primary text-sm"
            >
              注册
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const dropdownOpen = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const unreadCount = ref(3) // 临时测试数据

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const logout = () => {
  authStore.logout()
  router.push('/login')
  dropdownOpen.value = false
}

const goToChat = () => {
  router.push('/chat')
}

const goToNotifications = () => {
  // 暂时跳转到首页
  router.push('/')
}

// 点击其他地方关闭下拉菜单
document.addEventListener('click', () => {
  dropdownOpen.value = false
})
</script>