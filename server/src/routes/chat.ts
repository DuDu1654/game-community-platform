// server/src/routes/chat.ts
import { Router } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import chatService from '../services/chat.service'

const router = Router()

// 获取聊天室列表
router.get('/rooms', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const result = await chatService.getChatRooms(userId, page, limit)
    
    res.json(result)
  } catch (error: any) {
    console.error('获取聊天室列表错误:', error)
    res.status(500).json({ error: '获取聊天室列表失败' })
  }
})

// 获取聊天室详情
router.get('/rooms/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const room = await chatService.getChatRoom(id)
    
    if (!room) {
      return res.status(404).json({ error: '聊天室不存在' })
    }
    
    res.json({ room })
  } catch (error: any) {
    console.error('获取聊天室详情错误:', error)
    res.status(500).json({ error: '获取聊天室详情失败' })
  }
})

// 修改获取消息的路由
router.get('/rooms/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 50

    console.log(`📥 API: 获取房间 ${id} 的消息, page=${page}, limit=${limit}`)
    
    // 直接返回数组
    const messages = await chatService.getRoomMessages(id, page, limit)
    
    console.log(`✅ API: 返回 ${messages.length} 条消息`)
    
    res.json(messages) // 直接返回数组
    
  } catch (error: any) {
    console.error('获取消息错误:', error)
    res.status(500).json({ error: '获取消息失败' })
  }
})

// 发送消息
router.post('/rooms/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { content, images } = req.body
    const userId = req.user!.userId

    if (!content?.trim() && !images?.length) {
      return res.status(400).json({ error: '消息内容不能为空' })
    }

    const message = await chatService.sendMessage({
      content: content || '',
      roomId: id,
      authorId: userId,
      images,
    })

    res.status(201).json({
      message: '消息发送成功',
      data: message,
    })
  } catch (error: any) {
    console.error('发送消息错误:', error)
    res.status(500).json({ error: '发送消息失败' })
  }
})

// 创建聊天室
router.post('/rooms', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body
    const userId = req.user!.userId

    if (!name) {
      return res.status(400).json({ error: '聊天室名称不能为空' })
    }

    const room = await chatService.createChatRoom(name, description, userId)
    
    res.status(201).json({
      message: '聊天室创建成功',
      room,
    })
  } catch (error: any) {
    console.error('创建聊天室错误:', error)
    res.status(500).json({ error: '创建聊天室失败' })
  }
})

// 获取未读消息数
router.get('/unread/count', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    const roomId = req.query.roomId as string
    const lastReadAt = req.query.lastReadAt 
      ? new Date(req.query.lastReadAt as string) 
      : undefined

    if (!roomId) {
      return res.status(400).json({ error: '需要指定聊天室' })
    }

    const count = await chatService.getUnreadCount(roomId, userId, lastReadAt)
    
    res.json({ count })
  } catch (error: any) {
    console.error('获取未读消息数错误:', error)
    res.status(500).json({ error: '获取未读消息数失败' })
  }
})

export default router