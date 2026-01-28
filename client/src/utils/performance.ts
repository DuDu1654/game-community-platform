// src/utils/performance.ts
interface LargestContentfulPaintEntry extends PerformanceEntry {
  startTime: number
  renderTime?: number
  loadTime?: number
  element?: Element
  url?: string
  id?: string
  size?: number
}

// 🔥 添加全局类型声明
declare global {
  interface Window {
    performanceMonitor: PerformanceMonitor
  }
  
  var performanceMonitor: PerformanceMonitor
}

import { reactive } from 'vue'

// 🔥 新增：实时指标接口
export interface RealTimeMetrics {
  realTimeNetwork: {
    rtt: number
    jitter: number
    packetLoss: number
    downlink: number
    effectiveType: string
  }
  rendering: {
    fps: number
    frameTime: number
    memoryUsage: number
    domNodes: number
  }
  userExperience: {
    clickResponseTime: number
    scrollPerformance: number
    cumulativeLayoutShift: number
    perceivedLoadTime: number
  }
  edgeMetrics: {
    edgeLatency: number
    edgeTimeSaved: number
    cacheHitRate: number
    edgeNode: string
  }
  resourceLoading: {
    currentLoads: number
    loadingSpeed: number
    slowestResource: string
    fastestResource: string
  }
}

export interface PerformanceMetrics {
  // 页面加载性能
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  timeToInteractive: number
  
  // 资源加载性能
  resourceTimings: ResourceTiming[]
  
  // API性能
  apiResponseTimes: ApiTiming[]
  
  // 用户交互性能
  interactionMetrics: InteractionMetric[]
  
  // 网络性能
  networkInfo: NetworkInfo
  
  // 🔥 新增：实时性能指标
  realTimeMetrics: RealTimeMetrics
  
  // 🔥 新增：质量评估
  qualityAssessment: {
    overall: number
    network: number
    rendering: number
    userExperience: number
  }
}

export interface ResourceTiming {
  name: string
  duration: number
  transferSize: number
  initiatorType: string
  startTime: number
}

export interface ApiTiming {
  id: number
  url: string
  method: string
  duration: number
  status: number
  timestamp: number
}

export interface InteractionMetric {
  type: 'click' | 'input' | 'scroll' | 'hover'
  target: string
  timestamp: number
  delay?: number
}

export interface NetworkInfo {
  effectiveType: string
  rtt: number
  downlink: number
  saveData: boolean
  downlinkMax?: number
  type?: string
}

export interface RouteNavigationMetric {
  from: string
  to: string
  startTime: number
  navigationStart: number
  navigationEnd?: number
  duration?: number
  pageLoadTime: number
  domContentLoaded?: number
  firstPaint?: number
  firstContentfulPaint?: number
  resourcesLoaded?: number
  apiCallsDuringNavigation: ApiTiming[]
}

export interface RealTimeDataPoint {
  timestamp: number
  rtt: number
  downlink: number
  edgeLatency: number
  fps: number
  memoryUsage: number
}

export interface PerformanceHistory {
  rttHistory: number[]
  downlinkHistory: number[]
  edgeLatencyHistory: number[]
  fpsHistory: number[]
  memoryHistory: number[]
  timestamps: string[]
  edgeImprovements: number[]
}





class PerformanceMonitor {
  // 私有属性，用于跟踪路由跳转性能
  private navigationStartTime: number = 0
  private routeNavigationMetrics: RouteNavigationMetric[] = reactive([])
  private lastManualRefresh = 0
  private readonly MANUAL_REFRESH_DURATION = 30000 // 30秒内手动刷新数据优先
  
  
  // 🔥 关键修复：使用响应式对象
  public metrics = reactive<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    timeToInteractive: 0,
    resourceTimings: [],
    apiResponseTimes: [],
    interactionMetrics: [],
    networkInfo: {
      effectiveType: 'unknown',
      rtt: 0,
      downlink: 0,
      saveData: false,
    },
    realTimeMetrics: {
      realTimeNetwork: {
        rtt: 0,
        jitter: 0,
        packetLoss: 0,
        downlink: 0,
        effectiveType: 'unknown'
      },
      rendering: {
        fps: 0,
        frameTime: 0,
        memoryUsage: 0,
        domNodes: 0
      },
      userExperience: {
        clickResponseTime: 0,
        scrollPerformance: 0,
        cumulativeLayoutShift: 0,
        perceivedLoadTime: 0
      },
      edgeMetrics: {
        edgeLatency: 0,
        edgeTimeSaved: 0,
        cacheHitRate: 0,
        edgeNode: 'unknown'
      },
      resourceLoading: {
        currentLoads: 0,
        loadingSpeed: 0,
        slowestResource: '',
        fastestResource: ''
      }
    },
    qualityAssessment: {
      overall: 0,
      network: 0,
      rendering: 0,
      userExperience: 0
    }
  })
  
  // 🔥 新增：历史数据存储
  private rttHistory: number[] = []
  private downlinkHistory: number[] = []
  private edgeLatencyHistory: number[] = []
  private fpsHistory: number[] = []
  private memoryHistory: number[] = []
  private edgeImprovements: number[] = []
  private dataPoints: RealTimeDataPoint[] = []
  private readonly MAX_HISTORY_POINTS = 50
  
  // 🔥 修复：使用响应式监听器数组
  private listeners: Array<() => void> = reactive([])
  private observer: PerformanceObserver | null = null
  public isMonitoring: boolean = false     // 改为public
  private apiCallId = 0
  private networkInterval: number | null = null
  private realTimeInterval: number | null = null
  private lastFrameTime: number = 0
  private frameCount: number = 0
  private lastFpsUpdate: number = 0
  private cumulativeLayoutShift: number = 0
  
  // 🔥 新增：获取历史数据
  getHistoryData(count: number = 20): PerformanceHistory {
    const startIndex = Math.max(0, this.rttHistory.length - count)
    return {
      rttHistory: this.rttHistory.slice(-count),
      downlinkHistory: this.downlinkHistory.slice(-count),
      edgeLatencyHistory: this.edgeLatencyHistory.slice(-count),
      fpsHistory: this.fpsHistory.slice(-count),
      memoryHistory: this.memoryHistory.slice(-count),
      timestamps: this.generateTimestamps(count),
      edgeImprovements: this.edgeImprovements.slice(-count)
    }
  }
  
  // 🔥 新增：生成时间戳
  private generateTimestamps(count: number): string[] {
    const timestamps: string[] = []
    const now = Date.now()
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now - (i * 3000))
      timestamps.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    return timestamps
  }
  
  // 注册监听器
  public onUpdate(callback: () => void) {
    this.listeners.push(callback)
  }
  
  // 移除监听器
  public offUpdate(callback: () => void) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }
  
  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.warn('监听器执行错误:', error)
      }
    })
  }
  
  // 🔥 修复：在push操作时手动触发通知
  private pushApiTiming(timing: ApiTiming) {
    this.metrics.apiResponseTimes.push(timing)
    this.notifyListeners()
  }
  
  // 开始监控
  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    console.log('🚀 性能监控已启动')
    
    // 🔥 修复：延迟收集，确保页面已加载
    if (document.readyState === 'complete') {
      this.collectPerformanceMetrics()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.collectPerformanceMetrics(), 100)
      })
    }
    
    // 🔥 新增：开始监控路由跳转
    this.setupRouteNavigationMonitoring()
    
    // 立即开始其他监控
    this.setupApiMonitoring()
    this.setupInteractionMonitoring()
    this.collectNetworkInfo()
    
    // 🔥 新增：启动实时监控
    this.startRealTimeMonitoring()
    
    setTimeout(() => {
      this.collectCurrentPageMetrics()
    }, 100)
  }
  
  // 🔥 新增：启动实时监控
  private startRealTimeMonitoring() {
    // 开始各种实时监控
    this.startRealTimeNetworkMonitoring()
    this.startRealTimeRenderingMonitoring()
    this.startRealTimeUXMonitoring()
    this.startRealTimeResourceMonitoring()
    this.startLayoutShiftMonitoring()
    
    // 每3秒更新一次实时数据
    this.realTimeInterval = window.setInterval(() => {
      this.updateRealTimeMetrics()
      this.calculateQualityMetrics()
      this.simulateEdgeComputingBenefits()
      this.notifyListeners()
    }, 3000)
  }
  
  // 🔥 新增：实时网络监控
  // 新增：实时网络监控
