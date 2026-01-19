<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 头部 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">实时聊天室</h1>
      <p class="mt-2 text-gray-600">与玩家实时交流，支持文字、图片，基于边缘计算优化延迟</p>
      
      <!-- 连接状态 -->
      <div class="mt-4 flex items-center space-x-4">
        <div class="flex items-center">
          <div 
            :class="[
              'w-3 h-3 rounded-full mr-2',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            ]"
          ></div>
          <span class="text-sm text-gray-600">
            {{ isConnected ? '已连接' : '未连接' }}
          </span>
        </div>
        <div v-if="isConnected" class="text-sm text-gray-600">
          延迟: <span class="font-semibold">{{ latency }}ms</span>
        </div>
        <div v-if="isConnected" class="text-sm text-gray-600">
          在线人数: <span class="font-semibold">{{ onlineCount }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 左侧：聊天室列表 -->
      <div class="lg:col-span-1">
        <div class="card sticky top-8">
          <h3 class="text-lg font-semibold mb-4">聊天室</h3>
          
          <!-- 聊天室列表 -->
          <div class="space-y-2 max-h-72 overflow-y-auto" style="height: 288px;"> <!-- 4个聊天室 * 72px高度 -->
  <button
    v-for="room in chatRooms"
    :key="room.id"
    @click="switchRoom(room.id)"
    :class="[
      'w-full text-left px-4 py-3 rounded-lg transition-colors',
      activeRoomId === room.id
        ? 'bg-primary-50 border border-primary-200'
        : 'hover:bg-gray-50'
    ]"
  >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900">{{ room.name }}</div>
                  <div v-if="room.description" class="text-sm text-gray-500">
                    {{ room.description }}
                  </div>
                </div>
                <div v-if="room.unreadCount > 0" class="badge badge-primary">
                  {{ room.unreadCount }}
                </div>
              </div>
            </button>
          </div>

          <!-- 创建聊天室 -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-3">创建新聊天室</h4>
            <div class="space-y-3">
              <input
                v-model="newRoomName"
                type="text"
                placeholder="房间名称"
                class="input-field text-sm"
              />
              <input
                v-model="newRoomDescription"
                type="text"
                placeholder="房间描述（可选）"
                class="input-field text-sm"
              />
              <button
                @click="createChatRoom"
                :disabled="!newRoomName.trim()"
                class="btn-primary w-full text-sm"
              >
                创建聊天室
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：聊天区域 -->
      <div class="lg:col-span-3">
        <div class="card h-[600px] flex flex-col">
          <!-- 聊天室头部 -->
          <div class="border-b border-gray-200 pb-4 mb-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ activeRoom?.name || '选择聊天室' }}
                </h3>
                <p v-if="activeRoom?.description" class="text-sm text-gray-500 mt-1">
                  {{ activeRoom.description }}
                </p>
              </div>
              <div class="text-sm text-gray-500">
                房间ID: {{ activeRoomId }}
              </div>
            </div>
            
            <!-- 用户输入状态 -->
            <div v-if="typingUsers.length > 0" class="mt-2 text-sm text-gray-500">
              <i class="el-icon-edit"></i>
              <span class="ml-1">
                {{ typingUsers.join(', ') }} {{ typingUsers.length > 1 ? '正在输入...' : '正在输入...' }}
              </span>
            </div>
          </div>

          <!-- 消息区域 -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-4 space-y-4"
            @scroll="handleScroll"
          >
            <!-- 加载更多 -->
            <div v-if="loadingMore" class="text-center py-4">
              <i class="el-icon-loading text-primary-600"></i>
            </div>

            <!-- 消息列表 -->
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-group"
              :class="{ 'justify-end': isOwnMessage(message.author.id) }"
            >
              <!-- 用户头像 -->
              <div
                v-if="!isOwnMessage(message.author.id)"
                class="flex-shrink-0 mr-3"
              >
                <img
                  :src="message.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + message.author.username"
                  :alt="message.author.username"
                  class="w-8 h-8 rounded-full"
                />
              </div>

              <!-- 消息内容 -->
              <div
                :class="[
                  'max-w-[70%]',
                  isOwnMessage(message.author.id) ? 'bg-primary-100' : 'bg-gray-100'
                ]"
                class="rounded-2xl px-4 py-2"
              >
                <!-- 消息头部 -->
                <div
                  v-if="!isOwnMessage(message.author.id)"
                  class="flex items-center space-x-2 mb-1"
                >
                  <span class="text-sm font-medium text-gray-900">
                    {{ message.author.username }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ formatTime(message.createdAt) }}
                  </span>
                </div>

                <!-- 消息内容 -->
                <p class="text-gray-800">{{ message.content }}</p>

                <!-- 图片 -->
                <div
                  v-if="message.images?.length"
                  class="mt-2 grid grid-cols-2 gap-2"
                >
                  <img
                    v-for="(image, index) in message.images"
                    :key="index"
                    :src="image"
                    :alt="`图片${Number(index) + 1}`"
                    class="w-full h-32 object-cover rounded-lg cursor-pointer"
                    @click="openImage(image)"
                  />
                </div>

                <!-- 消息状态（自己的消息） -->
                <div
                  v-if="isOwnMessage(message.author.id)"
                  class="flex items-center justify-end mt-1"
                >
                  <span class="text-xs text-gray-500 mr-2">
                    {{ formatTime(message.createdAt) }}
                  </span>
                  <i
                    v-if="message.id === sendingMessageId"
                    class="el-icon-loading text-xs"
                  ></i>
                  <i
                    v-else-if="message.status === 'sent'"
                    class="el-icon-check text-xs text-gray-400"
                  ></i>
                  <i
                    v-else-if="message.status === 'error'"
                    class="el-icon-warning text-xs text-red-500"
                  ></i>
                </div>
              </div>

              <!-- 自己头像 -->
              <div
                v-if="isOwnMessage(message.author.id)"
                class="flex-shrink-0 ml-3"
              >
                <img
                  :src="authStore.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authStore.user?.username"
                  :alt="authStore.user?.username"
                  class="w-8 h-8 rounded-full"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-if="messages.length === 0 && !isLoading"
              class="text-center py-12"
            >
              <i class="el-icon-chat-line-round text-4xl text-gray-400"></i>
              <p class="mt-2 text-gray-600">还没有消息，快说点什么吧！</p>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="border-t border-gray-200 pt-4 mt-4">
            <!-- 图片预览 -->
            <div
              v-if="imagePreviews.length > 0"
              class="mb-4 flex space-x-2 overflow-x-auto pb-2"
            >
              <div
                v-for="(image, index) in imagePreviews"
                :key="index"
                class="relative"
              >
                <img
                  :src="image"
                  :alt="`预览 ${index + 1}`"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  @click="removeImagePreview(index)"
                  class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full"
                >
                  <i class="el-icon-close"></i>
                </button>
              </div>
            </div>

            <div class="flex items-end space-x-3">
              <!-- 图片上传按钮 -->
              <label class="flex-shrink-0 cursor-pointer">
                <i class="el-icon-picture text-2xl text-gray-400 hover:text-primary-600"></i>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleImageUpload"
                />
              </label>

              <!-- 文本输入 -->
              <div class="flex-1">
                <textarea
                  v-model="messageInput"
                  ref="messageInputRef"
                  rows="2"
                  class="input-field w-full resize-none"
                  placeholder="输入消息..."
                  @input="handleTyping"
                  @keydown.enter.exact.prevent="sendMessage"
                ></textarea>
              </div>

              <!-- 发送按钮 -->
              <button
                @click="sendMessage"
                :disabled="!canSend"
                class="flex-shrink-0 btn-primary px-6"
                :class="{ 'opacity-50 cursor-not-allowed': !canSend }"
                ref="sendButtonRef"
              >
                发送
              </button>
            </div>

            <!-- 提示 -->
            <p class="text-xs text-gray-500 mt-2">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>

        <!-- 性能统计 -->
        <div class="card mt-6">
          <h3 class="text-lg font-semibold mb-4">聊天性能统计</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-600">{{ latency }}ms</div>
              <div class="text-sm text-gray-500">平均延迟</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ messageCount }}</div>
              <div class="text-sm text-gray-500">总消息数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ onlineCount }}</div>
              <div class="text-sm text-gray-500">在线人数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ successRate }}%</div>
              <div class="text-sm text-gray-500">发送成功率</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      @click="selectedImage = null"
    >
      <img
        :src="selectedImage"
        alt="查看图片"
        class="max-w-full max-h-full"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import socketService from '@/services/socket.service'
