// server/src/config/database.ts
import { PrismaClient } from '@prisma/client'

// 创建Prisma客户端实例
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
})

// 连接数据库
export const connectDatabase = async () => {
  try {
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    throw error
  }
}

// 断开数据库连接
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect()
    console.log('✅ 数据库连接已断开')
  } catch (error) {
    console.error('❌ 断开数据库连接失败:', error)
    throw error
  }
}

export default prisma