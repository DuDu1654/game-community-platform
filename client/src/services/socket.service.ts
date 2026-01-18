// client/src/services/socket.service.ts
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'

interface SocketMessage {
  id: string
  content: string
  images?: string[]
  author: {
    id: string
    username: string
    avatar?: string
  }
  roomId: string
  createdAt: string
  status?: 'sending' | 'sent' | 'error'
}

class SocketService {
  private socket: Socket | null = null
  private authStore = useAuthStore()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private messageQueue: any[] = [] // 消息队列，用于断线重连

// ✅ 新增：获取socket实例的公共方法
  getSocket(): Socket | null {
    return this.socket
  }

 
  // ✅ 新增：检查socket实例是否存在
  hasSocket(): boolean {
    return !!this.socket
  }


  // 连接Socket
  // client/src/services/socket.service.ts
// 在 connect 方法中简化连接逻辑
connect(roomId: string = 'general'): Promise<Socket> {
  return new Promise((resolve, reject) => {
    if (this.socket?.connected) {
      console.log('Socket已连接')
      this.joinRoom(roomId)
      resolve(this.socket)
      return
    }

    const token = this.authStore.token
    if (!token) {
      console.warn('未登录，无法建立Socket连接')
      reject(new Error('用户未登录'))
      return
    }

    try {
      // ⚠️ 问题所在：你可能在使用 VITE_API_BASE_URL 时加了 /api
      // Socket.IO 需要直接连接到服务器根路径，而不是 /api
      
      // 添加调试信息
      const envUrl = import.meta.env.VITE_API_BASE_URL
      console.log('🔌 环境变量 VITE_API_BASE_URL:', envUrl)
      
      // ✅ 修复：确保 URL 是服务器根路径
      let serverUrl = envUrl || 'http://localhost:3000'
      
      // 移除可能的 /api 后缀
      if (serverUrl.endsWith('/api')) {
        serverUrl = serverUrl.replace('/api', '')
        console.log('🔄 移除 /api 后缀，新URL:', serverUrl)
      }
      
      console.log('🎯 最终Socket连接URL:', serverUrl)
      
      // ✅ 修复：使用简单的连接配置
      this.socket = io(serverUrl, {
        auth: { 
          token,
          username: this.authStore.user?.username || 'anonymous'  // 添加用户名
        },
        // 重要：明确指定路径
        path: '/socket.io/',  // 这是默认路径，但明确指定更安全
        transports: ['websocket', 'polling'],
        query: { 
          roomId,
          userId: this.authStore.user?.id || 'unknown'
        },
        // 调试选项
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 20000
      })

      // 添加调试监听器
      console.log('🔧 设置Socket监听器...')
      
      this.socket.on('connect', () => {
        console.log('✅ Socket连接成功:', {
          连接ID: this.socket?.id,
          认证用户: this.authStore.user?.username,
          房间ID: roomId
        })
        this.joinRoom(roomId)
        resolve(this.socket!)
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket连接错误详情:', {
          错误类型: error.name,
          消息: error.message,
         
        })
        reject(error)
      })
      
      this.socket.on('connect_timeout', () => {
        console.error('⏰ Socket连接超时')
        reject(new Error('连接超时'))
      })
      
      this.socket.on('error', (error) => {
        console.error('💥 Socket发生错误:', error)
      })

    } catch (error) {
      console.error('💣 创建Socket连接时发生异常:', error)
      reject(error)
    }
  })
}

  // 设置监听器
  private setupListeners(resolve: () => void, reject: (error: any) => void) {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Socket连接成功:', this.socket?.id)
      this.reconnectAttempts = 0
      
      // 发送队列中的消息
      this.flushMessageQueue()
      
      resolve()
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket连接错误:', error)
      
      this.reconnectAttempts++
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Socket连接失败，已达到最大重试次数')
        reject(error)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket断开连接:', reason)
      if (reason === 'io server disconnect') {
        // 服务器主动断开，需要重新连接
        this.socket?.connect()
      }
    })

    this.socket.on('room-joined', (data) => {
      console.log('✅ 已加入房间:', data.roomId)
    })

    this.socket.on('error', (error) => {
      console.error('Socket错误:', error)
    })
  }

  // 加入聊天室
  joinRoom(roomId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket未连接，消息将加入队列')
      this.messageQueue.push({ type: 'join-room', data: { roomId } })
      return
    }
    this.socket.emit('join-room', roomId)
  }

  // 离开聊天室
  leaveRoom(roomId: string) {
    if (!this.socket?.connected) return
    this.socket.emit('leave-room', roomId)
  }

  // 发送消息
  sendMessage(roomId: string, message: SocketMessage) {
    if (!this.socket?.connected) {
      console.warn('Socket未连接，消息将加入队列')
      this.messageQueue.push({ 
        type: 'send-message', 
        data: { roomId, message } 
      })
      return
    }
    this.socket.emit('send-message', { roomId, message })
  }

  // 用户输入状态
  setTyping(roomId: string, userId: string, isTyping: boolean) {
    if (!this.socket?.connected) {
      console.warn('Socket未连接，无法发送输入状态')
      return
    }
    this.socket.emit('typing', { roomId, userId, isTyping })
  }

  // 监听新消息
  onNewMessage(callback: (message: SocketMessage) => void) {
    if (!this.socket) return
    this.socket.on('new-message', callback)
  }

  // 监听消息发送错误
  onMessageError(callback: (data: { tempId: string; error: string }) => void) {
    if (!this.socket) return
    this.socket.on('message-error', callback)
  }

  // 监听用户加入
  onUserJoined(callback: (data: any) => void) {
    if (!this.socket) return
    this.socket.on('user-joined', callback)
  }

  // 监听用户离开
  onUserLeft(callback: (data: any) => void) {
    if (!this.socket) return
    this.socket.on('user-left', callback)
  }

  // 监听用户输入状态
  onUserTyping(callback: (data: { userId: string; username: string; isTyping: boolean }) => void) {
    if (!this.socket) return
    this.socket.on('user-typing', callback)
  }

  // 监听房间加入成功
  onRoomJoined(callback: (data: { roomId: string }) => void) {
    if (!this.socket) return
    this.socket.on('room-joined', callback)
  }

  // 监听在线人数更新
  onOnlineCount(callback: (data: { count: number }) => void) {
    if (!this.socket) return
    this.socket.on('online-count', callback)
  }

  // 监听用户列表更新
  onOnlineUsers(callback: (users: Array<{ userId: string; online: boolean }>) => void) {
    if (!this.socket) return
    this.socket.on('online-users', callback)
  }

  // 发送队列中的消息
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message && this.socket?.connected) {
        switch (message.type) {
          case 'join-room':
            this.socket.emit('join-room', message.data.roomId)
            break
          case 'send-message':
            this.socket.emit('send-message', message.data)
            break
        }
      }
    }
  }

  // 移除监听器
  removeListener(event: string, callback?: any) {
    if (!this.socket) return
    if (callback) {
      this.socket.off(event, callback)
    } else {
      this.socket.off(event)
    }
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.messageQueue = []
      console.log('Socket已断开连接')
    }
  }

  // 检查是否连接
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export default new SocketService()