import chatService from '@/services/chat.service'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const authStore = useAuthStore()

// 状态 - 修复1: 明确类型定义
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<string>('')  // ✅ 明确类型为string
const messageInputRef = ref<HTMLTextAreaElement>()  // 为DOM元素添加ref
const sendButtonRef = ref<HTMLButtonElement>()
const activeRoomId = ref<string>('general')  // ✅ 明确设置默认值
const newRoomName = ref('')
const newRoomDescription = ref('')
const imagePreviews = ref<string[]>([])
const selectedImage = ref<string | null>(null)
const sendingMessageId = ref<string | null>(null)
const messages = ref<any[]>([])
const chatRooms = ref<any[]>([
  { id: 'general', name: '综合讨论区', description: '综合游戏讨论', unreadCount: 0 },
  { id: 'lol', name: '英雄联盟', description: 'LOL玩家聚集地', unreadCount: 0 },
  { id: 'csgo', name: 'CS:GO', description: '反恐精英全球攻势', unreadCount: 0 },
  { id: 'valorant', name: '无畏契约', description: 'Valorant玩家社区', unreadCount: 0 },
])
const typingUsers = ref<string[]>([])
const loadingMore = ref(false)
const isLoading = ref(false)
const latency = ref(0)
const onlineCount = ref(0)
const messageCount = ref(0)
const successCount = ref(0)
const totalSent = ref(0)
let latencyTests: number[] = []
let typingTimeout: number | null = null
let socketConnected = false  // 添加手动跟踪
const socket = ref<any>(null)  // 存储Socket实例
  const messageQueue = ref<any[]>([])  // 添加消息队列

