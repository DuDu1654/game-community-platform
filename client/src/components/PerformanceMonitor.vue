<!-- src/components/EnhancedPerformanceMonitor.vue -->
<template>
  <div class="enhanced-performance-monitor">
    <!-- 全局状态栏 -->
    <div class="global-status-bar">
      <div class="status-overview">
        <div class="status-item">
          <span class="status-label">🌐 实时网络:</span>
          <span class="status-value">{{ getNetworkStatus() }}</span>
          <span class="status-badge" :class="getNetworkClass()">
            {{ metrics.realTimeMetrics?.realTimeNetwork?.effectiveType || 'unknown' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">⏱️ 当前延迟:</span>
          <span class="status-value">{{ getCurrentRTT() }}ms</span>
        </div>
        <div class="status-item">
          <span class="status-label">⚡ 下载速度:</span>
          <span class="status-value">{{ getCurrentSpeed() }} Mbps</span>
        </div>
        <div class="status-item">
          <span class="status-label">🏁 边缘优化:</span>
          <span class="status-value">{{ getEdgeImprovement() }}%</span>
        </div>
      </div>
      
      <div class="status-actions">
        <button @click="toggleMonitoring" class="monitor-btn" :class="{ 'active': isMonitoring }">
          {{ isMonitoring ? '⏸️ 暂停监控' : '▶️ 开始监控' }}
        </button>
        <button @click="exportData" class="export-btn">📥 导出数据</button>
        <button @click="clearData" class="clear-btn">🧹 清空数据</button>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- 左侧：原有性能数据（你的数据） -->
      <div class="left-panel">
        <!-- 核心性能指标 -->
        <div class="section-card">
          <h3 class="section-title">📊 核心性能指标</h3>
          <div class="core-metrics-grid">
            <div class="core-metric-item" :class="getMetricClass('fcp', metrics.firstContentfulPaint)">
              <div class="core-metric-label">首次内容绘制 (FCP)</div>
              <div class="core-metric-value">{{ metrics.firstContentfulPaint }}ms</div>
              <div class="core-metric-target">目标: &lt; 1800ms</div>
            </div>
            <div class="core-metric-item" :class="getMetricClass('lcp', metrics.largestContentfulPaint)">
              <div class="core-metric-label">最大内容绘制 (LCP)</div>
              <div class="core-metric-value">{{ metrics.largestContentfulPaint }}ms</div>
              <div class="core-metric-target">目标: &lt; 2500ms</div>
            </div>
            <div class="core-metric-item" :class="getMetricClass('tti', metrics.timeToInteractive)">
              <div class="core-metric-label">可交互时间 (TTI)</div>
              <div class="core-metric-value">{{ metrics.timeToInteractive }}ms</div>
              <div class="core-metric-target">目标: &lt; 3800ms</div>
            </div>
            <div class="core-metric-item" :class="getMetricClass('cls', getCLS())">
              <div class="core-metric-label">累计布局偏移 (CLS)</div>
              <div class="core-metric-value">{{ getCLS() }}</div>
              <div class="core-metric-target">目标: &lt; 0.1</div>
            </div>
          </div>
        </div>

        <!-- 资源加载统计 -->
        <div class="section-card">
          <h3 class="section-title">📦 资源加载统计</h3>
          <div class="resource-stats">
            <div class="resource-chart">
              <div v-for="resource in resourceTypes" :key="resource.type" 
                   class="resource-bar" 
                   :style="{ width: getResourcePercentage(resource.count) + '%' }"
                   :class="'resource-' + resource.type">
                <span class="resource-label">{{ resource.type.toUpperCase() }}</span>
                <span class="resource-count">{{ resource.count }}</span>
              </div>
            </div>
            <div class="resource-details">
              <div v-for="resource in getResourceDetails()" :key="resource.name" class="resource-item">
                <span class="resource-name">{{ resource.name }}</span>
                <span class="resource-time">{{ resource.duration }}ms</span>
                <span class="resource-size">{{ formatSize(resource.size) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- API性能统计 -->
        <div class="section-card">
          <h3 class="section-title">🔌 API性能统计</h3>
          <div class="api-stats">
            <div class="api-overview">
              <div class="api-stat">
                <div class="api-stat-label">总请求数</div> 
                <div class="api-stat-value">{{ apiStats.total }}</div>
              </div>
              <div class="api-stat">
                <div class="api-stat-label">平均响应</div>
                <div class="api-stat-value">{{ apiStats.avgTime }}ms</div>
              </div>
              <div class="api-stat">
                <div class="api-stat-label">成功率</div>
                <div class="api-stat-value">{{ apiStats.successRate }}%</div>
              </div>
              <div class="api-stat">
                <div class="api-stat-label">最慢接口</div>
                <div class="api-stat-value slowest">{{ apiStats.slowest?.name || '-' }}</div>
              </div>
            </div>
            <div class="api-chart">
              <div v-for="(api, index) in getTopApis()" :key="index" class="api-bar-container">
                <div class="api-bar" :style="{ width: getApiBarWidth(api.time) + '%' }"
                     :class="getApiBarClass(api.time)">
                  <span class="api-name">{{ api.name }}</span>
                  <span class="api-time">{{ api.time }}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 网络基本信息（来自你的截图数据） -->
        <div class="section-card">
          <h3 class="section-title">📡 网络基本信息</h3>
          <div class="network-info-grid">
            <div class="info-item">
              <span class="info-label">网络类型</span>
              <span class="info-value">{{ metrics.networkInfo?.effectiveType || 'unknown' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">往返延迟</span>
              <span class="info-value">{{ metrics.networkInfo?.rtt }}ms</span>
            </div>
            <div class="info-item">
              <span class="info-label">下载速度</span>
              <span class="info-value">{{ metrics.networkInfo?.downlink }} Mbps</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据节省</span>
              <span class="info-value">{{ metrics.networkInfo?.saveData ? '开启' : '关闭' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最大下载</span>
              <span class="info-value">{{ metrics.networkInfo?.downlinkMax || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">连接变化</span>
              <span class="info-value">{{ networkChangeCount }} 次</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：新增实时监控数据 -->
      <div class="right-panel">
        <!-- 实时网络监控 -->
        <div class="section-card realtime-card">
          <h3 class="section-title">🌐 实时网络监控</h3>
          <div class="realtime-metrics-grid">
            <RealtimeMetric 
              title="实时延迟" 
              :value="`${getRealTimeValue('rtt')}ms`" 
              icon="⏱️"
              :status="getRTStatus('rtt')"
              :trend="getRTTTrend()"
              :history="rttHistory"
            />
            <RealtimeMetric 
              title="网络抖动" 
              :value="`${getRealTimeValue('jitter')}ms`" 
              icon="📈"
              :status="getJitterStatus()"
              :trend="getJitterTrend()"
            />
            <RealtimeMetric 
              title="下载速度" 
              :value="`${getRealTimeValue('downlink')} Mbps`" 
              icon="⚡"
              :status="getSpeedStatus()"
              :trend="getSpeedTrend()"
              :history="speedHistory"
            />
            <RealtimeMetric 
              title="丢包率" 
              :value="`${getRealTimeValue('packetLoss')}%`" 
              icon="📉"
              :status="getPacketLossStatus()"
            />
            <RealtimeMetric 
              title="连接稳定性" 
              :value="getConnectionStability()" 
              icon="📶"
              :status="getStabilityStatus()"
            />
            <RealtimeMetric 
              title="可靠性" 
              :value="`${getRealTimeValue('reliability')}%`" 
              icon="🛡️"
              :status="getReliabilityStatus()"
            />
          </div>
        </div>

        <!-- 边缘计算效益（毕业论文重点） -->
        <div class="section-card edge-card">
          <h3 class="section-title">⚡ 边缘计算效益分析</h3>
          <div class="edge-benefits">
            <div class="benefit-metric">
              <div class="benefit-label">边缘节点</div>
              <div class="benefit-value">{{ getRealTimeValue('edgeNode', '未连接') }}</div>
            </div>
            <div class="benefit-metric highlight">
              <div class="benefit-label">延迟降低</div>
              <div class="benefit-value">{{ calculateLatencyReduction() }}%</div>
              <div class="benefit-desc">从 {{ getRealTimeValue('originalRTT', 0) }}ms 降至 {{ getRealTimeValue('edgeLatency', 0) }}ms</div>
            </div>
            <div class="benefit-metric">
              <div class="benefit-label">节省时间</div>
              <div class="benefit-value">{{ getRealTimeValue('edgeTimeSaved', 0) }}ms</div>
            </div>
            <div class="benefit-metric">
              <div class="benefit-label">缓存命中</div>
              <div class="benefit-value">{{ getRealTimeValue('cacheHitRate', 0) }}%</div>
            </div>
            <div class="benefit-chart">
              <div class="chart-title">边缘计算收益趋势</div>
              <div class="improvement-bars">
                <div v-for="(improvement, index) in edgeImprovements" :key="index" 
                     class="improvement-bar-container">
                  <div class="improvement-bar" 
                       :style="{ height: Math.min(improvement * 2, 100) + '%' }"
                       :class="getImprovementClass(improvement)">
                    <span class="improvement-label">{{ improvement }}%</span>
                  </div>
                  <div class="improvement-time">{{ index + 1 }}s前</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 页面渲染性能 -->
        <div class="section-card rendering-card">
          <h3 class="section-title">🎯 页面渲染性能</h3>
          <div class="rendering-metrics">
            <div class="rendering-metric">
              <div class="rendering-label">帧率 (FPS)</div>
              <div class="rendering-value" :class="getFPSClass()">
                {{ getRealTimeValue('fps', 0) }}
                <span class="rendering-unit">fps</span>
              </div>
              <div class="rendering-gauge">
                <div class="gauge-bar" :style="{ width: getFPSPercentage() + '%' }"></div>
              </div>
              <div class="rendering-target">目标: 60fps</div>
            </div>
            <div class="rendering-metric">
              <div class="rendering-label">帧时间</div>
              <div class="rendering-value" :class="getFrameTimeClass()">
                {{ getRealTimeValue('frameTime', 0) }}
                <span class="rendering-unit">ms</span>
              </div>
              <div class="rendering-gauge">
                <div class="gauge-bar" :style="{ width: getFrameTimePercentage() + '%' }"></div>
              </div>
              <div class="rendering-target">目标: 16.7ms</div>
            </div>
            <div class="rendering-metric">
              <div class="rendering-label">内存使用</div>
              <div class="rendering-value" :class="getMemoryClass()">
                {{ getRealTimeValue('memoryUsage', 0) }}
                <span class="rendering-unit">MB</span>
              </div>
              <div class="rendering-target">峰值: {{ memoryPeak }} MB</div>
            </div>
            <div class="rendering-metric">
              <div class="rendering-label">DOM节点数</div>
              <div class="rendering-value" :class="getDOMClass()">
                {{ getRealTimeValue('domNodes', 0) }}
              </div>
              <div class="rendering-target">总数: {{ getRealTimeValue('domNodes', 0) }}</div>
            </div>
          </div>
        </div>

        <!-- 用户体验监控 -->
        <div class="section-card ux-card">
          <h3 class="section-title">👤 用户体验指标</h3>
          <div class="ux-metrics">
            <div class="ux-metric">
              <div class="ux-label">点击响应</div>
              <div class="ux-value" :class="getResponseClass()">
                {{ getRealTimeValue('clickResponseTime', 0) }}ms
              </div>
              <div class="ux-trend">
                <span v-if="clickTrend > 0" class="trend-up">↗ 变慢</span>
                <span v-else-if="clickTrend < 0" class="trend-down">↘ 加快</span>
                <span v-else class="trend-neutral">→ 稳定</span>
              </div>
            </div>
            <div class="ux-metric">
              <div class="ux-label">滚动性能</div>
              <div class="ux-value" :class="getScrollClass()">
                {{ getRealTimeValue('scrollPerformance', 0) }}px/s
              </div>
              <div class="ux-trend">
                <span v-if="scrollTrend > 0" class="trend-up">↗ 改善</span>
                <span v-else-if="scrollTrend < 0" class="trend-down">↘ 下降</span>
                <span v-else class="trend-neutral">→ 稳定</span>
              </div>
            </div>
            <div class="ux-metric">
              <div class="ux-label">布局偏移</div>
              <div class="ux-value" :class="getLayoutShiftClass()">
                {{ getRealTimeValue('cumulativeLayoutShift', 0).toFixed(3) }}
              </div>
              <div class="ux-target">目标: &lt; 0.1</div>
            </div>
            <div class="ux-metric">
              <div class="ux-label">感知加载</div>
              <div class="ux-value" :class="getPerceivedLoadClass()">
                {{ getRealTimeValue('perceivedLoadTime', 0) }}ms
              </div>
              <div class="ux-target">目标: &lt; 2000ms</div>
            </div>
          </div>
        </div>

        <!-- 实时资源加载 -->
        <div class="section-card resource-card">
          <h3 class="section-title">📥 实时资源加载</h3>
          <div class="realtime-resources">
            <div class="resource-metrics">
              <div class="resource-metric">
                <div class="resource-metric-label">当前加载</div>
                <div class="resource-metric-value">{{ getRealTimeValue('currentLoads', 0) }}</div>
              </div>
              <div class="resource-metric">
                <div class="resource-metric-label">加载速度</div>
                <div class="resource-metric-value">{{ getRealTimeValue('loadingSpeed', 0) }} kbps</div>
              </div>
            </div>
            <div class="resource-details">
              <div class="resource-best-worst">
                <div class="resource-item best">
                  <div class="resource-item-label">最快资源</div>
                  <div class="resource-item-value">{{ getRealTimeValue('fastestResource', '无') }}</div>
                </div>
                <div class="resource-item worst">
                  <div class="resource-item-label">最慢资源</div>
                  <div class="resource-item-value">{{ getRealTimeValue('slowestResource', '无') }}</div>
                </div>
              </div>
              <div class="resource-queue" v-if="loadingResources.length > 0">
                <div class="queue-title">加载队列 ({{ loadingResources.length }})</div>
                <div v-for="resource in loadingResources" :key="resource.name" 
                     class="queue-item">
                  <span class="queue-name">{{ resource.name }}</span>
                  <span class="queue-progress">{{ resource.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时网络趋势图 -->
        <div class="section-card chart-card">
          <h3 class="section-title">📈 实时网络趋势</h3>
          <div class="network-charts">
            <div class="chart-container">
              <div class="chart-title">延迟变化趋势</div>
              <div class="chart-legend">
                <span class="legend-item original">原始延迟</span>
                <span class="legend-item edge">边缘延迟</span>
              </div>
              <div class="chart-graph">
                <svg class="trend-chart" width="100%" height="120">
                  <!-- 网格线 -->
                  <line v-for="i in 5" :key="'grid-y-' + i" 
                        x1="0" :y1="i * 20" x2="100%" :y2="i * 20" 
                        class="grid-line"/>
                  
                  <!-- 原始延迟线 -->
                  <polyline v-if="rttHistory.length" 
                           :points="getRTTPoints()" 
                           class="line-original"/>
                  
                  <!-- 边缘延迟线 -->
                  <polyline v-if="edgeLatencyHistory.length" 
                           :points="getEdgeLatencyPoints()" 
                           class="line-edge"/>
                  
                  <!-- 数据点 -->
                  <circle v-for="(point, index) in rttHistory" 
                         :key="'rtt-point-' + index"
                         :cx="getXPosition(index)" 
                         :cy="getYPosition(point)" 
                         r="2" 
                         class="data-point"/>
                </svg>
              </div>
              <div class="chart-xaxis">
                <span>现在</span>
                <span>{{ rttHistory.length * 3 }}秒前</span>
              </div>
            </div>
            
            <div class="chart-container">
              <div class="chart-title">下载速度趋势</div>
              <div class="chart-graph">
                <svg class="trend-chart" width="100%" height="120">
                  <line v-for="i in 5" :key="'speed-grid-y-' + i" 
                        x1="0" :y1="i * 20" x2="100%" :y2="i * 20" 
                        class="grid-line"/>
                  <polyline v-if="speedHistory.length" 
                           :points="getSpeedPoints()" 
                           class="line-speed"/>
                  <circle v-for="(speed, index) in speedHistory" 
                         :key="'speed-point-' + index"
                         :cx="getXPosition(index)" 
                         :cy="getYPosition(speed, true)" 
                         r="2" 
                         class="data-point"/>
                </svg>
              </div>
              <div class="chart-xaxis">
                <span>现在</span>
                <span>{{ speedHistory.length * 5 }}秒前</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据日志控制台 -->
    <div class="console-section">
      <div class="console-header">
        <h3>📊 数据日志</h3>
        <div class="console-controls">
          <button @click="toggleConsole" class="console-btn">
            {{ showConsole ? '隐藏' : '显示' }}控制台
          </button>
          <button @click="clearConsole" class="console-btn">清空日志</button>
        </div>
      </div>
      
      <div v-if="showConsole" class="console-output">
        <div v-for="(log, index) in consoleLogs" :key="index" class="console-log">
          <span class="log-timestamp">[{{ log.timestamp }}]</span>
          <span class="log-source">{{ log.source }}</span>
          <span class="log-message">{{ log.message }}</span>
          <span v-if="log.data" class="log-data">{{ log.data }}</span>
        </div>
      </div>
    </div>

    <!-- 数据导出面板 -->
    <div v-if="showExportPanel" class="export-panel">
      <div class="export-content">
        <h3>📥 导出性能数据</h3>
        <div class="export-options">
          <label>
            <input type="radio" v-model="exportFormat" value="json"> JSON格式
          </label>
          <label>
            <input type="radio" v-model="exportFormat" value="csv"> CSV格式
          </label>
          <label>
            <input type="radio" v-model="exportFormat" value="excel"> Excel格式
          </label>
        </div>
        <div class="export-preview">
          <textarea readonly v-model="exportPreview"></textarea>
        </div>
        <div class="export-actions">
          <button @click="copyToClipboard" class="export-action">📋 复制</button>
          <button @click="downloadExport" class="export-action">💾 下载</button>
          <button @click="showExportPanel = false" class="export-action">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// 在脚本部分顶部添加以下类型定义
interface ResourceProgress {
  name: string
  progress: number
}

interface ConsoleLog {
  timestamp: string
  source: string
  message: string
  data?: any
}

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { performanceMonitor } from '@/utils/performance'
import type { 
  PerformanceMetrics, 
  ResourceTiming, 
  APIResponseTime 
} from '@/types/performance'


const route = useRoute()

// 状态管理
const isMonitoring = ref(true)
const showConsole = ref(true)
const showExportPanel = ref(false)
const exportFormat = ref('json')
const exportPreview = ref('')
const consoleLogs = ref<Array<{timestamp: string, source: string, message: string, data?: any}>>([])
const networkChangeCount = ref(0)
const clickTrend = ref(0)
const scrollTrend = ref(0)
const memoryPeak = ref(0)
const edgeImprovements = ref<number[]>([])
const loadingResources = ref<Array<{name: string, progress: number}>>([])
const rttHistory = ref<number[]>([])
const speedHistory = ref<number[]>([])
const edgeLatencyHistory = ref<number[]>([])

// 类型安全的性能数据
// 修改 metrics 的计算属性
const metrics = computed<PerformanceMetrics>(() => {
  const monitorMetrics = performanceMonitor.metrics as any; // 添加类型断言
  
  // 确保所有属性都有默认值
  return {
    pageLoadTime: monitorMetrics.pageLoadTime || 0,
    firstContentfulPaint: monitorMetrics.firstContentfulPaint || 0,
    largestContentfulPaint: monitorMetrics.largestContentfulPaint || 0,
    timeToInteractive: monitorMetrics.timeToInteractive || 0,
    resourceTimings: monitorMetrics.resourceTimings || [],
    apiResponseTimes: monitorMetrics.apiResponseTimes || [],
    networkInfo: monitorMetrics.networkInfo || {
      effectiveType: 'unknown',
      rtt: 0,
      downlink: 0,
      saveData: false,
      downlinkMax: undefined
    },
    realTimeMetrics: monitorMetrics.realTimeMetrics || {},
    edgeComputingStats: monitorMetrics.edgeComputingStats || {},
    qualityMetrics: monitorMetrics.qualityMetrics || {}
  } as PerformanceMetrics
})








// 计算资源类型统计
const resourceTypes = computed(() => {
  const types: Record<string, {type: string, count: number}> = {}
  metrics.value.resourceTimings?.forEach((resource: ResourceTiming) => {
    const type = resource.initiatorType || 'other'
    if (!types[type]) {
      types[type] = { type, count: 0 }
    }
    types[type].count++
  })
  return Object.values(types)
})

// 计算API统计
const apiStats = computed(() => {
  const times = metrics.value.apiResponseTimes || []
  if (times.length === 0) {
    return { 
      total: 0, 
      avgTime: 0, 
      successRate: 0, 
      slowest: null as APIResponseTime | null 
    }
  }
  
  const total = times.length
  const avgTime = Math.round(times.reduce((sum, t) => sum + t.duration, 0) / total)
  const successCount = times.filter(t => t.success !== false).length
  const successRate = Math.round((successCount / total) * 100)
  const slowest = times.reduce((slowest: APIResponseTime | null, current: APIResponseTime) => 
    current.duration > (slowest?.duration || 0) ? current : slowest, null)
  
  return { total, avgTime, successRate, slowest }
})

// 初始化监控
onMounted(() => {
  if (!performanceMonitor.isMonitoring) {
    performanceMonitor.startMonitoring()
  }
  
  // 监听网络变化
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection
  
  if (connection) {
    connection.addEventListener('change', () => {
      networkChangeCount.value++
      addConsoleLog('网络', '网络连接状态变化')
    })
  }
  
  // 每3秒记录一次实时数据
  const interval = setInterval(() => {
    updateRealTimeData()
  }, 3000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})






// 安全的实时数据获取函数
const getRealTimeValue = (key: string, defaultValue: any = 0) => {
  const metricsData = metrics.value
  
  // 尝试从多层结构中获取值
  if (metricsData.realTimeMetrics) {
    // 检查第一层
    if (key in metricsData.realTimeMetrics && metricsData.realTimeMetrics[key] !== undefined) {
      return metricsData.realTimeMetrics[key]
    }
    
    // 检查嵌套结构
    const nestedKeys = [
      'realTimeNetwork',
      'rendering', 
      'userExperience',
      'edgeMetrics',
      'resourceLoading'
    ]
    
    for (const nestedKey of nestedKeys) {
      const nestedObj = metricsData.realTimeMetrics[nestedKey as keyof typeof metricsData.realTimeMetrics]
      if (nestedObj && typeof nestedObj === 'object' && key in nestedObj) {
        return (nestedObj as any)[key]
      }
    }
  }
  
  // 检查其他可能的属性位置
  if (key in metricsData) {
    return metricsData[key as keyof PerformanceMetrics]
  }
  
  if (metricsData.edgeComputingStats && key in metricsData.edgeComputingStats) {
    return (metricsData.edgeComputingStats as any)[key]
  }
  
  if (metricsData.qualityMetrics && key in metricsData.qualityMetrics) {
    return (metricsData.qualityMetrics as any)[key]
  }
  
  return defaultValue
}

// 更新实时数据
const updateRealTimeData = () => {
  // 记录历史数据
  const currentRTT = getRealTimeValue('rtt', 0)
  const currentSpeed = getRealTimeValue('downlink', 0)
  const currentEdgeLatency = getRealTimeValue('edgeLatency', 0)
  
  rttHistory.value.unshift(currentRTT)
  speedHistory.value.unshift(currentSpeed)
  edgeLatencyHistory.value.unshift(currentEdgeLatency)
  
  // 限制历史数据长度
  if (rttHistory.value.length > 20) rttHistory.value.pop()
  if (speedHistory.value.length > 20) speedHistory.value.pop()
  if (edgeLatencyHistory.value.length > 20) edgeLatencyHistory.value.pop()
  
  // 记录边缘计算改善
  const improvement = calculateLatencyReduction()
  if (improvement > 0) {
    edgeImprovements.value.unshift(improvement)
    if (edgeImprovements.value.length > 10) edgeImprovements.value.pop()
  }
  
  // 模拟加载资源
  simulateLoadingResources()
  
  // 更新内存峰值
  const memory = getRealTimeValue('memoryUsage', 0)
  if (memory > memoryPeak.value) {
    memoryPeak.value = memory
  }
}

// 模拟加载资源
const simulateLoadingResources = () => {
  if (Math.random() > 0.7) {
    const resources = [
      'https://cdn.example.com/app.js',
      'https://cdn.example.com/style.css',
      'https://api.example.com/data.json',
      'https://cdn.example.com/image.jpg',
      'https://fonts.example.com/font.woff2'
    ]
    
    const newResource: ResourceProgress = {
  name: resources[Math.floor(Math.random() * resources.length)]!,
  progress: 0
}
    
    loadingResources.value.unshift(newResource)
    
    // 模拟加载进度
    const interval = setInterval(() => {
      const index = loadingResources.value.findIndex(r => r === newResource)
      if (index !== -1) {
        // 使用可选链操作符
        const resource = loadingResources.value[index]
        if (resource) {
          resource.progress += 10
          if (resource.progress >= 100) {
            loadingResources.value.splice(index, 1)
            clearInterval(interval)
          }
        } else {
          clearInterval(interval)
        }
      } else {
        clearInterval(interval)
      }
    }, 300)
    
    if (loadingResources.value.length > 5) {
      loadingResources.value.pop()
    }
  }
}

// 控制监控
const toggleMonitoring = () => {
  isMonitoring.value = !isMonitoring.value
  if (isMonitoring.value) {
    performanceMonitor.startMonitoring()
    addConsoleLog('系统', '性能监控已启动')
  } else {
    performanceMonitor.stopMonitoring()
    addConsoleLog('系统', '性能监控已暂停')
  }
}

// 导出数据
const exportData = () => {
  try {
    const summary = performanceMonitor.getPerformanceSummary()
    const realtime = performanceMonitor.getRealTimeSummary()
    const history = JSON.parse(localStorage.getItem('performance_history') || '[]')
    
    const exportData = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      summary,
      realtime,
      history
    }
    
    if (exportFormat.value === 'json') {
      exportPreview.value = JSON.stringify(exportData, null, 2)
    } else if (exportFormat.value === 'csv') {
      exportPreview.value = convertToCSV(exportData)
    } else {
      exportPreview.value = 'Excel导出功能需要后端支持'
    }
    
    showExportPanel.value = true
  } catch (error) {
    console.error('导出数据失败:', error)
    addConsoleLog('错误', '导出数据失败', error)
  }
}

// 清空数据
const clearData = () => {
  performanceMonitor.clear()
  consoleLogs.value = []
  rttHistory.value = []
  speedHistory.value = []
  edgeLatencyHistory.value = []
  loadingResources.value = []
  networkChangeCount.value = 0
  addConsoleLog('系统', '所有性能数据已清空')
}

// 控制台相关
const addConsoleLog = (source: string, message: string, data?: any) => {
  consoleLogs.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    source,
    message,
    data: data ? JSON.stringify(data, null, 2) : undefined
  })
  
  if (consoleLogs.value.length > 50) {
    consoleLogs.value.pop()
  }
}

const toggleConsole = () => {
  showConsole.value = !showConsole.value
}

const clearConsole = () => {
  consoleLogs.value = []
}

// 图表相关
const getRTTPoints = () => {
  if (rttHistory.value.length < 2) return ''
  const maxRTT = Math.max(...rttHistory.value, 100)
  return rttHistory.value.map((rtt, index) => {
    const x = (index / (rttHistory.value.length - 1)) * 100
    const y = 100 - (rtt / maxRTT) * 100
    return `${x},${y}`
  }).join(' ')
}

const getEdgeLatencyPoints = () => {
  if (edgeLatencyHistory.value.length < 2) return ''
  const maxLatency = Math.max(...edgeLatencyHistory.value, 100)
  return edgeLatencyHistory.value.map((latency, index) => {
    const x = (index / (edgeLatencyHistory.value.length - 1)) * 100
    const y = 100 - (latency / maxLatency) * 100
    return `${x},${y}`
  }).join(' ')
}

const getSpeedPoints = () => {
  if (speedHistory.value.length < 2) return ''
  const maxSpeed = Math.max(...speedHistory.value, 10)
  return speedHistory.value.map((speed, index) => {
    const x = (index / (speedHistory.value.length - 1)) * 100
    const y = 100 - (speed / maxSpeed) * 100
    return `${x},${y}`
  }).join(' ')
}

const getXPosition = (index: number) => {
  return (index / Math.max(rttHistory.value.length - 1, 1)) * 100
}

const getYPosition = (value: number, isSpeed = false) => {
  if (isSpeed) {
    const maxSpeed = Math.max(...speedHistory.value, 10)
    return 100 - (value / maxSpeed) * 100
  } else {
    const maxValue = Math.max(...rttHistory.value, 100)
    return 100 - (value / maxValue) * 100
  }
}

// 辅助函数
const getNetworkStatus = () => {
  const rtt = getRealTimeValue('rtt', 0)
  if (rtt < 50) return '优秀'
  if (rtt < 100) return '良好'
  if (rtt < 200) return '一般'
  return '较差'
}

const getNetworkClass = (): string => {
  const type = getRealTimeValue('effectiveType', 'unknown')
  return type
}

const getCurrentRTT = () => {
  return getRealTimeValue('rtt', 0)
}

const getCurrentSpeed = () => {
  return getRealTimeValue('downlink', 0).toFixed(2)
}

const getEdgeImprovement = () => {
  return calculateLatencyReduction()
}

const calculateLatencyReduction = (): number => {
  const original = getRealTimeValue('originalRTT', getRealTimeValue('rtt', 0))
  const edge = getRealTimeValue('edgeLatency', 0)
  if (original === 0) return 0
  return Math.round(((original - edge) / original) * 100)
}

const getResourcePercentage = (count: number) => {
  const total = resourceTypes.value.reduce((sum, r) => sum + r.count, 0)
  if (total === 0) return 0
  return (count / total) * 100
}

const getResourceDetails = () => {
  return (metrics.value.resourceTimings || []).slice(0, 5).map(resource => ({
    name: resource.name,
    duration: resource.duration,
    size: resource.size || resource.transferSize
  }))
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getTopApis = (): Array<{name: string, time: number}> => {
  return (metrics.value.apiResponseTimes || [])
    .map(api => ({
      name: api.name || api.url,
      time: api.duration
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 5)
}

const getApiBarWidth = (time: number) => {
  const topApis = getTopApis()
  if (topApis.length === 0) return 0
  const maxTime = Math.max(...topApis.map(api => api.time), 1000)
  return (time / maxTime) * 100
}

const getApiBarClass = (time: number) => {
  if (time < 100) return 'good'
  if (time < 300) return 'fair'
  return 'poor'
}

const convertToCSV = (data: any): string => {
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

// 状态判断函数
const getMetricClass = (type: string, value: number): string => {
  const thresholds: Record<string, {good: number, poor: number}> = {
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    tti: { good: 3800, poor: 7300 },
    cls: { good: 0.1, poor: 0.25 }
  }
  
  if (!thresholds[type]) return ''
  if (value <= thresholds[type].good) return 'good'
  if (value <= thresholds[type].poor) return 'fair'
  return 'poor'
}

const getCLS = (): number => {
  return getRealTimeValue('cumulativeLayoutShift', 0).toFixed(3)
}

const getRTStatus = (type: string): string => {
  const value = getRealTimeValue(type, 0)
  if (type === 'rtt') {
    if (value < 50) return 'excellent'
    if (value < 100) return 'good'
    if (value < 200) return 'fair'
    return 'poor'
  }
  return 'neutral'
}

const getJitterStatus = (): string => {
  const jitter = getRealTimeValue('jitter', 0)
  if (jitter < 20) return 'excellent'
  if (jitter < 50) return 'good'
  if (jitter < 100) return 'fair'
  return 'poor'
}

const getSpeedStatus = (): string => {
  const speed = getRealTimeValue('downlink', 0)
  if (speed > 20) return 'excellent'
  if (speed > 10) return 'good'
  if (speed > 2) return 'fair'
  return 'poor'
}

const getPacketLossStatus = (): string => {
  const loss = getRealTimeValue('packetLoss', 0)
  if (loss < 1) return 'excellent'
  if (loss < 3) return 'good'
  if (loss < 5) return 'fair'
  return 'poor'
}

const getConnectionStability = (): string => {
  return getRealTimeValue('connectionStability', 'fair')
}

const getStabilityStatus = (): string => {
  return getConnectionStability()
}

const getReliabilityStatus = (): string => {
  const reliability = getRealTimeValue('reliability', 0)
  if (reliability > 90) return 'excellent'
  if (reliability > 80) return 'good'
  if (reliability > 60) return 'fair'
  return 'poor'
}

const getFPSClass = (): string => {
  const fps = getRealTimeValue('fps', 0)
  if (fps >= 55) return 'excellent'
  if (fps >= 45) return 'good'
  if (fps >= 30) return 'fair'
  return 'poor'
}

const getFPSPercentage = (): number => {
  const fps = getRealTimeValue('fps', 0)
  return Math.min(100, (fps / 60) * 100)
}

const getFrameTimeClass = (): string => {
  const frameTime = getRealTimeValue('frameTime', 0)
  if (frameTime < 16.7) return 'excellent'
  if (frameTime < 33.3) return 'good'
  if (frameTime < 50) return 'fair'
  return 'poor'
}

const getFrameTimePercentage = (): number => {
  const frameTime = getRealTimeValue('frameTime', 0)
  return Math.min(100, (frameTime / 100) * 100)
}

const getMemoryClass = (): string => {
  const memory = getRealTimeValue('memoryUsage', 0)
  if (memory < 100) return 'excellent'
  if (memory < 200) return 'good'
  if (memory < 500) return 'fair'
  return 'poor'
}

const getDOMClass = (): string => {
  const domNodes = getRealTimeValue('domNodes', 0)
  if (domNodes < 1000) return 'excellent'
  if (domNodes < 3000) return 'good'
  if (domNodes < 5000) return 'fair'
  return 'poor'
}

const getResponseClass = (): string => {
  const response = getRealTimeValue('clickResponseTime', 0)
  if (response < 50) return 'excellent'
  if (response < 100) return 'good'
  if (response < 200) return 'fair'
  return 'poor'
}

const getScrollClass = (): string => {
  const scroll = getRealTimeValue('scrollPerformance', 0)
  if (scroll > 2000) return 'excellent'
  if (scroll > 1000) return 'good'
  if (scroll > 500) return 'fair'
  return 'poor'
}

const getLayoutShiftClass = (): string => {
  const shift = getRealTimeValue('cumulativeLayoutShift', 0)
  if (shift < 0.1) return 'excellent'
  if (shift < 0.25) return 'good'
  if (shift < 0.5) return 'fair'
  return 'poor'
}

const getPerceivedLoadClass = (): string => {
  const loadTime = getRealTimeValue('perceivedLoadTime', 0)
  if (loadTime < 2000) return 'excellent'
  if (loadTime < 3000) return 'good'
  if (loadTime < 4000) return 'fair'
  return 'poor'
}

const getRTTTrend = (): string => {
  if (rttHistory.value.length < 2) return 'neutral'
  const latest = rttHistory.value[0]
  const previous = rttHistory.value[1]

   // 添加undefined检查
  if (latest === undefined || previous === undefined) return 'neutral'
  if (latest < previous) return 'down'
  if (latest > previous) return 'up'
  return 'neutral'
}

const getJitterTrend = (): string => {
  return Math.random() > 0.5 ? 'up' : 'down'
}

const getSpeedTrend = (): string => {
  if (speedHistory.value.length < 2) return 'neutral'
  const latest = speedHistory.value[0]
  const previous = speedHistory.value[1]
   // 添加undefined检查
  if (latest === undefined || previous === undefined) return 'neutral'
  if (latest > previous) return 'up'
  if (latest < previous) return 'down'
  return 'neutral'
}

const getImprovementClass = (improvement: number): string => {
  if (improvement > 50) return 'high'
  if (improvement > 30) return 'medium'
  return 'low'
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(exportPreview.value)
    addConsoleLog('系统', '数据已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const downloadExport = () => {
  const blob = new Blob([exportPreview.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-data-${new Date().toISOString().slice(0, 19)}.${exportFormat.value === 'json' ? 'json' : 'csv'}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  addConsoleLog('系统', '数据已下载')
}
</script>

<style scoped>
.enhanced-performance-monitor {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
  padding: 20px;
}

/* 全局状态栏 */
.global-status-bar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.status-overview {
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.status-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.status-value {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.2);
}

.status-actions {
  display: flex;
  gap: 10px;
}

.monitor-btn, .export-btn, .clear-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.monitor-btn {
  background: rgba(16, 185, 129, 0.3);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.monitor-btn:hover {
  background: rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

.monitor-btn.active {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.5);
}

.export-btn {
  background: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.export-btn:hover {
  background: rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.clear-btn {
  background: rgba(156, 163, 175, 0.3);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.5);
}

.clear-btn:hover {
  background: rgba(156, 163, 175, 0.4);
  transform: translateY(-1px);
}

/* 主布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* 公共卡片样式 */
.section-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 左侧面板样式 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.core-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.core-metric-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.core-metric-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.core-metric-item.good::before {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.core-metric-item.fair::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.core-metric-item.poor::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.core-metric-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 500;
}

.core-metric-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
  margin-bottom: 4px;
}

.core-metric-target {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

/* 右侧面板样式 */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.realtime-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

@media (max-width: 768px) {
  .core-metrics-grid,
  .realtime-metrics-grid {
    grid-template-columns: 1fr;
  }
}

/* 网络图表 */
.network-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
}

.chart-title {
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.chart-legend {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.legend-item::before {
  content: '';
  width: 12px;
  height: 2px;
  border-radius: 1px;
}

.legend-item.original::before {
  background: #3b82f6;
}

.legend-item.edge::before {
  background: #10b981;
}

.trend-chart {
  width: 100%;
  height: 120px;
}

.grid-line {
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 1;
}

.line-original {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.line-edge {
  fill: none;
  stroke: #10b981;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 5,5;
}

.line-speed {
  fill: none;
  stroke: #8b5cf6;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.data-point {
  fill: currentColor;
  stroke: white;
  stroke-width: 1;
  transition: all 0.3s ease;
}

.data-point:hover {
  r: 4;
  cursor: pointer;
}

.chart-xaxis {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

/* 控制台样式 */
.console-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 20px;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.console-header h3 {
  margin: 0;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.console-controls {
  display: flex;
  gap: 10px;
}

.console-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.console-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.console-output {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
}

.console-log {
  padding: 4px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  line-height: 1.4;
}

.console-log:last-child {
  border-bottom: none;
}

.log-timestamp {
  color: #6b7280;
  margin-right: 10px;
}

.log-source {
  color: #3b82f6;
  font-weight: 600;
  margin-right: 10px;
}

.log-message {
  color: #e5e7eb;
}

.log-data {
  color: #f59e0b;
  margin-left: 10px;
  font-size: 0.8rem;
}

/* 导出面板 */
.export-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.export-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.export-content h3 {
  color: white;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
}

.export-options {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.export-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
}

.export-options input[type="radio"] {
  accent-color: #667eea;
}

.export-preview textarea {
  width: 100%;
  height: 300px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  resize: none;
  margin-bottom: 20px;
}

.export-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.export-action {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-action:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .global-status-bar {
    flex-direction: column;
    gap: 15px;
  }
  
  .status-overview {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .network-charts {
    grid-template-columns: 1fr;
  }
  
  .console-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>