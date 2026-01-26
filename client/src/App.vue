<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- 头部导航栏 -->
    <AppHeader v-if="showHeader" />
    
    <!-- 页面内容区域 -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 性能监控组件 -->
    <PerformanceMonitor />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import PerformanceMonitor from '@/components/PerformanceMonitor.vue'

const route = useRoute()

// 根据当前路由决定是否显示头部
const showHeader = computed(() => {
  return !(route.meta.hideNavbar || false)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>