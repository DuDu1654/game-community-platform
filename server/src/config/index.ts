// server/src/config/index.ts
export { config } from './env'
export { constants } from './constants'
export { default as prisma, connectDatabase, disconnectDatabase } from './database'