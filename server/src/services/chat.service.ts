// server/src/services/chat.service.ts
import { PrismaClient, Message } from '@prisma/client'

const prisma = new PrismaClient()

export interface SendMessageInput {
  content: string
  roomId: string
  authorId: string
  images?: string  // 改为 string，不是 string[]
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
        images: data.images || null,  // 改为 null，不是 []
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
  async getRoomMessages(roomId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
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

    // 按时间正序返回
    const sortedMessages = messages.reverse()

    return {
      messages: sortedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
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