// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 🔥 修改导入顺序
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 先注册Vue插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 🔥 延迟加载性能监控，避免阻塞主应用
if (import.meta.env.DEV) {
  // 使用动态导入，避免阻塞
  import('@/utils/performance').then(({ setupPerformanceMonitoring }) => {
    console.log('🚀 性能监控模块加载完成')
    
    // 延迟初始化，确保Vue应用已完全挂载
    setTimeout(() => {
      try {
        setupPerformanceMonitoring()
        console.log('✅ 性能监控已启动')
      } catch (error) {
        console.warn('⚠️ 性能监控启动失败:', error)
        // 但不影响应用继续运行
      }
    }, 1000) // 延迟1秒执行
  }).catch(error => {
    console.warn('⚠️ 性能监控模块加载失败:', error)
  })
}




// 🔥 修复1：在路由守卫中重新初始化监控
let isPerformanceMonitorInitialized = false

router.beforeEach((to, from, next) => {
  console.log(`🔄 路由跳转: ${from.path} -> ${to.path}`)
  
  // 🔥 每次路由跳转时重置性能监控
  if (window.performanceMonitor) {
    // 清除旧数据
    window.performanceMonitor.clear()
    
    // 重新收集页面加载指标
    if (!isPerformanceMonitorInitialized) {
      // 第一次初始化
      import('@/utils/performance').then(({ setupPerformanceMonitoring }) => {
        setupPerformanceMonitoring()
        console.log('✅ 性能监控已初始化')
        isPerformanceMonitorInitialized = true
      }).catch(error => {
        console.warn('⚠️ 性能监控模块加载失败:', error)
      })
    } else {
      // 重新收集当前页面的性能数据
      setTimeout(() => {
        if (window.performanceMonitor) {
          // 重新收集页面性能指标
          window.performanceMonitor.collectPerformanceMetrics()
          console.log('🔄 重新收集页面性能数据')
        }
      }, 100) // 等待DOM更新
    }
  }
  
  next()
})

// 🔥 修复2：立即初始化性能监控
if (import.meta.env.DEV) {
  console.log('🚀 正在初始化性能监控...')
  
  // 使用立即执行函数，避免阻塞
  setTimeout(() => {
    import('@/utils/performance').then(({ setupPerformanceMonitoring }) => {
      setupPerformanceMonitoring()
      console.log('✅ 性能监控已启动')
      
      // 监听页面可见性变化
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.performanceMonitor) {
          // 页面重新可见时，重新收集数据
          window.performanceMonitor.collectPerformanceMetrics()
          console.log('👀 页面重新可见，刷新性能数据')
        }
      })
    }).catch(error => {
      console.warn('⚠️ 性能监控模块加载失败:', error)
    })
  }, 500) // 稍微延迟以避免阻塞应用启动
}



// 挂载应用
app.mount('#app')

console.log('🎉 Vue应用已启动')