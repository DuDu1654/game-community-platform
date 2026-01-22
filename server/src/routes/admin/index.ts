// server/src/routes/admin/index.ts
import { Router } from 'express'
import newsRouter from './news'

const router = Router()

// 管理后台路由
router.use('/news', newsRouter)

export default router