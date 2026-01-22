// server/src/config/env.ts
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 配置接口
export interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  SOCKET_PORT: number;
  LOG_LEVEL: string;
  MAX_FILE_SIZE: number;
  ALLOWED_IMAGE_TYPES: string[];
}

// 配置验证
const validateConfig = (): void => {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`缺少必要的环境变量: ${missing.join(', ')}`);
  }
};

// 获取配置
const getConfig = (): Config => {
  validateConfig();
  
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-here-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    SOCKET_PORT: parseInt(process.env.SOCKET_PORT || '3000', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    ALLOWED_IMAGE_TYPES: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  };
};

// 导出配置实例
export const config = getConfig();

// 导出验证函数
export { validateConfig };