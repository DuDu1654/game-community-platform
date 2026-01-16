<!-- client/src/views/chat/ChatView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">社区聊天功能</h1>
      <p class="text-gray-600">实时交流，与游戏伙伴畅聊</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- 左侧聊天室列表 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">聊天室列表</h2>
          <div class="space-y-3">
            <div v-for="n in 5" :key="n" 
                 class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span>💬</span>
                </div>
                <div>
                  <p class="font-medium text-gray-800">聊天室 {{ n }}</p>
                  <p class="text-xs text-gray-500">在线: 0 人</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧聊天区域 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- 聊天头部 -->
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-800">游戏交流大厅</h3>
            <p class="text-sm text-gray-500">与社区伙伴实时交流</p>
          </div>
          
          <!-- 聊天内容区域 -->
          <div class="h-96 p-4 bg-gray-50 overflow-y-auto">
            <!-- 系统消息 -->
            <div class="text-center mb-4">
              <span class="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                🎮 欢迎来到游戏聊天室
              </span>
            </div>
            
            <!-- 示例消息 -->
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span>👤</span>
                </div>
                <div class="flex-1">
                  <div class="bg-white rounded-lg rounded-tl-none p-3 border border-gray-200">
                    <p class="text-gray-800">大家好！有人一起玩游戏吗？</p>
                    <p class="text-xs text-gray-500 mt-1">14:30</p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-start justify-end">
                <div class="flex-1 max-w-xs">
                  <div class="bg-blue-500 text-white rounded-lg rounded-tr-none p-3">
                    <p>我在玩，可以一起组队！</p>
                    <p class="text-xs text-blue-200 mt-1">14:32</p>
                  </div>
                </div>
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ml-3">
                  <span>👤</span>
                </div>
              </div>
            </div>
            
            <!-- 功能提示 -->
            <div class="mt-8 text-center">
              <div class="inline-block p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <span class="text-3xl mb-2 block">💬</span>
                <h4 class="text-lg font-medium text-gray-800 mb-2">聊天功能开发中</h4>
                <p class="text-gray-600">实时聊天功能正在积极开发中，将支持文本、图片、表情等多种消息类型。</p>
              </div>
            </div>
          </div>
          
          <!-- 消息输入框（静态） -->
          <div class="p-4 border-t border-gray-200">
            <div class="flex items-center">
              <div class="flex-1">
                <div class="border border-gray-300 rounded-lg overflow-hidden">
                  <input type="text" 
                         class="w-full px-4 py-3 focus:outline-none"
                         placeholder="输入消息... (功能开发中)"
                         disabled>
                </div>
              </div>
              <button class="ml-3 px-4 py-3 bg-gray-200 text-gray-400 font-medium rounded-lg cursor-not-allowed">
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 功能说明 -->
    <div class="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
      <div class="flex items-start">
        <div class="flex-shrink-0 mr-4">
          <span class="text-2xl">🚧</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">聊天功能开发进度</h3>
          <p class="text-gray-600 mb-3">
            聊天功能正在积极开发中，预计包含以下特性：
          </p>
          <ul class="list-disc list-inside text-gray-600 space-y-1">
            <li>实时文本聊天，支持多人同时在线</li>
            <li>图片、表情、文件传输功能</li>
            <li>创建公开/私密聊天室</li>
            <li>消息记录保存和搜索</li>
            <li>@提及用户和消息通知</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简单的静态页面，没有复杂逻辑
console.log('ChatView: 聊天页面加载成功')
</script>

<style scoped>
/* 简单的样式 */
</style>