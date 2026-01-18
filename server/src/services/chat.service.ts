// server/src/services/chat.service.ts
import { PrismaClient, Message } from '@prisma/client'

const prisma = new PrismaClient()

export interface SendMessageInput {
  content: string
  roomId: string
  authorId: string
  images?: string | null  // 修改为 string | null
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  createdAt: Date
  members: string[] // 用户ID数组
}

class ChatService {
  // 发送消息
  async sendMessage(data: SendMessageInput): Promise<Message> {
    return await prisma.message.create({
      data: {
        content: data.content,
        roomId: data.roomId,
        authorId: data.authorId,
        images: data.images ? JSON.stringify(data.images) : null,  // 将数组转为JSON字符串
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
    })
  }

  // 获取聊天室消息
  // 修改 getRoomMessages 方法
async getRoomMessages(roomId: string, page: number = 1, limit: number = 50) {
  try {
    console.log(`📥 获取房间消息: roomId=${roomId}, page=${page}, limit=${limit}`)
    
    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: 'asc' }, // 改为正序
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.message.count({ where: { roomId } }),
    ])

    console.log(`✅ 从数据库获取到 ${messages.length} 条消息`)

    // 处理图片字段（JSON字符串转数组）
    const processedMessages = messages.map(message => ({
      ...message,
      images: message.images ? JSON.parse(message.images) : [],
      // createdAt 保持为 Date 对象，前端会自动转换
    }))

    console.log(`✅ 返回 ${processedMessages.length} 条处理后的消息`)

    // ✅ 重要：直接返回数组，不要包装在 data 中
    return processedMessages
    
  } catch (error: any) {
    console.error('❌ 获取房间消息失败:', error)
    return [] // 出错返回空数组
  }
}

  // 创建聊天室
  async createChatRoom(name: string, description?: string, createdBy?: string) {
    // 简单的聊天室实现
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 这里简化处理，实际应该存储到数据库
    return {
      id: roomId,
      name,
      description,
      createdAt: new Date(),
      members: createdBy ? [createdBy] : [],
    }
  }

  // 获取聊天室列表
  async getChatRooms(userId?: string, page: number = 1, limit: number = 20) {
    // 这里简化处理，实际应该从数据库查询
    const rooms: ChatRoom[] = [
      {
        id: 'general',
        name: '综合讨论区',
        description: '综合游戏讨论',
        createdAt: new Date(),
        members: [],
      },
      {
        id: 'lol',
        name: '英雄联盟',
        description: 'LOL玩家聚集地',
        createdAt: new Date(),
        members: [],
      },
      {
        id: 'csgo',
        name: 'CS:GO',
        description: '反恐精英全球攻势',
        createdAt: new Date(),
        members: [],
      },
      {
        id: 'valorant',
        name: '无畏契约',
        description: 'Valorant玩家社区',
        createdAt: new Date(),
        members: [],
      },
    ]

    const start = (page - 1) * limit
    const end = start + limit
    const paginatedRooms = rooms.slice(start, end)

    return {
      rooms: paginatedRooms,
      pagination: {
        page,
        limit,
        total: rooms.length,
        pages: Math.ceil(rooms.length / limit),
      },
    }
  }

  // 获取聊天室详情
  async getChatRoom(roomId: string) {
    const rooms = await this.getChatRooms()
    return rooms.rooms.find(room => room.id === roomId) || null
  }

  // 获取未读消息数
  async getUnreadCount(roomId: string, userId: string, lastReadAt?: Date) {
    // 这里简化处理，实际应该根据最后阅读时间计算
    return 0
  }
}

export default new ChatService()