// 计算属性 - 修复2: 安全的canSend计算
const isConnected = computed(() => socketConnected)  // 使用手动跟踪
const activeRoom = computed(() => chatRooms.value.find(r => r.id === activeRoomId.value))

// 修复canSend计算属性
const canSend = computed(() => {
  try {
    // 确保messageInput.value是字符串
    const message = typeof messageInput.value === 'string' 
      ? messageInput.value 
      : String(messageInput.value || '')
    
    const hasMessage = message.trim().length > 0
    const hasImages = imagePreviews.value.length > 0
    const isAuth = authStore.isAuthenticated
    
    // 添加调试日志
    if (isDebug) {
      console.log('🧮 canSend计算:', {
        message,
        hasMessage,
        hasImages,
        isAuth,
        result: (hasMessage || hasImages) && isAuth
      })
    }
    
    return (hasMessage || hasImages) && isAuth
  } catch (error) {
    console.error('canSend计算错误:', error)
    return false
  }
})

const successRate = computed(() => {
  if (totalSent.value === 0) return 100
  return Math.round((successCount.value / totalSent.value) * 100)
})

// 调试标志
const isDebug = true

// 添加watch来监控messageInput的变化
watch(messageInput, (newValue, oldValue) => {
  if (isDebug) {
    console.log('🔍 messageInput变化:', {
      新值: newValue,
      新值类型: typeof newValue,
      旧值: oldValue,
      旧值类型: typeof oldValue
    })
  }
})

