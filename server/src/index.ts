// server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

// 导入配置
import { config } from './config/env';
import { connectDatabase } from './config/database';

// 导入路由
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import newsRoutes from './routes/news';
import commentRoutes from './routes/comments';
import chatRoutes from './routes/chat';
import statsRoutes from './routes/stats';
// 确保你的代码中有这部分
import socketService from './services/socket.service'


// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 创建HTTP服务器和Socket.IO实例
const server = http.createServer(app);
// const io = new SocketIOServer(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   },
// });


socketService.initialize(server)  // 确保这行存在




// 中间件
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 记录请求日志的中间件
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// 1. 欢迎页面（HTML格式）- 保留你的原本页面
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🎮 游戏社区平台后端</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          max-width: 900px; 
          margin: 40px auto; 
          padding: 20px; 
          background-color: #f8f9fa;
          color: #333;
        }
        header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px; 
          border-radius: 15px; 
          margin-bottom: 30px; 
          color: white;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { 
          font-size: 2.5em; 
          margin: 0; 
        }
        .subtitle { 
          font-size: 1.2em; 
          opacity: 0.9; 
          margin-top: 10px;
        }
        .card { 
          background: white; 
          padding: 25px; 
          border-radius: 10px; 
          margin: 20px 0; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border-left: 5px solid #667eea;
        }
        .endpoint { 
          background: #f8f9fa; 
          padding: 15px; 
          margin: 10px 0; 
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          font-family: 'Courier New', monospace;
        }
        .method { 
          display: inline-block; 
          background: #3b82f6; 
          color: white; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-weight: bold;
          font-size: 0.9em;
          margin-right: 10px;
        }
        .method.get { background: #10b981; }
        .method.post { background: #f59e0b; }
        code { 
          background: #eee; 
          padding: 2px 6px; 
          border-radius: 4px; 
          font-family: 'Courier New', monospace;
        }
        a { 
          color: #667eea; 
          text-decoration: none; 
          font-weight: bold;
        }
        a:hover { text-decoration: underline; }
        .status { 
          display: inline-block; 
          background: #10b981; 
          color: white; 
          padding: 5px 10px; 
          border-radius: 20px; 
          font-size: 0.9em;
        }
        .container { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-top: 20px;
        }
        .socket-badge {
          display: inline-block;
          background: #8b5cf6;
          color: white;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          margin-left: 8px;
        }
        @media (max-width: 768px) {
          .container { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <header>
        <h1>🎮 游戏社区平台后端服务</h1>
        <div class="subtitle">基于 Node.js + Express + TypeScript + Socket.IO</div>
        <div style="margin-top: 20px;">
          <span class="status">✅ 运行正常</span>
          <span class="socket-badge">⚡ 实时通信已启用</span>
          <span style="margin-left: 15px; font-size: 0.9em;">版本: 2.0.0</span>
        </div>
      </header>
      
      <div class="container">
        <div>
          <div class="card">
            <h3>📊 服务器信息</h3>
            <p><strong>时间:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>端口:</strong> ${PORT}</p>
            <p><strong>环境:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>API地址:</strong> http://localhost:${PORT}</p>
            <p><strong>Socket.IO:</strong> ws://localhost:${PORT}</p>
          </div>
          
          <div class="card">
            <h3>🔗 快速链接</h3>
            <p><a href="/api" target="_blank">API 信息接口</a></p>
            <p><a href="/health" target="_blank">健康检查</a></p>
            <p><a href="/api/test-db" target="_blank">数据库连接测试</a></p>
            <p><a href="/api/benchmark" target="_blank">性能测试</a></p>
            <p><a href="http://localhost:5173" target="_blank">前端界面</a> (如果已启动)</p>
          </div>
        </div>
        
        <div>
          <div class="card">
            <h3>📡 API 接口列表</h3>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/</code>
              <p>欢迎页面 (本页面)</p>
            </div>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/api</code>
              <p>API信息接口 (JSON格式)</p>
            </div>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/health</code>
              <p>健康检查接口</p>
            </div>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/api/test-db</code>
              <p>测试数据库连接</p>
            </div>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/api/benchmark</code>
              <p>性能测试接口</p>
            </div>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/api/posts</code>
              <p>获取帖子列表</p>
            </div>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/api/news</code>
              <p>获取新闻列表</p>
            </div>
            
            <div class="endpoint">
              <span class="method get">GET</span> <code>/api/chat</code>
              <span class="socket-badge">实时</span>
              <p>聊天相关接口</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card" style="margin-top: 20px; text-align: center; background: #f0f7ff;">
        <p>技术栈: Node.js + Express + TypeScript + Socket.IO + Prisma + PostgreSQL + Redis</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
          © 2024 游戏社区平台 | 基于边缘计算的智能游戏社区
        </p>
      </div>
    </body>
    </html>
  `);
});

// 2. JSON格式的欢迎信息（当请求头Accept为application/json时）
app.get('/api', (req, res) => {
  res.json({
    message: '欢迎来到游戏社区平台API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    features: ['REST API', 'WebSocket 实时通信', '边缘计算优化'],
    endpoints: {
      home: '/',
      api: '/api',
      health: '/health',
      testDb: '/api/test-db',
      benchmark: '/api/benchmark',
      auth: '/api/auth',
      posts: '/api/posts',
      news: '/api/news',
      comments: '/api/comments',
      chat: '/api/chat',
      stats: '/api/stats',
    },
  });
});

// 3. 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'game-community-api',
    version: '2.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    features: {
      socketio: true,
      database: true,
      cache: process.env.REDIS_URL ? true : false,
    },
  });
});

// 4. 测试数据库连接
app.get('/api/test-db', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // 简单查询测试
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    const newsCount = await prisma.news.count();
    
    await prisma.$disconnect();
    
    res.json({ 
      success: true, 
      message: '数据库连接正常',
      stats: {
        userCount,
        postCount,
        commentCount,
        newsCount,
        totalRecords: userCount + postCount + commentCount + newsCount
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('数据库连接错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '数据库连接失败',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// 5. 性能测试端点
app.get('/api/benchmark', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // 并行执行多个查询测试性能
    const [users, posts, comments, news] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.news.count(),
    ]);
    
    await prisma.$disconnect();
    
    const responseTime = Date.now() - startTime;
    
    res.json({
      success: true,
      benchmark: {
        responseTime: `${responseTime}ms`,
        queryPerformance: responseTime < 100 ? 'excellent' : 
                         responseTime < 500 ? 'good' : 
                         responseTime < 1000 ? 'average' : 'slow',
        counts: { users, posts, comments, news },
        timestamp: new Date().toISOString(),
        note: '用于边缘计算性能对比基准'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: '性能测试失败',
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    });
  }
});

// 6. 测试接口（向后兼容）
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '🎉 前后端联调成功！',
    timestamp: new Date().toISOString(),
    data: {
      project: 'Game Community Platform',
      version: '2.0.0',
      technology: {
        backend: ['Node.js', 'Express', 'TypeScript', 'Socket.IO'],
        database: ['PostgreSQL', 'Prisma ORM'],
        frontend: ['Vue 3', 'TypeScript', 'Pinia'],
        features: ['边缘计算', '智能缓存', '实时交互', 'WebSocket']
      }
    }
  });
});

// 7. 模拟登录接口（临时，供旧前端兼容）
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // 模拟登录验证
  if (username === 'admin' && password === '123456') {
    res.json({
      success: true,
      message: '登录成功',
      token: 'fake-jwt-token-123456',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@game.com',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        bio: '系统管理员'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }
});

// 8. 游戏相关接口示例（保留向后兼容）
app.get('/api/games', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: '原神', category: '开放世界', players: 10000 },
      { id: 2, name: '英雄联盟', category: 'MOBA', players: 50000 },
      { id: 3, name: 'Apex Legends', category: 'FPS', players: 30000 },
    ],
    timestamp: new Date().toISOString(),
  });
});

// 9. 用户相关接口示例（保留向后兼容）
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, username: '玩家1', level: 30, isOnline: true },
      { id: 2, username: '玩家2', level: 45, isOnline: false },
      { id: 3, username: '玩家3', level: 12, issOnline: true },
    ],
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO连接处理
// io.on('connection', (socket) => {
//   console.log('用户已连接:', socket.id);
  
//   // 加入聊天室
//   socket.on('join-room', (roomId: string) => {
//     socket.join(roomId);
//     console.log(`用户 ${socket.id} 加入了房间 ${roomId}`);
    
//     // 通知房间内的其他用户
//     socket.to(roomId).emit('user-joined', {
//       userId: socket.id,
//       timestamp: new Date().toISOString(),
//     });
//   });
  
//   // 离开聊天室
//   socket.on('leave-room', (roomId: string) => {
//     socket.leave(roomId);
//     console.log(`用户 ${socket.id} 离开了房间 ${roomId}`);
//   });
  
//   // 发送消息
//   socket.on('send-message', (data: { roomId: string; message: any }) => {
//     const { roomId, message } = data;
    
//     // 广播消息到房间
//     io.to(roomId).emit('new-message', {
//       ...message,
//       timestamp: new Date().toISOString(),
//       socketId: socket.id,
//     });
    
//     console.log(`消息发送到房间 ${roomId}:`, message.content?.substring(0, 50));
//   });
  
//   // 用户输入状态
//   socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
//     const { roomId, userId, isTyping } = data;
//     socket.to(roomId).emit('user-typing', { userId, isTyping });
//   });
  
//   // 断开连接
//   socket.on('disconnect', () => {
//     console.log('用户已断开连接:', socket.id);
//   });
// });

// 10. 404处理（增强版）
app.use('*', (req, res) => {
  if (req.accepts('html')) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - 页面未找到</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f8f9fa;
          }
          h1 { 
            color: #dc2626; 
            font-size: 3em; 
            margin-bottom: 20px;
          }
          p { 
            font-size: 1.2em; 
            color: #4b5563; 
            margin: 10px 0;
          }
          code { 
            background: #f3f4f6; 
            padding: 5px 10px; 
            border-radius: 5px; 
            font-family: 'Courier New', monospace;
            color: #dc2626;
          }
          a { 
            display: inline-block; 
            margin-top: 20px; 
            padding: 10px 20px; 
            background: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            transition: background 0.3s;
          }
          a:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <h1>😅 404 - 页面未找到</h1>
        <p>请求的路径 <code>${req.originalUrl}</code> 不存在</p>
        <p><a href="/">返回首页</a></p>
      </body>
      </html>
    `);
  } else {
    res.status(404).json({ 
      error: '路由不存在',
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
      suggestion: '请检查API路径是否正确',
      availableEndpoints: [
        'GET  /',
        'GET  /api',
        'GET  /health',
        'GET  /api/test-db',
        'GET  /api/benchmark',
        'GET  /api/posts',
        'GET  /api/news',
        'GET  /api/chat',
        'POST /api/auth/register',
        'POST /api/auth/login',
      ],
    });
  }
});

