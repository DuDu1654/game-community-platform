<template>
  <footer class="bg-gray-900 text-white mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- 关于我们 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">关于我们</h3>
          <p class="text-gray-400 text-sm">
            专注于游戏社区的交流平台，提供最新的游戏资讯、攻略讨论和玩家互动。
          </p>
        </div>

        <!-- 快速链接 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">快速链接</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-gray-400 hover:text-white text-sm transition-colors">
                首页
              </router-link>
            </li>
            <li>
              <router-link to="/forums" class="text-gray-400 hover:text-white text-sm transition-colors">
                游戏论坛
              </router-link>
            </li>
            <li>
              <router-link to="/news" class="text-gray-400 hover:text-white text-sm transition-colors">
                游戏资讯
              </router-link>
            </li>
            <li>
              <router-link to="/chat" class="text-gray-400 hover:text-white text-sm transition-colors">
                在线聊天
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 联系我们 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">联系我们</h3>
          <ul class="space-y-2 text-gray-400 text-sm">
            <li>邮箱: support@gamecommunity.com</li>
            <li>QQ群: 123456789</li>
            <li>工作时间: 9:00 - 18:00</li>
          </ul>
        </div>

        <!-- 技术栈 -->
        <div>
          <h3 class="text-lg font-semibold mb-4">技术栈</h3>
          <div class="flex flex-wrap gap-2">
            <span class="badge badge-primary">Vue 3</span>
            <span class="badge badge-primary">TypeScript</span>
            <span class="badge badge-primary">Node.js</span>
            <span class="badge badge-primary">PostgreSQL</span>
            <span class="badge badge-primary">边缘计算</span>
          </div>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
        <p>© 2024 Game Community. 版权所有。毕业设计项目。</p>
        <p class="mt-1">基于边缘计算的高性能游戏社区平台</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 暂时没有逻辑
</script>