// 检查是否是自己发的消息
const isOwnMessage = (authorId: string) => {
  return authStore.user?.id === authorId
}

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), { 
    addSuffix: true,
    locale: zhCN 
  })
}

// 替换现有的initSocket函数
// 替换ChatView中的initSocket函数
const initSocket = async () => {
  console.log('🔌 开始初始化Socket连接...')
  
  // 1. 确保用户已登录
  if (!authStore.isAuthenticated) {
    console.warn('⚠️ 用户未登录，无法初始化Socket')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!authStore.isAuthenticated) {
      console.error('❌ 等待1秒后用户仍未登录，放弃Socket连接')
      return
    }
  }
  
  // 2. 确保roomId存在
  if (!activeRoomId.value) {
    console.warn('⚠️ activeRoomId为空，设置为默认值')
    activeRoomId.value = 'general'
  }
  
  console.log('🔧 Socket连接参数:', {
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.token,
    roomId: activeRoomId.value,
    userId: authStore.user?.id
  })
  
  try {
    // 3. 连接Socket
    console.log('🔌 连接Socket...')
    await socketService.connect()
    
    // ✅ 修复：通过公共方法获取socket实例
    const socketInstance = socketService.getSocket()
    socket.value = socketInstance
    
    if (!socketInstance) {
      console.error('❌ Socket连接失败: socket实例为空')
      socketConnected = false
      return
    }
    
    // ✅ 修复：正确的检查连接状态的方法
    if (!socketService.isConnected()) {
      console.error('❌ Socket连接失败: 未连接状态')
      socketConnected = false
      return
    }
    
    // 4. 设置基础事件监听
    socketInstance.on('connect', () => {
      console.log('✅ Socket已连接，ID:', socketInstance.id)
      socketConnected = true
      
      // 立即加入房间
      if (activeRoomId.value) {
        console.log(`🎯 加入房间: ${activeRoomId.value}`)
        socketService.joinRoom(activeRoomId.value)
        
        // 发送排队消息
        if (messageQueue.value.length > 0) {
          console.log(`📤 发送 ${messageQueue.value.length} 条排队消息`)
          messageQueue.value.forEach(message => {
            socketService.sendMessage(activeRoomId.value, message)
          })
          messageQueue.value = []
        }
      }
    })
    
    socketInstance.on('connect_error', (error: any) => {
      console.error('❌ Socket连接错误:', error)
      socketConnected = false
    })
    
    socketInstance.on('disconnect', (reason: string) => {
      console.log('🔌 Socket断开连接:', reason)
      socketConnected = false
    })
    
    // 5. 检查是否已连接
    if (socketInstance.connected) {
      console.log('✅ Socket立即连接成功')
      socketConnected = true
      
      // 立即加入房间
      if (activeRoomId.value) {
        console.log(`🎯 立即加入房间: ${activeRoomId.value}`)
        socketService.joinRoom(activeRoomId.value)
      }
    }
    
    // 6. 设置聊天事件监听
    setupSocketListeners()
    
  } catch (error) {
    console.error('❌ Socket初始化失败:', error)
    socketConnected = false
  }
}

// 设置Socket监听器
const setupSocketListeners = () => {
  try {
    // 监听新消息
    socketService.onNewMessage((message) => {
      if (message.roomId === activeRoomId.value) {
        addMessage(message)
        scrollToBottom()
      } else {
        // 更新未读计数
        const room = chatRooms.value.find(r => r.id === message.roomId)
        if (room) {
          room.unreadCount = (room.unreadCount || 0) + 1
        }
      }
    })

    // 监听用户加入
    socketService.onUserJoined((data) => {
      console.log('用户加入:', data)
      onlineCount.value++
    })

    // 监听用户输入状态
    socketService.onUserTyping((data) => {
      if (data.userId !== authStore.user?.id) {
        if (data.isTyping && !typingUsers.value.includes(data.userId)) {
          typingUsers.value.push(data.userId)
        } else if (!data.isTyping) {
          typingUsers.value = typingUsers.value.filter(id => id !== data.userId)
        }
      }
    })
    
    console.log('✅ Socket监听器设置完成')
  } catch (error) {
    console.error('设置Socket监听器失败:', error)
  }
}

// 加载消息历史
const loadMessages = async () => {
  if (!activeRoomId.value) return
  
  isLoading.value = true
  try {
    console.log(`📥 加载房间消息: ${activeRoomId.value}`)
    const response = await chatService.getRoomMessages(activeRoomId.value, 1, 50)
    
    console.log('📤 加载消息结果:', {
      success: response.success,
      messagesCount: response.data?.messages?.length || 0
    })
    
    if (response.success && response.data) {
      // ✅ 从 response.data.messages 获取消息列表
      messages.value = response.data.messages || []
      console.log(`✅ 加载了 ${messages.value.length} 条消息`)
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    } else {
      console.warn('⚠️ 加载消息失败:', response.error)
      messages.value = []
    }
  } catch (error) {
    console.error('❌ 加载消息失败:', error)
    messages.value = []
  } finally {
    isLoading.value = false
  }
}

// 添加消息
const addMessage = (message: any) => {
  messages.value.push({
    ...message,
    status: 'sent'
  })
  messageCount.value++
  
  // 如果发送中，标记为成功
  if (message.id === sendingMessageId.value) {
    sendingMessageId.value = null
    successCount.value++
  }
}

// 修复4: 安全的发送消息函数
const sendMessage = async () => {
  console.log('🎯 尝试发送消息')
  
console.log('当前活跃房间:', activeRoom.value)
  
  // 确保 roomId 是字符串
  const roomId = String(activeRoomId.value)
  console.log('格式化后 roomId:', roomId, '类型:', typeof roomId)

  // 验证canSend
  if (!canSend.value) {
    console.log('❌ 无法发送，canSend为false')
    console.log('检查状态:', {
      messageInput: messageInput.value,
      typeofMessageInput: typeof messageInput.value,
      imagePreviews: imagePreviews.value.length,
      isAuthenticated: authStore.isAuthenticated
    })
    return
  }
  
  if (!authStore.isAuthenticated) {
    console.log('❌ 用户未登录')
    alert('请先登录')
    return
  }
  
  // 确保messageInput是字符串
  const message = typeof messageInput.value === 'string' 
    ? messageInput.value 
    : String(messageInput.value || '')
  
  const content = message.trim()
  const images = imagePreviews.value
  
  if (!content && images.length === 0) {
    console.log('❌ 消息和图片都为空')
    return
  }

  console.log(`发送消息: ${content.substring(0, 50)}...`)

  // 创建临时消息
  const tempMessage = {
    id: `temp_${Date.now()}`,
    content,
    images,
    author: {
      id: authStore.user!.id,
      username: authStore.user!.username,
      avatar: authStore.user!.avatar,
    },
    roomId: activeRoomId.value,  // 添加这行
    createdAt: new Date().toISOString(),
    status: 'sending' as const
  }
  
  sendingMessageId.value = tempMessage.id
  messages.value.push(tempMessage)
  totalSent.value++
  
  // 清空输入
  messageInput.value = ''
  imagePreviews.value = []
  
  // 滚动到底部
  scrollToBottom()
  
  // 停止输入状态
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
  typingUsers.value = []
  
  // 发送到服务器
  try {
    if (socketConnected) {
      // 通过Socket发送
      socketService.sendMessage(activeRoomId.value, tempMessage)
      console.log('✅ 消息已通过Socket发送')
    } else {
      console.log('⚠️ Socket未连接，仅通过API发送')
    }
    
    // 通过API保存到数据库
    await chatService.sendMessage(activeRoomId.value, {
      content,
      images
    })
    
    console.log('✅ 消息已通过API保存')
    
    // 测试延迟
    testLatency()
  } catch (error) {
    console.error('❌ 发送消息失败:', error)
    // 更新消息状态
    const index = messages.value.findIndex(m => m.id === tempMessage.id)
    if (index > -1) {
      messages.value[index].status = 'error'
    }
  }
}

