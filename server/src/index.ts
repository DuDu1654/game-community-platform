import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'game-community-api',
    version: '1.0.0'
  });
});

// 欢迎路由
app.get('/', (req, res) => {
  res.json({
    message: '欢迎来到游戏社区平台API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '路由不存在',
    path: req.originalUrl 
  });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
  ��� 服务器已启动!
  �� 地址: http://localhost:${PORT}
  ⏰ 时间: ${new Date().toLocaleString()}
  ��� 环境: ${process.env.NODE_ENV}
  `);
});

export default app;