private startRealTimeNetworkMonitoring() {
  // 使用类型断言
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (connection) {
    connection.addEventListener('change', () => {
      this.updateNetworkInfo(connection)
    })
  }
}
  
  // 🔥 新增：实时渲染监控
  private startRealTimeRenderingMonitoring() {
    this.lastFrameTime = performance.now()
    this.lastFpsUpdate = performance.now()
    
    const measureFPS = () => {
      if (!this.isMonitoring) return
      
      const now = performance.now()
      const delta = now - this.lastFrameTime
      this.lastFrameTime = now
      this.frameCount++
      
      // 每秒更新一次FPS
      if (now - this.lastFpsUpdate >= 1000) {
        this.metrics.realTimeMetrics.rendering.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate))
        this.metrics.realTimeMetrics.rendering.frameTime = Math.round(delta)
        this.fpsHistory.push(this.metrics.realTimeMetrics.rendering.fps)
        this.lastFpsUpdate = now
        this.frameCount = 0
      }
      
      // 监控内存使用
      if ('memory' in performance) {
        const memory = (performance as any).memory
        this.metrics.realTimeMetrics.rendering.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
        this.memoryHistory.push(this.metrics.realTimeMetrics.rendering.memoryUsage)
      }
      
      // 监控DOM节点数量
      this.metrics.realTimeMetrics.rendering.domNodes = document.getElementsByTagName('*').length
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS)
      }
    }
    
    requestAnimationFrame(measureFPS)
  }
  
  // 🔥 新增：实时用户体验监控
  private startRealTimeUXMonitoring() {
    let lastClickTime = 0
    let clickResponseTimes: number[] = []
    
    document.addEventListener('click', (e) => {
      const now = performance.now()
      if (lastClickTime > 0) {
        const responseTime = now - lastClickTime
        clickResponseTimes.push(responseTime)
        if (clickResponseTimes.length > 10) {
          clickResponseTimes.shift()
        }
        this.metrics.realTimeMetrics.userExperience.clickResponseTime = 
          Math.round(clickResponseTimes.reduce((a, b) => a + b, 0) / clickResponseTimes.length)
      }
      lastClickTime = now
    })
    
    // 监控滚动性能
    let lastScrollTime = 0
    let scrollDurations: number[] = []
    
    document.addEventListener('scroll', () => {
      const now = performance.now()
      if (lastScrollTime > 0) {
        const scrollDuration = now - lastScrollTime
        scrollDurations.push(scrollDuration)
        if (scrollDurations.length > 10) {
          scrollDurations.shift()
        }
        this.metrics.realTimeMetrics.userExperience.scrollPerformance = 
          Math.round(1000 / (scrollDurations.reduce((a, b) => a + b, 0) / scrollDurations.length))
      }
      lastScrollTime = now
    })
  }
  
  // 🔥 新增：布局偏移监控
  private startLayoutShiftMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ('value' in entry) {
              this.cumulativeLayoutShift += entry.value as number
            }
          }
          this.metrics.realTimeMetrics.userExperience.cumulativeLayoutShift = 
            Math.round(this.cumulativeLayoutShift * 100) / 100
        })
        
        observer.observe({ type: 'layout-shift', buffered: true })
      } catch (error) {
        console.warn('布局偏移监控失败:', error)
      }
    }
  }
  
  // 🔥 新增：实时资源监控
  private startRealTimeResourceMonitoring() {
    let activeRequests = 0
    let requestStartTimes = new Map<number, number>()
    
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const requestId = Date.now()
      requestStartTimes.set(requestId, performance.now())
      activeRequests++
      
      try {
        const response = await originalFetch(...args)
        return response
      } finally {
        const endTime = performance.now()
        const startTime = requestStartTimes.get(requestId) || endTime
        const duration = endTime - startTime
        
        this.metrics.realTimeMetrics.resourceLoading.loadingSpeed = 
          Math.round((this.metrics.realTimeMetrics.resourceLoading.loadingSpeed + duration) / 2)
        
        requestStartTimes.delete(requestId)
        activeRequests--
        this.metrics.realTimeMetrics.resourceLoading.currentLoads = activeRequests
      }
    }
  }
  
  // 🔥 新增：模拟边缘计算效益
  private simulateEdgeComputingBenefits() {
    const baseRTT = this.metrics.realTimeMetrics.realTimeNetwork.rtt
    const baseSpeed = this.metrics.realTimeMetrics.realTimeNetwork.downlink
    
    // 模拟边缘节点带来的性能提升
    const edgeImprovement = 0.6 + Math.random() * 0.3 // 60-90% 的改善
    
    // 计算边缘延迟
    const edgeLatency = baseRTT * (1 - edgeImprovement)
    this.metrics.realTimeMetrics.edgeMetrics.edgeLatency = Math.round(edgeLatency)
    this.edgeLatencyHistory.push(Math.round(edgeLatency))
    
    // 计算节省时间
    this.metrics.realTimeMetrics.edgeMetrics.edgeTimeSaved = Math.round(baseRTT - edgeLatency)
    this.edgeImprovements.push(Math.round(edgeImprovement * 100))
    
    // 模拟缓存命中率
    const cacheHitRate = 0.3 + Math.random() * 0.5 // 30-80%
    this.metrics.realTimeMetrics.edgeMetrics.cacheHitRate = 
      parseFloat((cacheHitRate * 100).toFixed(1))
    
    // 模拟边缘节点位置
    // 模拟边缘节点位置
// 模拟边缘节点位置
const edgeNodes = ['北京节点', '上海节点', '广州节点', '成都节点', '香港节点', '美国节点', '欧洲节点']

// 给整个edgeMetrics对象赋值
this.metrics.realTimeMetrics.edgeMetrics = {
  edgeLatency: Math.random() * 100 + 50,  // 50-150ms
  edgeTimeSaved: Math.random() * 200 + 100,  // 100-300ms
  cacheHitRate: Math.random() * 0.5 + 0.5,  // 50%-100%
  edgeNode: edgeNodes[Math.floor(Math.random() * edgeNodes.length)]!
}
    
    // 添加数据点
    this.addDataPoint({
      timestamp: Date.now(),
      rtt: baseRTT,
      downlink: baseSpeed,
      edgeLatency: edgeLatency,
      fps: this.metrics.realTimeMetrics.rendering.fps,
      memoryUsage: this.metrics.realTimeMetrics.rendering.memoryUsage
    })
  }
  
  // 🔥 新增：添加数据点
  private addDataPoint(point: RealTimeDataPoint) {
    this.dataPoints.push(point)
    if (this.dataPoints.length > this.MAX_HISTORY_POINTS) {
      this.dataPoints.shift()
    }
    
    this.rttHistory.push(point.rtt)
    this.downlinkHistory.push(point.downlink)
    this.fpsHistory.push(point.fps)
    this.memoryHistory.push(point.memoryUsage)
    
    if (this.rttHistory.length > this.MAX_HISTORY_POINTS) {
      this.rttHistory.shift()
      this.downlinkHistory.shift()
      this.edgeLatencyHistory.shift()
      this.fpsHistory.shift()
      this.memoryHistory.shift()
      this.edgeImprovements.shift()
    }
  }
  

  
  // 🔥 新增：更新实时指标
 // 🔥 新增：更新实时指标
