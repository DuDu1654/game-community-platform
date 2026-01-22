// server/src/routes/newsComment.ts
import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';  // 移除 authorize
import newsCommentService from '../services/newsComment.service';

const router = Router();

// 统一响应函数
const apiResponse = (success: boolean, data?: any, error?: string, message?: string, extra?: any) => {
  return {
    success,
    data,
    error,
    message,
    ...extra
  };
};

// 获取新闻评论列表
router.get('/:newsId/comments', async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const { page = 1, limit = 20, sortBy = 'latest' } = req.query;

    const result = await newsCommentService.getCommentsByNewsId(newsId, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as 'latest' | 'popular'
    });

    res.json(apiResponse(
      true,
      result.comments,
      undefined,
      '获取评论成功',
      {
        total: result.total,
        hasMore: result.hasMore,
        page: Number(page),
        limit: Number(limit)
      }
    ));
  } catch (error: any) {
    console.error('获取新闻评论错误:', error);
    res.status(500).json(apiResponse(false, undefined, error.message || '获取评论失败'));
  }
});

// 创建评论
router.post('/:newsId/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;
    const { content, parentId } = req.body;
    
    // 类型转换
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json(apiResponse(false, undefined, '用户未认证'));
    }
    
    const userId = authReq.user.userId;  // 只使用 userId

    if (!content || content.trim() === '') {
      return res.status(400).json(apiResponse(false, undefined, '评论内容不能为空'));
    }

    if (content.length > 1000) {
      return res.status(400).json(apiResponse(false, undefined, '评论内容不能超过1000字'));
    }

    const comment = await newsCommentService.createComment(newsId, userId, {
      content: content.trim(),
      parentId
    });

    res.status(201).json(apiResponse(true, comment, undefined, '评论发布成功'));
  } catch (error: any) {
    console.error('创建评论错误:', error);
    res.status(500).json(apiResponse(false, undefined, error.message || '评论发布失败'));
  }
});

// 更新评论
router.put('/comments/:commentId', authenticate, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json(apiResponse(false, undefined, '用户未认证'));
    }
    
    const userId = authReq.user.userId;  // 只使用 userId

    if (!content || content.trim() === '') {
      return res.status(400).json(apiResponse(false, undefined, '评论内容不能为空'));
    }

    const comment = await newsCommentService.updateComment(commentId, userId, {
      content: content.trim()
    });

    res.json(apiResponse(true, comment, undefined, '评论更新成功'));
  } catch (error: any) {
    console.error('更新评论错误:', error);
    res.status(403).json(apiResponse(false, undefined, error.message || '更新评论失败'));
  }
});

// 删除评论
router.delete('/comments/:commentId', authenticate, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json(apiResponse(false, undefined, '用户未认证'));
    }
    
    const userId = authReq.user.userId;  // 只使用 userId
    const isAdmin = authReq.user.role === 'ADMIN';

    await newsCommentService.deleteComment(commentId, userId, isAdmin);

    res.json(apiResponse(true, undefined, undefined, '评论删除成功'));
  } catch (error: any) {
    console.error('删除评论错误:', error);
    res.status(403).json(apiResponse(false, undefined, error.message || '删除评论失败'));
  }
});

// 点赞评论
router.post('/comments/:commentId/like', authenticate, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json(apiResponse(false, undefined, '用户未认证'));
    }
    
    const userId = authReq.user.userId;  // 只使用 userId

    const result = await newsCommentService.likeComment(commentId, userId);

    res.json(apiResponse(true, result, undefined, result.liked ? '点赞成功' : '取消点赞'));
  } catch (error: any) {
    console.error('点赞评论错误:', error);
    res.status(500).json(apiResponse(false, undefined, error.message || '操作失败'));
  }
});

// 检查点赞状态
router.get('/comments/:commentId/like', authenticate, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    
    const authReq = req as AuthRequest;
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json(apiResponse(false, undefined, '用户未认证'));
    }
    
    const userId = authReq.user.userId;  // 只使用 userId

    const result = await newsCommentService.checkUserLike(commentId, userId);

    res.json(apiResponse(true, result));
  } catch (error: any) {
    console.error('检查点赞状态错误:', error);
    res.status(500).json(apiResponse(false, undefined, error.message || '检查失败'));
  }
});

export default router;