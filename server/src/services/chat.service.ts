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

  // server/src/services/chat.service.ts
async createChatRoom(name: string, description?: string, createdBy?: string) {
  try {
    console.log('🎯 创建聊天室:', { name, description, createdBy })
    
    // 1. 检查是否已存在同名房间
    const existingRoom = await prisma.room.findFirst({
      where: { name }
    })
    
    if (existingRoom) {
      throw new Error(`聊天室 "${name}" 已存在`)
    }
    
    // 2. 创建到数据库
    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        createdBy: createdBy || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        // 这里不返回members，因为数据库中没有这个字段
        // 你可以添加一个虚拟字段或通过关联查询获取
      }
    })
    
    console.log('✅ 聊天室已保存到数据库:', room)
    
    // 3. 返回格式化数据
    return {
      id: room.id,
      name: room.name,
      description: room.description || '',
      createdAt: room.createdAt,
      members: createdBy ? [createdBy] : [],
    }
    
  } catch (error: any) {
    console.error('❌ 创建聊天室失败:', error)
    throw error
  }
}

  // server/src/services/chat.service.ts
async getChatRooms(userId?: string, page: number = 1, limit: number = 20) {
  try {
    console.log('📥 获取聊天室列表:', { userId, page, limit })
    
    const skip = (page - 1) * limit
    
    // 从数据库查询
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          _count: {
            select: {
              messages: true  // 可以返回消息计数
            }
          }
        }
      }),
      prisma.room.count()
    ])
    
    // 格式化返回数据
    const formattedRooms = rooms.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description || '',
      createdAt: room.createdAt,
      members: [],  // 暂时返回空数组，如果需要可以从其他表查询
      messageCount: room._count.messages
    }))
    
    console.log(`✅ 从数据库获取到 ${formattedRooms.length} 个聊天室`)
    
    return {
      rooms: formattedRooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
    
  } catch (error: any) {
    console.error('❌ 获取聊天室列表失败:', error)
    // 返回空数据而不是抛出错误
    return {
      rooms: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    }
  }
}

  // server/src/services/chat.service.ts
async getChatRoom(roomId: string) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        createdBy: true,
        messages: {
          take: 1,  // 只取最近消息
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true
          }
        }
      }
    })
    
    if (!room) {
      console.log(`❌ 聊天室不存在: ${roomId}`)
      return null
    }
    
    return {
      id: room.id,
      name: room.name,
      description: room.description || '',
      createdAt: room.createdAt,
      members: room.createdBy ? [room.createdBy] : [],
      lastMessage: room.messages[0] || null
    }
    
  } catch (error: any) {
    console.error(`❌ 获取聊天室详情失败: ${roomId}`, error)
    return null
  }
}

  // 获取未读消息数
  async getUnreadCount(roomId: string, userId: string, lastReadAt?: Date) {
    // 这里简化处理，实际应该根据最后阅读时间计算
    return 0
  }
}

export default new ChatService()