# server/scripts/createDefaultRoom.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createDefaultRooms() {
  try {
    // 检查是否已存在 general 房间
    const generalRoom = await prisma.room.findUnique({
      where: { name: 'general' }
    })
    
    if (!generalRoom) {
      console.log('创建 general 聊天室...')
      await prisma.room.create({
        data: {
          id: 'general',
          name: 'general',
          description: '公共聊天室',
          isPublic: true
        }
      })
      console.log('✅ general 聊天室创建成功')
    } else {
      console.log('✅ general 聊天室已存在')
    }
    
    // 检查是否已存在 game 房间
    const gameRoom = await prisma.room.findUnique({
      where: { name: 'game' }
    })
    
    if (!gameRoom) {
      console.log('创建 game 聊天室...')
      await prisma.room.create({
        data: {
          id: 'game',
          name: 'game',
          description: '游戏讨论区',
          isPublic: true
        }
      })
      console.log('✅ game 聊天室创建成功')
    } else {
      console.log('✅ game 聊天室已存在')
    }
    
  } catch (error) {
    console.error('❌ 创建聊天室失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultRooms()