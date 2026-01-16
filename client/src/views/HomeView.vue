<template>
  <div class="animate-fade-in">
    <!-- 英雄区域 -->
    <div class="bg-gradient-to-r from-game-blue to-game-purple text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            欢迎来到游戏社区
          </h1>
          <p class="text-xl mb-8 max-w-2xl mx-auto">
            一个专注于游戏资讯、攻略讨论和玩家互动的平台。与20,000+玩家一起探索游戏世界！
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/forums" 
              class="btn-primary bg-white text-game-blue hover:bg-gray-100"
            >
              进入论坛
            </router-link>
            <router-link 
              to="/register" 
              class="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white/10"
            >
              立即加入
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 特性展示 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          平台特性
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          我们致力于提供最佳的游戏社区体验，结合前沿技术优化加载速度与交互体验。
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <!-- 特性1 -->
        <div class="card text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="el-icon-lightning text-2xl text-primary-600"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">极速加载</h3>
          <p class="text-gray-600">
            基于边缘计算技术，将内容缓存至离您最近的节点，大幅提升页面加载速度。
          </p>
        </div>

        <!-- 特性2 -->
        <div class="card text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="el-icon-chat-line-square text-2xl text-green-600"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">实时互动</h3>
          <p class="text-gray-600">
            支持实时聊天、帖子回复通知，让您不错过任何重要讨论。
          </p>
        </div>

        <!-- 特性3 -->
        <div class="card text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="el-icon-data-analysis text-2xl text-purple-600"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">性能优化</h3>
          <p class="text-gray-600">
            采用Vue 3响应式优化，配合高效的API设计，确保高并发下的稳定运行。
          </p>
        </div>
      </div>
    </div>

    <!-- 技术栈展示 -->
    <div class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            技术栈
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            项目采用现代Web开发技术栈，结合边缘计算优化性能。
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-2xl font-bold text-blue-600 mb-2">Vue 3</div>
            <p class="text-gray-600 text-sm">响应式前端框架</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-2xl font-bold text-green-600 mb-2">Node.js</div>
            <p class="text-gray-600 text-sm">高性能后端运行时</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-2xl font-bold text-red-600 mb-2">PostgreSQL</div>
            <p class="text-gray-600 text-sm">关系型数据库</p>
          </div>
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-2xl font-bold text-yellow-600 mb-2">边缘计算</div>
            <p class="text-gray-600 text-sm">低延迟内容分发</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能对比 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          性能对比
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          通过边缘计算优化，页面加载速度提升明显。
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">边缘计算 vs 传统部署</h3>
          <p class="text-gray-600 mb-4">
            以下为模拟测试数据，展示了边缘计算在降低延迟方面的优势。
          </p>
        </div>

        <div class="space-y-6">
          <!-- 延迟对比 -->
          <div>
            <div class="flex justify-between mb-2">
              <span class="font-medium">API响应延迟</span>
              <span class="font-medium">边缘计算: 45ms | 传统: 120ms</span>
            </div>
            <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full" style="width: 60%"></div>
              <div class="h-full bg-green-500 rounded-full -mt-4" style="width: 25%"></div>
            </div>
            <div class="flex justify-between text-sm text-gray-500 mt-1">
              <span>边缘计算降低62.5%延迟</span>
              <span>传统部署</span>
            </div>
          </div>

          <!-- 加载时间对比 -->
          <div>
            <div class="flex justify-between mb-2">
              <span class="font-medium">首屏加载时间</span>
              <span class="font-medium">边缘计算: 1.2s | 传统: 3.2s</span>
            </div>
            <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full" style="width: 80%"></div>
              <div class="h-full bg-green-500 rounded-full -mt-4" style="width: 30%"></div>
            </div>
            <div class="flex justify-between text-sm text-gray-500 mt-1">
              <span>边缘计算降低62.5%加载时间</span>
              <span>传统部署</span>
            </div>
          </div>
        </div>

        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="el-icon-info text-blue-400 text-xl"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                论文研究重点
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>
                  本毕业设计将重点研究边缘计算在Web应用中的性能优化效果，通过实际数据对比验证边缘计算的优势。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 行动召唤 -->
    <div class="bg-gradient-to-r from-game-blue to-game-purple text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 class="text-3xl font-bold mb-4">
          准备好加入游戏社区了吗？
        </h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto">
          立即注册，与20,000+玩家一起讨论游戏攻略、分享游戏资讯！
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/register" 
            class="btn-primary bg-white text-game-blue hover:bg-gray-100"
          >
            免费注册
          </router-link>
          <router-link 
            to="/forums" 
            class="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white/10"
          >
            浏览论坛
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加一些交互逻辑
</script>