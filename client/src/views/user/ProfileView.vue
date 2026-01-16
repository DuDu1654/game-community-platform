<!-- client/src/views/user/ProfileView.vue -->
<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl font-bold text-gray-900">个人中心</h1>
      <span class="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
        用户功能开发中
      </span>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 左侧边栏 - 用户信息卡片 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
          <!-- 用户头像 -->
          <div class="flex flex-col items-center mb-6">
            <div class="w-32 h-32 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4">
              <span class="text-4xl">👤</span>
            </div>
            <h2 class="text-xl font-semibold text-gray-800">用户昵称</h2>
            <p class="text-gray-500 text-sm">@username</p>
            
            <!-- 用户标签 -->
            <div class="mt-3 flex flex-wrap justify-center gap-2">
              <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">普通用户</span>
              <span class="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">已认证</span>
              <span class="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">活跃用户</span>
            </div>
          </div>
          
          <!-- 用户统计 -->
          <div class="space-y-4 border-t border-gray-100 pt-6">
            <div v-for="stat in userStats" :key="stat.label" 
                 class="flex items-center justify-between">
              <span class="text-gray-600">{{ stat.label }}</span>
              <span class="font-medium text-gray-800">{{ stat.value }}</span>
            </div>
          </div>
          
          <!-- 编辑资料按钮 -->
          <router-link to="/settings" 
                       class="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <span class="mr-2">✏️</span>
            编辑个人资料
          </router-link>
        </div>
      </div>
      
      <!-- 右侧主内容区 -->
      <div class="lg:col-span-3 space-y-8">
        <!-- 个人信息卡片 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">基本信息</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="field in userInfo" :key="field.label" class="space-y-1">
                <label class="block text-sm font-medium text-gray-500">{{ field.label }}</label>
                <div class="flex items-center">
                  <span class="mr-2">{{ field.icon }}</span>
                  <p class="text-gray-800">{{ field.value }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 我的帖子 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800">我的帖子</h3>
              <span class="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">查看全部 →</span>
            </div>
          </div>
          <div class="p-6">
            <div v-for="(post, index) in myPosts" :key="index" 
                 class="border-b border-gray-100 last:border-0 py-4 hover:bg-gray-50 transition-colors rounded-lg px-3 -mx-3">
              <div class="flex items-start">
                <div class="flex-shrink-0 mr-4">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                    <span class="text-lg">📝</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-800 truncate mb-1">
                    {{ post.title }}
                  </h4>
                  <div class="flex items-center text-xs text-gray-500">
                    <span class="mr-3">{{ post.time }}</span>
                    <span class="mr-3">👁️ {{ post.views }}</span>
                    <span>💬 {{ post.comments }}</span>
                  </div>
                </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full" 
                      :class="post.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'">
                  {{ post.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </div>
            </div>
            
            <!-- 空状态提示 -->
            <div v-if="myPosts.length === 0" class="text-center py-8">
              <div class="inline-block p-3 rounded-full bg-gray-100 mb-4">
                <span class="text-2xl text-gray-400">📝</span>
              </div>
              <h4 class="text-lg font-medium text-gray-600 mb-2">暂无帖子</h4>
              <p class="text-gray-500 mb-4">您还没有发布过任何帖子</p>
              <router-link to="/forums" 
                           class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                去发帖
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- 最近评论 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800">最近评论</h3>
          </div>
          <div class="p-6">
            <div v-for="(comment, index) in recentComments" :key="index" 
                 class="border-b border-gray-100 last:border-0 py-4">
              <div class="flex items-start">
                <div class="flex-shrink-0 mr-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-r from-green-50 to-blue-50 flex items-center justify-center">
                    <span class="text-sm">💬</span>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-gray-800 mb-2">{{ comment.content }}</p>
                  <div class="flex items-center text-xs text-gray-500">
                    <span>在 <span class="text-blue-600 hover:text-blue-800 cursor-pointer">{{ comment.postTitle }}</span> 中</span>
                    <span class="mx-2">•</span>
                    <span>{{ comment.time }}</span>
                    <span class="mx-2">•</span>
                    <span>👍 {{ comment.likes }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 空状态提示 -->
            <div v-if="recentComments.length === 0" class="text-center py-8">
              <div class="inline-block p-3 rounded-full bg-gray-100 mb-4">
                <span class="text-2xl text-gray-400">💬</span>
              </div>
              <h4 class="text-lg font-medium text-gray-600 mb-2">暂无评论</h4>
              <p class="text-gray-500">您还没有发表过任何评论</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 用户统计数据
const userStats = ref([
  { label: '帖子数量', value: '0' },
  { label: '评论数量', value: '0' },
  { label: '获得点赞', value: '0' },
  { label: '注册天数', value: '1' },
  { label: '最后活跃', value: '刚刚' }
])

// 用户信息
const userInfo = ref([
  { label: '用户名', value: 'user123', icon: '👤' },
  { label: '电子邮箱', value: 'user@example.com', icon: '📧' },
  { label: '注册时间', value: '2024-01-08', icon: '📅' },
  { label: '个人简介', value: '这个人很懒，还没有写简介...', icon: '📝' },
  { label: '所在地', value: '未设置', icon: '📍' },
  { label: '联系方式', value: '未设置', icon: '📱' }
])

// 我的帖子
const myPosts = ref<any[]>([])

// 最近评论
const recentComments = ref<any[]>([])
</script>