// server/src/services/socket.service.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SocketService {
  private io: Server | null = null;
  private onlineUsers = new Map<string, { userId: string; socketId: string }>();

  // 初始化Socket.IO
  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('✅ Socket.io 服务已启动');
  }

  // 中间件：验证token
  private setupMiddleware() {
    if (!this.io) return;

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('未提供认证令牌'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        (socket as any).userId = decoded.userId;
        (socket as any).username = decoded.username;
        
        next();
      } catch (error) {
        console.error('Socket认证失败:', error);
        next(new Error('认证失败'));
      }
    });
  }

  // 设置事件处理器
  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', async (socket: Socket) => {
      const userId = (socket as any).userId;
      const username = (socket as any).username;
      
      console.log(`用户已连接: ${username} (${socket.id})`);

      // 保存在线用户
      this.onlineUsers.set(socket.id, { userId, socketId: socket.id });

      // 加入聊天室
      socket.on('join-room', async (roomId: string) => {
        try {
          await socket.join(roomId);
          console.log(`用户 ${username} 加入了房间 ${roomId}`);

          // ✅ 获取房间历史消息
          const messages = await prisma.message.findMany({
            where: { roomId },
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
          });

          // 发送历史消息给新加入的用户
          socket.emit('room-history', {
            roomId,
            messages: messages.reverse(), // 按时间顺序
          });

          // 通知房间内的其他用户
          socket.to(roomId).emit('user-joined', {
            userId,
            username,
            timestamp: new Date().toISOString(),
          });

          // 更新在线人数
          this.updateOnlineStatus(roomId);
        } catch (error) {
          console.error('加入房间失败:', error);
        }
      });

     // 发送消息
socket.on('send-message', async (data: { roomId: string; message: any }) => {
  try {
    const { roomId, message } = data;
    const { content, images } = message;

    console.log('收到消息:', { roomId, userId, content });

    // ✅ 保存消息到数据库
    const savedMessage = await prisma.message.create({
      data: {
        content: content || '',
        roomId,
        authorId: userId,
        images: images || [],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    console.log('消息已保存到数据库:', savedMessage.id);

    // 广播消息到房间
    this.io!.to(roomId).emit('new-message', {
      ...savedMessage,
      createdAt: savedMessage.createdAt.toISOString(),
    });
    
    console.log(`消息发送到房间 ${roomId}:`, content?.substring(0, 50));
  } catch (error) {
    console.error('发送消息失败:', error);
    
    // ✅ 修复：通过 data 变量访问 message
    socket.emit('message-error', {
      tempId: data.message.id,  // ✅ 从 data 中获取 message
      error: '消息发送失败',
    });
  }
});

      // 用户输入状态
      socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
        const { roomId, userId, isTyping } = data;
        socket.to(roomId).emit('user-typing', { userId, isTyping });
      });

      // 离开聊天室
      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`用户 ${username} 离开了房间 ${roomId}`);
        this.updateOnlineStatus(roomId);
      });

      // 断开连接
      socket.on('disconnect', () => {
        console.log(`用户 ${username} 已断开连接: ${socket.id}`);
        this.onlineUsers.delete(socket.id);
      });
    });
  }

  // 更新在线状态
  private updateOnlineStatus(roomId: string) {
    if (!this.io) return;
    
    const roomSockets = Array.from(this.io.sockets.adapter.rooms.get(roomId) || []);
    this.io.to(roomId).emit('online-count', { 
      count: roomSockets.length,
      users: roomSockets.map(socketId => {
        const user = this.onlineUsers.get(socketId);
        return {
          userId: user?.userId,
          online: true
        };
      }).filter(Boolean)
    });
  }

  // 获取IO实例
  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO 未初始化');
    }
    return this.io;
  }

  // 获取在线用户
  getOnlineUsers() {
    return Array.from(this.onlineUsers.values());
  }

  // 获取在线人数
  getOnlineCount() {
    return this.onlineUsers.size;
  }
}

export default new SocketService();