// 🔥 修复：更新实时指标（不覆盖页面加载指标）
private updateRealTimeMetrics() {
  // 1. 只更新网络指标
  const network = this.metrics.networkInfo;
  this.metrics.realTimeMetrics.realTimeNetwork = {
    rtt: network.rtt,
    jitter: Math.round(Math.random() * 20), // 模拟抖动
    packetLoss: parseFloat((Math.random() * 5).toFixed(2)), // 模拟丢包率
    downlink: network.downlink,
    effectiveType: network.effectiveType
  };
  
  // 2. 模拟边缘节点位置
  const edgeNodes = ['北京节点', '上海节点', '广州节点', '成都节点', '香港节点', '美国节点', '欧洲节点'];
  this.metrics.realTimeMetrics.edgeMetrics.edgeNode = edgeNodes[Math.floor(Math.random() * edgeNodes.length)] || '未知节点';
  
  // 3. 模拟缓存命中率
  const cacheHitRate = 0.3 + Math.random() * 0.5; // 30-80%
  this.metrics.realTimeMetrics.edgeMetrics.cacheHitRate = 
    parseFloat((cacheHitRate * 100).toFixed(1));
  
  // 🔥🔥🔥 关键修改：删除所有页面指标相关的更新代码
  // 不要有：
  // - 不要更新 pageLoadTime
  // - 不要更新 firstContentfulPaint
  // - 不要更新 largestContentfulPaint
  // - 不要更新 timeToInteractive
  
  // 4. 只更新资源加载指标
  if (this.metrics.resourceTimings.length > 0) {
    const resources = this.metrics.resourceTimings;
    const sortedBySpeed = [...resources].sort((a, b) => a.duration - b.duration);
    
    this.metrics.realTimeMetrics.resourceLoading = {
      currentLoads: this.metrics.realTimeMetrics.resourceLoading.currentLoads,
      loadingSpeed: Math.round(resources.reduce((sum, r) => sum + r.duration, 0) / resources.length),
      slowestResource: resources.sort((a, b) => b.duration - a.duration)[0]?.name || '',
      fastestResource: sortedBySpeed[0]?.name || ''
    };
  }
}
  
  // 🔥 新增：计算质量评估
  private calculateQualityMetrics() {
    const networkScore = Math.max(0, 100 - (this.metrics.realTimeMetrics.realTimeNetwork.rtt / 10) - 
      (this.metrics.realTimeMetrics.realTimeNetwork.packetLoss * 20))
    
    const renderingScore = Math.min(100, 
      (this.metrics.realTimeMetrics.rendering.fps / 60) * 50 +
      (1000 / Math.max(16, this.metrics.realTimeMetrics.rendering.frameTime)) * 25 +
      (100 - Math.min(100, this.metrics.realTimeMetrics.rendering.memoryUsage / 10)) * 0.25
    )
    
    const uxScore = Math.max(0, 100 - 
      (this.metrics.realTimeMetrics.userExperience.clickResponseTime / 2) -
      (this.metrics.realTimeMetrics.userExperience.cumulativeLayoutShift * 100)
    )
    
    this.metrics.qualityAssessment = {
      overall: Math.round((networkScore + renderingScore + uxScore) / 3),
      network: Math.round(networkScore),
      rendering: Math.round(renderingScore),
      userExperience: Math.round(uxScore)
    }
  }
  
  // 🔥 新增：设置路由导航监控
  private setupRouteNavigationMonitoring() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.startRouteNavigation(window.location.pathname)
      })
      
      window.addEventListener('hashchange', () => {
        this.startRouteNavigation(window.location.pathname)
      })
    }
  }
  
  // 🔥 新增：路由导航开始
  public startRouteNavigation(toPath: string) {
    this.navigationStartTime = performance.now()
    
    console.log(`🔄 路由跳转开始: ${toPath}`)
    
    const metric: RouteNavigationMetric = {
      from: window.location.pathname,
      to: toPath,
      startTime: Date.now(),
      navigationStart: performance.timing?.navigationStart || performance.now(),
      pageLoadTime: 0,
      apiCallsDuringNavigation: [],
    }
    
    this.routeNavigationMetrics.push(metric)
    this.notifyListeners()
    
    return metric
  }
  
  // 🔥 新增：路由导航结束
  public endRouteNavigation(fromPath: string, toPath: string) {
    const navigationEnd = performance.now()
    const duration = Math.round(navigationEnd - this.navigationStartTime)
    
    const lastMetric = this.routeNavigationMetrics[this.routeNavigationMetrics.length - 1]
    if (lastMetric && lastMetric.to === toPath) {
      lastMetric.duration = duration
      lastMetric.navigationEnd = navigationEnd
      
      this.collectCurrentPageMetrics()
      
      console.log(`✅ 路由跳转完成: ${fromPath} -> ${toPath}, 耗时: ${duration}ms`)
    }
    
    this.notifyListeners()
  }
  
  // 🔥 新增：收集当前页面的性能指标
  // 🔥 修复：收集当前页面的性能指标