// 处理输入状态
const handleTyping = () => {
  if (!authStore.user || !socketConnected) return
  
  // 通知其他用户我正在输入
  socketService.setTyping(activeRoomId.value, authStore.user.id, true)
  
  // 设置定时器清除输入状态
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  typingTimeout = setTimeout(() => {
    if (socketConnected) {
      socketService.setTyping(activeRoomId.value, authStore.user!.id, false)
    }
    typingUsers.value = typingUsers.value.filter(id => id !== authStore.user!.id)
  }, 2000)
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const files = Array.from(input.files)
  if (files.length + imagePreviews.value.length > 9) {
    alert('最多只能上传9张图片')
    return
  }
  
  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert(`文件 ${file.name} 不是图片`)
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert(`图片 ${file.name} 太大，请选择小于5MB的图片`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
  
  input.value = ''
}

// 移除图片预览
const removeImagePreview = (index: number) => {
  imagePreviews.value.splice(index, 1)
}

// 打开图片
const openImage = (image: string) => {
  selectedImage.value = image
}

// 切换房间
const switchRoom = async (roomId: string) => {
  if (roomId === activeRoomId.value) return
  
  console.log(`🔄 切换房间: ${activeRoomId.value} -> ${roomId}`)
  
  // 离开当前房间
  if (socketConnected) {
    socketService.leaveRoom(activeRoomId.value)
  }
  
  // 更新活跃房间
  activeRoomId.value = roomId
  messages.value = []
  typingUsers.value = []
  
  // 清除未读计数
  const room = chatRooms.value.find(r => r.id === roomId)
  if (room) {
    room.unreadCount = 0
  }
  
  // 加入新房间
  if (socketConnected) {
    socketService.joinRoom(roomId)
  }
  
  // 加载新房间的消息
  await loadMessages()
  
  // 滚动到底部
  scrollToBottom()
}

// ChatView.vue 中的 createChatRoom 函数
const createChatRoom = async () => {
  console.log('🎯 创建聊天室按钮被点击')
  console.log('🔍 当前值:', {
    newRoomName: newRoomName.value,
    newRoomDescription: newRoomDescription.value
  })
  
  if (!newRoomName.value || !newRoomName.value.trim()) {
    console.log('❌ 房间名称为空，不执行创建')
    alert('请输入房间名称')
    return
  }
  
  try {
    console.log('📤 开始创建聊天室...')
    const response = await chatService.createChatRoom({
      name: newRoomName.value.trim(),
      description: newRoomDescription.value.trim() || undefined
    })
    
    console.log('📥 服务器响应:', response)
    
    if (response && response.room) {  // ✅ 检查 room 是否存在
      console.log('✅ 聊天室创建成功:', response.room)
      
      // ✅ 重点：将新聊天室添加到列表前端
      const newRoom = {
        id: response.room.id,
        name: response.room.name,
        description: response.room.description || '',
        unreadCount: 0
      }
      
      // ✅ 使用 unshift 添加到列表开头
      chatRooms.value.unshift(newRoom)
      console.log('📋 聊天室列表已更新:', chatRooms.value)
      
      // 清空输入框
      newRoomName.value = ''
      newRoomDescription.value = ''
      
      // 显示成功提示
      alert('🎉 聊天室创建成功！')
      
      // ✅ 自动切换到新房间
      setTimeout(() => {
        switchRoom(response.room.id)
      }, 1000)
    } else if (response && response.success) {
      // 处理新版响应格式
      console.log('✅ 聊天室创建成功(新版格式):', response)
      
      const newRoom = {
        id: response.room.id,
        name: response.room.name,
        description: response.room.description || '',
        unreadCount: 0
      }
      
      chatRooms.value.unshift(newRoom)
      alert('🎉 聊天室创建成功！')
      
      setTimeout(() => {
        switchRoom(response.room.id)
      }, 1000)
    } else {
      console.log('❌ 服务器返回错误:', response)
      alert('创建失败: 服务器返回格式错误')
    }
  } catch (error: any) {
    console.error('❌ 创建聊天室异常:', error)
    console.error('错误详情:', {
      消息: error.message,
      状态码: error.response?.status,
      数据: error.response?.data
    })
    
    let errorMessage = '创建失败: '
    
    if (error.response?.data?.error) {
      errorMessage += error.response.data.error
    } else if (error.response?.data?.message) {
      errorMessage += error.response.data.message
    } else if (error.message) {
      errorMessage += error.message
    } else {
      errorMessage += '未知错误'
    }
    
    alert(errorMessage)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 处理滚动
const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  if (container.scrollTop === 0) {
    loadMoreMessages()
  }
}

// 加载更多消息
const loadMoreMessages = async () => {
  if (loadingMore.value || messages.value.length === 0) return
  
  loadingMore.value = true
  try {
    const page = Math.ceil(messages.value.length / 50) + 1
    const response = await chatService.getRoomMessages(activeRoomId.value, page, 50)
    
    if (response.success && response.data.messages?.length) {
      // 将新消息插入到开头
      messages.value = [...response.data.messages, ...messages.value]
    }
  } catch (error) {
    console.error('加载更多消息失败:', error)
  } finally {
    loadingMore.value = false
  }
}

// 测试延迟
const testLatency = () => {
  const startTime = Date.now()
  
  // 这里可以添加延迟测试逻辑
  // 例如发送一个ping消息，然后测量pong返回的时间
  
  setTimeout(() => {
    const endTime = Date.now()
    const currentLatency = endTime - startTime
    
    latencyTests.push(currentLatency)
    if (latencyTests.length > 10) {
      latencyTests.shift()
    }
    
    // 计算平均延迟
    const avg = latencyTests.reduce((a, b) => a + b, 0) / latencyTests.length
    latency.value = Math.round(avg)
  }, 100)
}


// ChatView.vue 中的 loadChatRoomsFromServer 函数
const loadChatRoomsFromServer = async () => {
  try {
    console.log('📥 从服务器加载聊天室列表...')
    
    // 调用API获取聊天室列表
    const response = await chatService.getChatRooms() as any
    
    console.log('📤 服务器返回的完整响应:', response)
    
    // ✅ 修复1: 正确处理后端返回的格式
    if (response && response.success && response.data) {
      // 第一种格式: { success: true, data: { rooms: [...], pagination: {...} } }
      if (response.data.rooms) {
        console.log(`✅ 格式1: 从服务器加载了 ${response.data.rooms.length} 个聊天室`)
        chatRooms.value = response.data.rooms.map((room: any) => ({
          id: room.id,
          name: room.name,
          description: room.description || '',
          unreadCount: room.unreadCount || 0
        }))
        return
      }
      
      // 第二种格式: { success: true, data: [...] }
      if (Array.isArray(response.data)) {
        console.log(`✅ 格式2: 从服务器加载了 ${response.data.length} 个聊天室`)
        chatRooms.value = response.data.map((room: any) => ({
          id: room.id,
          name: room.name,
          description: room.description || '',
          unreadCount: room.unreadCount || 0
        }))
        return
      }
    }
    
    // ✅ 修复2: 直接处理后端原始格式 { rooms: [...], pagination: {...} }
    if (response && response.rooms) {
      console.log(`✅ 格式3: 从服务器加载了 ${response.rooms.length} 个聊天室`)
      chatRooms.value = response.rooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description || '',
        unreadCount: room.unreadCount || 0
      }))
      return
    }
    
    // ✅ 修复3: 处理 data 中包含 rooms
    if (response && response.data && response.data.rooms) {
      console.log(`✅ 格式4: 从服务器加载了 ${response.data.rooms.length} 个聊天室`)
      chatRooms.value = response.data.rooms.map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description || '',
        unreadCount: room.unreadCount || 0
      }))
      return
    }
    
    console.log('⚠️ 无法识别服务器响应格式:', response)
    
    // 如果都失败了，检查响应结构
    console.log('🔍 服务器响应结构:', Object.keys(response))
    
  } catch (error) {
    console.error('❌ 加载聊天室列表失败:', error)
    // 保持现有列表，不重新赋值
  }
}

