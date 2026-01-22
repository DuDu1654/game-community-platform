// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 导出 AuthRequest 类型
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

// 从请求头中提取令牌
export const extractTokenFromHeader = (req: Request): string | undefined => {
  const authorization = req.headers.authorization;
  if (!authorization) return undefined;
  
  const [type, token] = authorization.split(' ');
  return type === 'Bearer' ? token : undefined;
};

// 验证令牌
export const verifyToken = (token: string): { userId: string; username: string; role: string } => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    return jwt.verify(token, secret) as { userId: string; username: string; role: string };
  } catch (error) {
    throw new Error('无效的令牌');
  }
};

// 认证中间件
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req);
    
    if (!token) {
      res.status(401).json({ error: '未提供认证令牌' });
      return;
    }

    const payload = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: '用户不存在或已被禁用' });
      return;
    }

    // 设置 user 对象
    (req as AuthRequest).user = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error('认证错误:', error);
    res.status(401).json({ error: '无效的认证令牌' });
  }
};

// server/src/middleware/auth.ts
// 修改 authorize 函数
export const authorize = (allowedRoles: string | string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      
      if (!authReq.user) {
        res.status(401).json({ error: '未认证' });
        return;
      }

      // 将单个字符串转换为数组
      const rolesArray = Array.isArray(allowedRoles) 
        ? allowedRoles 
        : [allowedRoles];
      
      // 如果没有指定角色，允许所有认证用户
      if (rolesArray.length === 0) {
        return next();
      }

      if (!rolesArray.includes(authReq.user.role)) {
        res.status(403).json({ error: '权限不足' });
        return;
      }

      next();
    } catch (error) {
      console.error('授权错误:', error);
      res.status(500).json({ error: '授权检查失败' });
    }
  };
};

// 可选：添加一些预设的授权检查
export const authorizeAdmin = authorize(['ADMIN']);
export const authorizeModerator = authorize(['ADMIN', 'MODERATOR']);
export const authorizeUser = authorize(['ADMIN', 'MODERATOR', 'USER']);