private collectCurrentPageMetrics() {
  try {
    console.log('📊 收集当前页面性能指标 - 路由切换触发')
    
    // 强制重新计算所有性能指标
    this.forceRecalculatePerformanceMetrics()
    
    // 确保页面加载指标被重置并重新采集
    this.metrics.pageLoadTime = 0
    this.metrics.firstContentfulPaint = 0
    this.metrics.largestContentfulPaint = 0
    this.metrics.timeToInteractive = 0
    
    if (window.performance && window.performance.getEntriesByType && typeof window.performance.getEntriesByType === 'function') {
      const navEntries = performance.getEntriesByType('navigation')
      
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming
        
        // 🔥 重新获取页面加载时间
        this.metrics.pageLoadTime = Math.round(nav.loadEventEnd - nav.loadEventStart) || 0
        
        console.log('📈 页面加载时间（重新计算）:', {
          loadTime: this.metrics.pageLoadTime,
          domComplete: nav.domComplete - nav.domContentLoadedEventStart
        })
      } else {
        const timing = performance.timing
        if (timing && timing.loadEventEnd && timing.navigationStart) {
          this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart
        } else {
          this.metrics.pageLoadTime = 100
        }
      }
      
      // 🔥 重新获取 FCP
      const paintEntries = performance.getEntriesByType('paint')
      let fcp = 0
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          fcp = Math.round(entry.startTime)
        }
      })
      
      if (fcp === 0) {
        const navStart = performance.timing?.navigationStart || performance.now()
        const now = performance.now()
        fcp = Math.round(now - navStart)
        fcp = Math.min(fcp, 5000)
        fcp = Math.max(fcp, 50)
        console.log('📈 估算FCP（重新计算）:', fcp, 'ms')
      }
      
      this.metrics.firstContentfulPaint = fcp
    }
    
    // 🔥 重新设置资源观察者
    this.setupResourceTimingObserver()
    
    // 🔥 重新设置 LCP 观察者
    this.setupLCPObserver()
    
    // 🔥 重新计算 TTI
    this.calculateTimeToInteractive()
    
    this.notifyListeners()
    
  } catch (error) {
    console.warn('收集当前页面性能指标失败:', error)
  }
}

// 🔥 新增：强制重新计算性能指标
private forceRecalculatePerformanceMetrics() {
  console.log('🔄 强制重新计算性能指标')
  
  // 清除旧的性能条目缓存
  if ('performance' in window && window.performance.clearResourceTimings) {
    window.performance.clearResourceTimings()
  }
  
  // 强制重新获取最新的性能数据
  this.clearObservers()
  this.setupObservers()
}

// 🔥 新增：清除所有观察者
private clearObservers() {
  if (this.observer) {
    this.observer.disconnect()
    this.observer = null
  }
}

// 🔥 新增：重新设置所有观察者
private setupObservers() {
  this.setupResourceTimingObserver()
  this.setupLCPObserver()
}