// 修复5: 安全的初始化
// 修改 onMounted
onMounted(async () => {
  console.log('🚀 ChatView组件已挂载')
  
  // 暴露服务到window，便于调试
  window.__chatService = chatService
  window.__socketService = socketService
  window.__authStore = authStore
  
  console.log('🔧 服务已暴露到window:', {
    chatService: !!chatService,
    socketService: !!socketService,
    authStore: !!authStore
  })
  
  // ✅ 1. 首先从服务器加载聊天室列表
  await loadChatRoomsFromServer()
  console.log('✅ 初始化聊天室列表:', chatRooms.value)
  
  // 2. 如果列表为空，添加默认聊天室
  if (chatRooms.value.length === 0) {
    console.log('📋 聊天室列表为空，添加默认聊天室')
    chatRooms.value = [
      { id: 'general', name: '综合讨论区', description: '综合游戏讨论', unreadCount: 0 },
      { id: 'lol', name: '英雄联盟', description: 'LOL玩家聚集地', unreadCount: 0 },
      { id: 'csgo', name: 'CS:GO', description: '反恐精英全球攻势', unreadCount: 0 },
      { id: 'valorant', name: '无畏契约', description: 'Valorant玩家社区', unreadCount: 0 },
    ]
  }
  
  // 验证messageInput类型
  if (typeof messageInput.value !== 'string') {
    console.log('⚠️ messageInput不是字符串，修复为字符串')
    messageInput.value = String(messageInput.value || '')
  }
  
  // 验证DOM元素
  setTimeout(() => {
    console.log('🔍 检查DOM元素:')
    if (messageInputRef.value) {
      console.log('✅ 找到messageInput DOM元素')
    } else {
      console.log('❌ 未找到messageInput DOM元素')
    }
    
    if (sendButtonRef.value) {
      console.log('✅ 找到发送按钮', {
        disabled: sendButtonRef.value.disabled,
        text: sendButtonRef.value.textContent
      })
    }
  }, 100)
  
  try {
    // 初始化Socket连接
    initSocket()
    
    // 加载默认房间的消息
    await loadMessages()
    
    // 初始延迟测试
    testLatency()
    setInterval(testLatency, 30000) // 每30秒测试一次
    
    // 初始在线人数
    onlineCount.value = Math.floor(Math.random() * 50) + 20
    
    console.log('✅ ChatView初始化完成')
  } catch (error) {
    console.error('❌ ChatView初始化失败:', error)
  }
})

// 清理
onUnmounted(() => {
  console.log('🧹 ChatView组件即将卸载')


  // 清理window上的引用
  delete window.__chatService
  delete window.__socketService
  delete window.__authStore
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  // 离开所有房间
  if (socketConnected) {
    socketService.leaveRoom(activeRoomId.value)
  }
  
  // 移除所有监听器
  try {
    socketService.removeListener('new-message')
    socketService.removeListener('user-joined')
    socketService.removeListener('user-typing')
  } catch (error) {
    console.log('移除监听器时出错:', error)
  }
})



// 添加window类型声明
declare global {
  interface Window {
    __chatService?: any
    __socketService?: any
    __authStore?: any
  }
}
</script>

<style scoped>
.message-group {
  display: flex;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>