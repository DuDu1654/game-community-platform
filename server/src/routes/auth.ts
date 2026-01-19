// server/src/routes/auth.ts
// server/src/routes/auth.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 确保正确导入 AuthRequest
import { AuthRequest } from '../middleware/auth'  // 这行很重要！

// 添加类型扩展
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        role: string;
      };
    }
  }
}

const router = Router();
const prisma = new PrismaClient();

// 工具函数
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (payload: { userId: string; username: string; role: string }): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

// 简单的认证中间件（修正版）
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    req.user = { userId: decoded.userId, username: decoded.username, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: '认证令牌无效' });
  }
};

// 用户注册
router.post('/register', async (req, res) => {
  try {
    console.log('注册请求体:', req.body);
    console.log('注册请求头:', req.headers);
    
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        role: 'USER',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    // 生成token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      user,
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      success: false,
      error: '注册失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    console.log('登录请求体:', req.body);
    console.log('登录请求头:', req.headers);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: '请填写用户名和密码' 
      });
    }

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: '用户名或密码错误' 
      });
    }

    // 验证密码
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: '用户名或密码错误' 
      });
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        error: '账号已被禁用' 
      });
    }

    // 生成token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false,
      error: '登录失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取当前用户信息
// server/src/routes/auth.ts
// 修改 GET /me 端点
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId
    
    console.log('🔍 获取用户信息，用户ID:', userId)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isActive: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: '用户不存在' 
      })
    }
    
    console.log('✅ 找到用户:', user)
    
    // 确保返回正确的结构
    res.json({
      success: true,
      data: user,  // 确保 user 对象在 data 字段中
      message: '获取用户信息成功'
    })
    
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ 
      success: false,
      error: '获取用户信息失败' 
    })
  }
});

// 简单的测试接口
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '认证路由工作正常',
    endpoints: ['POST /register', 'POST /login', 'GET /me'],
  });
});

export default router;