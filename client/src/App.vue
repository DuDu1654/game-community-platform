<!-- src/App.vue - 正式应用框架 -->
<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- 头部导航栏（正式应用才有） -->
    <AppHeader v-if="showHeader" />
    
    <!-- 页面内容区域 -->
    <main class="flex-1">
      <router-view />
    </main>
    
    <!-- 页脚（正式应用才有） -->
    <AppFooter v-if="showFooter" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()

// 根据当前路由决定是否显示头部和页脚
const showHeader = computed(() => {
  const hideNavbar = route.meta.hideNavbar || false
  return !hideNavbar
})

const showFooter = computed(() => {
  const hideNavbar = route.meta.hideNavbar || false
  return !hideNavbar
})
</script>

<style>
/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>