// 11. 全局错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || Math.random().toString(36).substr(2, 9),
  });
});

// 12. 启动服务器
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`
    🚀 服务器已启动!
    📍 地址: http://localhost:${PORT}
    ⏰ 时间: ${new Date().toLocaleString()}
    🔧 环境: ${process.env.NODE_ENV || 'development'}
    🔌 Socket.IO: 已启用
    📊 健康检查: http://localhost:${PORT}/health
    ⚡ 性能测试: http://localhost:${PORT}/api/benchmark
    💾 数据库测试: http://localhost:${PORT}/api/test-db
    
    📡 可用接口:
       GET  http://localhost:${PORT}/              - 欢迎页面
       GET  http://localhost:${PORT}/api           - API信息
       GET  http://localhost:${PORT}/health        - 健康检查
       GET  http://localhost:${PORT}/api/test-db   - 数据库测试
       GET  http://localhost:${PORT}/api/benchmark - 性能测试
       GET  http://localhost:${PORT}/api/test      - 兼容性测试
       GET  http://localhost:${PORT}/api/posts     - 帖子接口
       GET  http://localhost:${PORT}/api/news      - 新闻接口
       GET  http://localhost:${PORT}/api/chat      - 聊天接口
    `);
  });
}

// 13. 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，开始优雅关闭...');
  server.close(() => {
    console.log('HTTP服务器已关闭');
    process.exit(0);
  });
});

export { app, server};