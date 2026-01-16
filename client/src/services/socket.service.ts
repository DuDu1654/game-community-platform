// client/src/services/socket.service.ts
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'

class SocketService {
  private socket: Socket | null = null
  private authStore = useAuthStore()

  // 连接Socket
  connect() {
    if (this.socket?.connected) return

    const token = this.authStore.token
    if (!token) {
      console.warn('未登录，无法建立Socket连接')
      return
    }

    this.socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    this.setupListeners()
  }

  // 设置监听器
  private setupListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket连接成功:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket断开连接:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket连接错误:', error)
    })
  }

  // 加入聊天室
  joinRoom(roomId: string) {
    if (!this.socket?.connected) {
      console.warn('Socket未连接')
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
  sendMessage(roomId: string, message: any) {
    if (!this.socket?.connected) return
    this.socket.emit('send-message', { roomId, message })
  }

  // 用户输入状态
  setTyping(roomId: string, userId: string, isTyping: boolean) {
    if (!this.socket?.connected) return
    this.socket.emit('typing', { roomId, userId, isTyping })
  }

  // 监听新消息
  onNewMessage(callback: (message: any) => void) {
    if (!this.socket) return
    this.socket.on('new-message', callback)
  }

  // 监听用户加入
  onUserJoined(callback: (data: any) => void) {
    if (!this.socket) return
    this.socket.on('user-joined', callback)
  }

  // 监听用户输入状态
  onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    if (!this.socket) return
    this.socket.on('user-typing', callback)
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
    }
  }

  // 检查是否连接
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export default new SocketService()