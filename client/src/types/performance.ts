// 资源类型定义
export interface ResourceTiming {
  name: string;
  duration: number;
  transferSize: number;
  initiatorType: string;
  startTime: number;
  size?: number; // 添加可选属性
}

// API响应时间类型
export interface APIResponseTime {
  id: number;
  name?: string; // 改为可选
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  time?: number; // 改为可选
  success?: boolean; // 改为可选
}

// 实时监控指标类型
export interface RealTimeMetrics {
  realTimeNetwork: {
    rtt: number;
    jitter: number;
    packetLoss: number;
    downlink: number;
    effectiveType: string;
  };
  rendering: {
    fps: number;
    frameTime: number;
    memoryUsage: number;
    domNodes: number;
  };
  userExperience: {
    clickResponseTime: number;
    scrollPerformance: number;
    cumulativeLayoutShift: number;
    perceivedLoadTime: number;
  };
  edgeMetrics: {
    edgeLatency: number;
    edgeTimeSaved: number;
    cacheHitRate: number;
    edgeNode: string;
    edgeImprovement: number;
  };
  resourceLoading: {
    currentLoads: number;
    loadingSpeed: number;
    fastestResource: string;
    slowestResource: string;
  };
  [key: string]: any; // 添加索引签名
}

// 网络信息类型
export interface NetworkInfo {
  effectiveType: string;
  rtt: number;
  downlink: number;
  saveData: boolean;
  downlinkMax?: number;
  [key: string]: any; // 添加索引签名
}

// 性能监控器主类型
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  resourceTimings: ResourceTiming[];
  apiResponseTimes: APIResponseTime[];
  interactionMetrics: Array<{type: string; duration: number; timestamp: number}>;
  networkInfo: NetworkInfo;
  realTimeMetrics: RealTimeMetrics;
  qualityMetrics: {
    overallScore: number;
    networkScore: number;
    renderingScore: number;
    experienceScore: number;
  };
  edgeComputingStats: {
    originalRTT?: number;
    edgeLatency?: number;
    edgeTimeSaved?: number;
    cacheHitRate?: number;
    edgeNode?: string;
  };
  [key: string]: any; // 添加索引签名
}