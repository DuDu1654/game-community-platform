// server/src/routes/index.ts
import { Router } from 'express'
import authRouter from './auth'
import userRouters from './user'  // 新增这行
import postRoutes from './posts'
import commentRoutes from './comments'
import likeRoutes from './likes'
import newsCommentRouter from './newsComment'

const router = Router()

// 路由注册
router.use('/auth', authRouter)
router.use('/users', userRouters)  // 新增这行
router.use('/posts', postRoutes)
router.use('/comments', commentRoutes)
router.use('/likes', likeRoutes)

router.use('/news', newsCommentRouter)  // 新闻评论路由，注意这里的前缀

export default router