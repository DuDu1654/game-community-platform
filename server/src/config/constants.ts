// server/src/config/constants.ts
// 应用常量配置
export const constants = {
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // 验证配置
  VALIDATION: {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_MAX_LENGTH: 100,
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    CONTENT_MIN_LENGTH: 1,
    CONTENT_MAX_LENGTH: 10000,
  },

  // 缓存配置
  CACHE: {
    DEFAULT_TTL: 300, // 5分钟
    MAX_TTL: 3600, // 1小时
  },

  // 文件配置
  FILES: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    UPLOAD_PATH: 'uploads',
  },

  // Socket配置
  SOCKET: {
    PING_INTERVAL: 25000,
    PING_TIMEOUT: 60000,
  },

  // 角色
  ROLES: {
    USER: 'USER',
    MODERATOR: 'MODERATOR',
    ADMIN: 'ADMIN',
  },
}