// 🔥 新增：计算交互时间
private calculateTimeToInteractive() {
  // 模拟 TTI 计算（在实际应用中应该更复杂）
  const fcp = this.metrics.firstContentfulPaint || 300
  const lcp = this.metrics.largestContentfulPaint || 1000
  
  // TTI 应该在 FCP 和 LCP 之后，但不要太长
  const tti = Math.max(fcp + 200, lcp + 100)
  this.metrics.timeToInteractive = Math.round(Math.min(tti, 3000))  // 不超过3秒
  
  console.log('⚡ 计算TTI:', {
    fcp,
    lcp,
    tti: this.metrics.timeToInteractive
  })
}
  // 🔥 修改：重命名collectPerformanceMetrics为公共方法
  public refreshPerformanceMetrics() {
    console.log('🔄 刷新性能指标')
    this.collectCurrentPageMetrics()
  }
  
  // 🔥 修复：合并性能指标收集
  public collectPerformanceMetrics() {
    this.collectPageLoadMetrics()
    this.setupResourceTimingObserver()
    this.setupLCPObserver()
  }
  
  // 收集页面加载性能指标
  private collectPageLoadMetrics() {
    if (!window.performance || !window.performance.getEntriesByType) {
      console.warn('浏览器不支持 Performance API')
      return
    }
    
    try {
      const navEntries = performance.getEntriesByType('navigation')
      if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0] as PerformanceNavigationTiming
        
        if (nav.loadEventStart && nav.loadEventEnd) {
          this.metrics.pageLoadTime = Math.round(nav.loadEventEnd - nav.loadEventStart)
        } else {
          const timing = performance.timing
          if (timing && timing.loadEventEnd && timing.navigationStart) {
            this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart
          }
        }
      }
      
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = Math.round(entry.startTime)
        }
      })
      
      console.log('📊 页面性能数据收集完成:', {
        pageLoadTime: this.metrics.pageLoadTime,
        fcp: this.metrics.firstContentfulPaint
      })
      
    } catch (error) {
      console.warn('收集页面加载指标失败:', error)
    }
  }
  
  // 设置LCP观察者
  private setupLCPObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('浏览器不支持 PerformanceObserver')
      return
    }
    
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        
        if (entries.length === 0) {
          return
        }
        
        const lastEntry = entries[entries.length - 1] as LargestContentfulPaintEntry
        
        if (!lastEntry) {
          return
        }
        
        let lcpTime = 0
        
        if (lastEntry.renderTime !== undefined && lastEntry.renderTime > 0) {
          lcpTime = lastEntry.renderTime
        } else if (lastEntry.startTime !== undefined && lastEntry.startTime > 0) {
          lcpTime = lastEntry.startTime
        } else {
          lcpTime = (lastEntry as any).loadTime || 0
        }
        
        this.metrics.largestContentfulPaint = Math.round(lcpTime)
        this.notifyListeners()
        
        console.log('📈 LCP记录:', {
          startTime: lastEntry.startTime,
          renderTime: lastEntry.renderTime,
          calculated: lcpTime
        })
      })
      
      lcpObserver.observe({ 
        type: 'largest-contentful-paint', 
        buffered: true 
      })
      
    } catch (error) {
      console.warn('LCP观察者设置失败:', error)
    }
  }
  
  // 设置资源计时观察者
  private setupResourceTimingObserver() {
    if (!('PerformanceObserver' in window)) {
      console.warn('浏览器不支持 PerformanceObserver')
      return
    }
    
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.metrics.resourceTimings.push({
            name: entry.name || '',
            duration: Math.round(entry.duration || 0),
            transferSize: entry.transferSize || 0,
            initiatorType: entry.initiatorType || 'unknown',
            startTime: Math.round(entry.startTime || 0),
          })
        })
        this.notifyListeners()
      })
      
      this.observer.observe({ 
        entryTypes: ['resource'] 
      })
    } catch (error) {
      console.warn('资源观察者设置失败:', error)
    }
  }
  
  // 🔥 修复：API监控
  private setupApiMonitoring() {
    console.log('🔧 设置API监控')
    
    if ((window as any)._fetchHijacked) {
      console.log('⚠️ fetch已被劫持，跳过')
      return
    }
    
    (window as any)._fetchHijacked = true
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const [input, init] = args
      
      let url = ''
      let method = 'GET'
      
      if (input instanceof Request) {
        url = input.url
        method = input.method
      } else if (typeof input === 'string') {
        url = input
      } else {
        url = String(input)
      }
      
      if (init?.method) {
        method = init.method
      }
      
      if (this.shouldIgnoreUrl(url)) {
        return originalFetch.apply(window, args as any)
      }
      
      console.log(`🔍 监控API请求: ${method} ${this.getShortUrl(url)}`)
      
      try {
        const response = await originalFetch.apply(window, args as any)
        const endTime = performance.now()
        const duration = Math.round(endTime - startTime)
        
        const apiTiming: ApiTiming = {
          id: ++this.apiCallId,
          url,
          method,
          duration,
          status: response.status,
          timestamp: Date.now(),
        }
        
        this.pushApiTiming(apiTiming)
        console.log(`📡 API记录: ${method} ${this.getShortUrl(url)} - ${duration}ms`)
        
        return response
      } catch (error) {
        const endTime = performance.now()
        const duration = Math.round(endTime - startTime)
        
        this.pushApiTiming({
          id: ++this.apiCallId,
          url,
          method,
          duration,
          status: 0,
          timestamp: Date.now(),
        })
        
        console.log(`❌ API错误: ${method} ${this.getShortUrl(url)} - ${duration}ms`)
        throw error
      }
    }
    
    this.setupXHRMonitoring()
    this.setupFormMonitoring()
    this.setupWebSocketMonitoring()
  }
  
  // 🔥 新增：是否需要忽略的URL
  private shouldIgnoreUrl(url: string): boolean {
    const ignorePatterns = [
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'edge-extension://',
      'about:',
      'blob:',
      'data:',
      'file:',
    ]
    
    return ignorePatterns.some(pattern => url.startsWith(pattern))
  }
  
  // 🔥 新增：劫持XMLHttpRequest
  private setupXHRMonitoring() {
    if ((window as any)._XHRHijacked) return
    
    const OriginalXHR = window.XMLHttpRequest
    
    window.XMLHttpRequest = class extends OriginalXHR {
      private url: string = ''
      private method: string = 'GET'
      private startTime: number = 0
      
      open(method: string, url: string, async?: boolean, username?: string, password?: string) {
        this.method = method
        this.url = url
        this.startTime = performance.now()
        
        console.log(`🔍 监控XHR: ${method} ${url}`)
        
        return super.open(method, url, async ?? true, username, password)
      }
      
      send(body?: any) {
        const id = ++performanceMonitor.apiCallId
        const xhrUrl = this.url
        const xhrMethod = this.method
        
        this.addEventListener('load', () => {
          const endTime = performance.now()
          const duration = Math.round(endTime - this.startTime)
          
          const apiTiming: ApiTiming = {
            id,
            url: xhrUrl,
            method: xhrMethod,
            duration,
            status: this.status,
            timestamp: Date.now(),
          }
          
          performanceMonitor.pushApiTiming(apiTiming)
          console.log(`✅ XHR记录: ${xhrMethod} ${performanceMonitor.getShortUrl(xhrUrl)} - ${duration}ms`)
        })
        
        this.addEventListener('error', () => {
          const endTime = performance.now()
          const duration = Math.round(endTime - this.startTime)
          
          performanceMonitor.pushApiTiming({
            id,
            url: xhrUrl,
            method: xhrMethod,
            duration,
            status: 0,
            timestamp: Date.now(),
          })
          
          console.log(`❌ XHR错误: ${xhrMethod} ${performanceMonitor.getShortUrl(xhrUrl)} - ${duration}ms`)
        })
        
        return super.send(body)
      }
    }
    
    ;(window as any)._XHRHijacked = true
    console.log('✅ XMLHttpRequest监控已设置')
  }
  
  // 🔥 新增：监控表单提交
  private setupFormMonitoring() {
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      
      if (!(form instanceof HTMLFormElement)) return
      
      const url = form.action || window.location.href
      const method = form.method.toUpperCase()
      
      if (this.shouldIgnoreUrl(url)) return
      
      const apiTiming: ApiTiming = {
        id: ++this.apiCallId,
        url,
        method,
        duration: 0,
        status: 0,
        timestamp: Date.now(),
      }
      
      this.pushApiTiming(apiTiming)
      console.log(`📋 表单提交监控: ${method} ${this.getShortUrl(url)}`)
    })
  }
  
  // 🔥 新增：监控WebSocket连接
  private setupWebSocketMonitoring() {
    if ((window as any)._WebSocketHijacked) return
    
    const OriginalWebSocket = (window as any).WebSocket as typeof WebSocket
    
    ;(window as any).WebSocket = class extends OriginalWebSocket {
      private wsMonitorUrl: string
      private startTime: number
      private wsId: number
      
      constructor(url: string, protocols?: string | string[]) {
        super(url, protocols)
        this.wsMonitorUrl = url.toString()
        this.startTime = performance.now()
        this.wsId = ++performanceMonitor.apiCallId
        
        console.log(`🔌 WebSocket连接: ${performanceMonitor.getShortUrl(url)}`)
        
        this.addEventListener('open', () => {
          const connectTime = Math.round(performance.now() - this.startTime)
          
          const apiTiming: ApiTiming = {
            id: this.wsId,
            url: this.wsMonitorUrl,
            method: 'WS',
            duration: connectTime,
            status: 200,
            timestamp: Date.now(),
          }
          
          performanceMonitor.pushApiTiming(apiTiming)
          console.log(`✅ WebSocket连接成功: ${connectTime}ms`)
        })
        
        this.addEventListener('error', () => {
          const errorTime = Math.round(performance.now() - this.startTime)
          
          performanceMonitor.pushApiTiming({
            id: this.wsId,
            url: this.wsMonitorUrl,
            method: 'WS',
            duration: errorTime,
            status: 0,
            timestamp: Date.now(),
          })
          
          console.log(`❌ WebSocket连接失败: ${errorTime}ms`)
        })
      }
    }
    
    ;(window as any)._WebSocketHijacked = true
  }
  
  // 获取短URL
  private getShortUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname.split('/').pop() || urlObj.pathname
    } catch {
      return url.split('/').pop() || url
    }
  }
  
  // 设置用户交互监控
  private setupInteractionMonitoring() {
    const eventTypes: ('click' | 'input' | 'scroll' | 'mouseover')[] = ['click', 'input', 'scroll', 'mouseover']
    
    eventTypes.forEach(type => {
      try {
        document.addEventListener(type, (event) => {
          const target = event.target as HTMLElement
          if (!target || !target.tagName) return
          
          let targetName = target.tagName.toLowerCase()
          
          if (target.id) {
            targetName += '#' + target.id
          } else if (target.className && typeof target.className === 'string') {
            const className = target.className.split(' ')[0]
            if (className) {
              const cleanClassName = String(className).trim()
              if (cleanClassName) {
                targetName += '.' + cleanClassName
              }
            }
          }
          
          this.metrics.interactionMetrics.push({
            type: type as 'click' | 'input' | 'scroll' | 'hover',
            target: targetName,
            timestamp: Date.now(),
          })
          
          this.notifyListeners()
        }, { 
          passive: true,
          capture: true 
        })
      } catch (error) {
        console.warn(`添加 ${type} 事件监听器失败:`, error)
      }
    })
  }
  
  // 🔥 修复：收集网络信息
  private collectNetworkInfo() {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection
    
    if (connection) {
      console.log('📡 检测到网络信息API:', {
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        downlink: connection.downlink,
        downlinkMax: connection.downlinkMax,
        type: connection.type
      })
      
      this.updateNetworkInfo(connection)
      
      if (connection.addEventListener) {
        connection.addEventListener('change', () => {
          console.log('🌐 网络连接状态变化')
          this.updateNetworkInfo(connection)
        })
      }
      
      this.startNetworkMonitoring()
      
    } else {
      console.warn('⚠️ 当前浏览器不支持 Network Information API')
      this.useFallbackNetworkInfo()
    }
  }
  
  // 🔥 新增：网络监控定时器
  private startNetworkMonitoring() {
    if (this.networkInterval) {
      clearInterval(this.networkInterval)
    }
    
    this.networkInterval = window.setInterval(() => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection
      
      if (connection) {
        this.updateNetworkInfo(connection)
      } else {
        this.simulateNetworkChanges()
      }
    }, 5000)
  }
  
  // 🔧 修复：模拟网络变化
  private simulateNetworkChanges() {
    if (!this.isMonitoring) return
    
    const currentInfo = this.metrics.networkInfo
    
    const changeType = Math.random() > 0.8
    
    if (changeType) {
      const types = ['wifi', '4g', '3g', '2g', 'slow-2g'] as const
      const currentType = currentInfo.effectiveType
      const otherTypes = types.filter(t => t !== currentType)
      
      if (otherTypes.length === 0) {
        return
      }
      
      const newType = otherTypes[Math.floor(Math.random() * otherTypes.length)]
      
      const baseConfigs: Record<string, { minRtt: number; maxRtt: number; minSpeed: number; maxSpeed: number }> = {
        'wifi': { minRtt: 10, maxRtt: 50, minSpeed: 20, maxSpeed: 100 },
        '4g': { minRtt: 30, maxRtt: 100, minSpeed: 10, maxSpeed: 50 },
        '3g': { minRtt: 100, maxRtt: 300, minSpeed: 1, maxSpeed: 10 },
        '2g': { minRtt: 300, maxRtt: 600, minSpeed: 0.5, maxSpeed: 2 },
        'slow-2g': { minRtt: 600, maxRtt: 1000, minSpeed: 0.1, maxSpeed: 0.5 },
        'unknown': { minRtt: 50, maxRtt: 200, minSpeed: 1, maxSpeed: 10 }
      }
      
      if (!newType || !(newType in baseConfigs)) {
        return
      }
      
      const config = baseConfigs[newType]
      if (!config) {
        return
      }
      
      this.metrics.networkInfo = {
        ...currentInfo,
        effectiveType: newType,
        rtt: Math.round(config.minRtt + Math.random() * (config.maxRtt - config.minRtt)),
        downlink: parseFloat((config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed)).toFixed(1))
      }
    } else {
      const rttChange = (Math.random() - 0.5) * 20
      const speedChange = (Math.random() - 0.5) * 2
      
      this.metrics.networkInfo = {
        ...currentInfo,
        rtt: Math.max(10, Math.round(currentInfo.rtt + rttChange)),
        downlink: parseFloat(Math.max(0.1, currentInfo.downlink + speedChange).toFixed(1))
      }
    }
    
    this.updateRealTimeMetricsFromNetwork()
    this.notifyListeners()
  }
  
  // 🔥 新增：从网络信息更新实时指标
  private updateRealTimeMetricsFromNetwork() {
    this.metrics.realTimeMetrics.realTimeNetwork = {
      rtt: this.metrics.networkInfo.rtt,
      jitter: Math.round(Math.random() * 20),
      packetLoss: parseFloat((Math.random() * 5).toFixed(2)),
      downlink: this.metrics.networkInfo.downlink,
      effectiveType: this.metrics.networkInfo.effectiveType
    }
  }
  
  // 🔥 新增：备用网络信息方案
  private useFallbackNetworkInfo() {
    console.log('🔧 使用备用网络信息方案')
    
    this.metrics.networkInfo = {
      effectiveType: 'unknown',
      rtt: 100,
      downlink: 5,
      saveData: false
    }
    
    this.testNetworkSpeed()
    
    this.networkInterval = window.setInterval(() => {
      this.testNetworkSpeed()
    }, 10000)
  }
  
  // 🔥 新增：实际测试网络速度
  private async testNetworkSpeed() {
    try {
      const testUrl = 'https://httpbin.org/image/jpeg'
      const startTime = performance.now()
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      const contentLength = response.headers.get('content-length')
      const size = contentLength ? parseInt(contentLength) : 10000
      
      const speedMbps = (size * 8) / duration / 1000
      const rtt = duration
      
      let effectiveType = 'unknown'
      if (speedMbps > 20) effectiveType = 'wifi'
      else if (speedMbps > 10) effectiveType = '4g'
      else if (speedMbps > 2) effectiveType = '3g'
      else if (speedMbps > 0.5) effectiveType = '2g'
      else effectiveType = 'slow-2g'
      
      this.metrics.networkInfo = {
        ...this.metrics.networkInfo,
        effectiveType,
        rtt: Math.round(rtt),
        downlink: parseFloat(speedMbps.toFixed(1))
      }
      
      this.updateRealTimeMetricsFromNetwork()
      this.notifyListeners()
      console.log('📡 网络速度测试:', { speed: speedMbps.toFixed(1) + ' Mbps', rtt: Math.round(rtt) + 'ms' })
      
    } catch (error) {
      console.warn('网络速度测试失败:', error)
    }
  }
  
  // 🔥 修复：更新网络信息的方法
  private updateNetworkInfo(connection: any) {
    const now = Date.now()
    
    if (now - this.lastManualRefresh < this.MANUAL_REFRESH_DURATION) {
      console.log('⏳ 跳过自动更新（手动刷新后30秒内）')
      return
    }
    
    if (connection && this.isValidConnection(connection)) {
      this.metrics.networkInfo = {
        effectiveType: connection.effectiveType || 'unknown',
        rtt: connection.rtt || 100,
        downlink: connection.downlink || 5,
        saveData: connection.saveData || false,
        downlinkMax: connection.downlinkMax,
        type: connection.type
      }
      this.updateRealTimeMetricsFromNetwork()
      console.log('🌐 网络API更新:', this.metrics.networkInfo)
    } else {
      this.simulateNetworkChanges()
    }
  }
  
  // 🔥 修复：刷新网络信息（手动调用）
  public async refreshNetworkInfo(): Promise<boolean> {
    console.log('🔄 手动刷新网络信息...')
    this.lastManualRefresh = Date.now()
    
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection
    
    if (connection && this.isValidConnection(connection)) {
      console.log('✅ 使用浏览器Network Information API:', connection)
      
      this.metrics.networkInfo = {
        effectiveType: connection.effectiveType || 'unknown',
        rtt: connection.rtt || 100,
        downlink: connection.downlink || 5,
        saveData: connection.saveData || false,
        downlinkMax: connection.downlinkMax,
        type: connection.type
      }
      
      this.updateRealTimeMetricsFromNetwork()
      this.notifyListeners()
      return true
    }
    
    console.log('🔧 浏览器API无效，进行真实网络测试...')
    return await this.performRealNetworkTest()
  }
  
  // 🔧 修复：执行真实的网络测试
  private async performRealNetworkTest(): Promise<boolean> {
    console.log('🌐 开始真实网络测试...')
    
    const testUrls = [
      'https://www.gstatic.com/generate_204',
      'https://httpbin.org/bytes/512',
      '/favicon.ico'
    ]
    
    let bestRtt = Infinity
    let bestSpeed = 0
    let successfulTests = 0
    
    for (const url of testUrls) {
      try {
        console.log(`🔍 测试: ${url}`)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        const startTime = performance.now()
        const response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal
        })
        const firstByteTime = performance.now()
        
        if (response.ok || response.status === 0) {
          await response.arrayBuffer()
          const endTime = performance.now()
          
          const rtt = firstByteTime - startTime
          const totalTime = endTime - startTime
          
          let fileSize = 512
          if (url.includes('gstatic.com')) fileSize = 100
          if (url.includes('favicon')) fileSize = 2000
          
          const speedMbps = (fileSize * 8) / totalTime / 1000
          
          if (rtt < bestRtt) bestRtt = rtt
          if (speedMbps > bestSpeed) bestSpeed = speedMbps
          
          successfulTests++
          console.log(`✅ 测试成功: ${Math.round(rtt)}ms, ${speedMbps.toFixed(1)}Mbps`)
        }
        
        clearTimeout(timeoutId)
      } catch (error) {
        if (error instanceof Error) {
          console.log(`⚠️ 测试失败 ${url}:`, error.message)
        } else if (error && typeof error === 'object' && 'message' in error) {
          console.log(`⚠️ 测试失败 ${url}:`, (error as any).message)
        } else {
          console.log(`⚠️ 测试失败 ${url}:`, String(error))
        }
        continue
      }
    }
    
    if (successfulTests > 0) {
      const networkInfo = this.calculateNetworkInfoFromTest(bestRtt, bestSpeed)
      this.metrics.networkInfo = networkInfo
      
      this.updateRealTimeMetricsFromNetwork()
      console.log('✅ 真实网络测试完成:', networkInfo)
      this.notifyListeners()
      return true
    }
    
    console.log('⚠️ 所有网络测试失败，使用智能估算')
    this.useIntelligentEstimation()
    return false
  }
  
  // 🔥 新增：根据测试结果计算网络信息
  private calculateNetworkInfoFromTest(rtt: number, speedMbps: number): NetworkInfo {
    let effectiveType = 'unknown'
    
    if (speedMbps > 20 && rtt < 50) {
      effectiveType = 'wifi'
    } else if (speedMbps > 10 && rtt < 100) {
      effectiveType = '4g'
    } else if (speedMbps > 2 && rtt < 200) {
      effectiveType = '3g'
    } else if (speedMbps > 0.5 && rtt < 500) {
      effectiveType = '2g'
    } else if (speedMbps > 0.1) {
      effectiveType = 'slow-2g'
    } else {
      effectiveType = 'unknown'
    }
    
    return {
      effectiveType,
      rtt: Math.round(rtt),
      downlink: parseFloat(speedMbps.toFixed(1)),
      saveData: false
    }
  }
  
  // 🔧 修复：智能估算（不使用固定值）
  private useIntelligentEstimation() {
    console.log('🤔 使用智能估算网络信息...')
    
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /mobile|android|iphone|ipad|ipod/.test(userAgent)
    const platform = navigator.platform.toLowerCase()
    
    const connection = (navigator as any).connection
    
    let effectiveType: string = 'unknown'
    let rtt = 100
    let downlink = 5
    
    if (connection) {
      if (connection.effectiveType && connection.effectiveType !== 'unknown') {
        const connEffectiveType = String(connection.effectiveType || 'unknown')
        effectiveType = connEffectiveType.trim() || 'unknown'
      }
      if (connection.rtt && connection.rtt > 0) {
        rtt = Number(connection.rtt)
      }
      if (connection.downlink && connection.downlink > 0) {
        downlink = Number(connection.downlink)
      }
    }
    
    if (effectiveType === 'unknown') {
      if (platform.includes('win') || platform.includes('mac') || platform.includes('linux')) {
        effectiveType = 'wifi'
        rtt = 20 + Math.random() * 30
        downlink = 20 + Math.random() * 30
      } else if (isMobile) {
        const types = ['4g', '3g', '2g'] as const
        const randomType = types[Math.floor(Math.random() * types.length)]
        effectiveType = randomType as string
      }
      
      switch (effectiveType) {
        case '4g':
          rtt = 40 + Math.random() * 40
          downlink = 8 + Math.random() * 12
          break
        case '3g':
          rtt = 100 + Math.random() * 100
          downlink = 2 + Math.random() * 3
          break
        case '2g':
          rtt = 300 + Math.random() * 200
          downlink = 0.5 + Math.random() * 1
          break
        case 'wifi':
          rtt = 20 + Math.random() * 30
          downlink = 20 + Math.random() * 30
          break
      }
    }
    
    rtt += (Math.random() - 0.5) * 20
    downlink += (Math.random() - 0.5) * 2
    
    this.metrics.networkInfo = {
      effectiveType,
      rtt: Math.max(10, Math.round(rtt)),
      downlink: parseFloat(Math.max(0.1, downlink).toFixed(1)),
      saveData: false
    }
    
    this.updateRealTimeMetricsFromNetwork()
    console.log('🔮 智能估算结果:', this.metrics.networkInfo)
    this.notifyListeners()
  }
  
  // 🔥 新增：验证网络连接对象是否有效
  private isValidConnection(connection: any): boolean {
    if (!connection) return false
    
    const hasValidType = connection.effectiveType && 
                        connection.effectiveType !== 'unknown' &&
                        connection.effectiveType !== '' &&
                        connection.effectiveType !== 'none'
    
    const hasValidRTT = typeof connection.rtt === 'number' && 
                       connection.rtt > 0 && 
                       connection.rtt < 10000
    
    return hasValidType && hasValidRTT
  }
  
  // 在 stopMonitoring 方法中添加清除定时器
  stopMonitoring() {
    this.isMonitoring = false
    
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    
    if (this.networkInterval) {
      clearInterval(this.networkInterval)
      this.networkInterval = null
    }
    
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval)
      this.realTimeInterval = null
    }
    
    console.log('⏹️ 性能监控已停止')
  }
  
  // 获取性能摘要
  getPerformanceSummary() {
    const apiTimes = this.metrics.apiResponseTimes.map(t => t.duration)
    const resourceTimes = this.metrics.resourceTimings.map(t => t.duration)
    
    return {
      pageLoad: {
        loadTime: this.metrics.pageLoadTime,
        fcp: this.metrics.firstContentfulPaint,
        lcp: this.metrics.largestContentfulPaint,
      },
      api: {
        count: apiTimes.length,
        avg: this.calculateAverage(apiTimes),
        p95: this.calculatePercentile(apiTimes, 95),
        p99: this.calculatePercentile(apiTimes, 99),
        recent: [...this.metrics.apiResponseTimes].slice(-5).reverse()
      },
      resources: {
        count: resourceTimes.length,
        avg: this.calculateAverage(resourceTimes),
        totalSize: this.metrics.resourceTimings.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      },
      network: this.metrics.networkInfo,
      realTimeMetrics: this.metrics.realTimeMetrics,
      qualityAssessment: this.metrics.qualityAssessment,
      interactions: this.metrics.interactionMetrics.length,
      timestamp: new Date().toISOString(),
    }
  }
  
  // 🔥 新增：获取实时数据摘要
  getRealTimeSummary() {
    return {
      ...this.metrics.realTimeMetrics,
      quality: this.metrics.qualityAssessment,
      history: this.getHistoryData(20)
    }
  }
  
  // 计算平均值
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0
    const sum = numbers.reduce((a, b) => a + b, 0)
    return Math.round(sum / numbers.length)
  }
  
  // 计算百分位数
  private calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0
    
    const sorted = [...numbers].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)] || 0
  }
  
  // 导出数据
  exportData(format: 'json' | 'csv' = 'json') {
    const summary = this.getPerformanceSummary()
    return format === 'csv' ? this.convertToCSV(summary) : JSON.stringify(summary, null, 2)
  }
  
  // 🔥 新增：导出实时数据
  exportRealTimeData(format: 'json' | 'csv' = 'json') {
    const data = this.getRealTimeSummary()
    return format === 'csv' ? this.convertToCSV(data) : JSON.stringify(data, null, 2)
  }
  
  private convertToCSV(data: any): string {
    const flatten = (obj: any, prefix = ''): Record<string, any> => {
      return Object.keys(obj).reduce((acc, key) => {
        const pre = prefix.length ? prefix + '.' : ''
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(acc, flatten(obj[key], pre + key))
        } else {
          acc[pre + key] = obj[key]
        }
        return acc
      }, {} as Record<string, any>)
    }
    
    const flatData = flatten(data)
    const headers = Object.keys(flatData).join(',')
    const values = Object.values(flatData).join(',')
    return `${headers}\n${values}`
  }
  
  // 发送到服务器
  async sendToServer(endpoint: string) {
    const report = this.getPerformanceSummary()
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      console.log('✅ 性能数据已发送到服务器')
      return true
    } catch (error) {
      console.error('❌ 发送性能数据失败:', error)
      return false
    }
  }
  
  // 清除数据
  clear() {
    this.metrics.apiResponseTimes = []
    this.metrics.resourceTimings = []
    this.metrics.interactionMetrics = []
    this.metrics.pageLoadTime = 0
    this.metrics.firstContentfulPaint = 0
    this.metrics.largestContentfulPaint = 0
    this.metrics.timeToInteractive = 0
    
    // 清除实时数据
    this.rttHistory = []
    this.downlinkHistory = []
    this.edgeLatencyHistory = []
    this.fpsHistory = []
    this.memoryHistory = []
    this.edgeImprovements = []
    this.dataPoints = []
    
    this.notifyListeners()
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor()

// 注册到window全局对象
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor
}

// 在Vue应用中集成
export const setupPerformanceMonitoring = () => {
  performanceMonitor.startMonitoring()
  
  window.addEventListener('beforeunload', () => {
    const summary = performanceMonitor.getPerformanceSummary()
    const history = JSON.parse(localStorage.getItem('performance_history') || '[]')
    history.push({
      ...summary,
      url: window.location.href,
      userAgent: navigator.userAgent,
    })
    
    if (history.length > 100) history.shift()
    localStorage.setItem('performance_history', JSON.stringify(history))
  })
  
  return performanceMonitor
}