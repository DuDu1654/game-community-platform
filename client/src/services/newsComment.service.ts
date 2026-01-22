// client/src/services/newsComment.service.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  likeCount: number;
  replyCount: number;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  isReply?: boolean;
  parentId?: string | null;
}

export interface CommentQueryParams {
  page?: number
  limit?: number
  sortBy?: 'latest' | 'popular'
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

class NewsCommentService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 10000,
    });

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
          config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore();
          authStore.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // 确保 getNewsComments 方法的定义正确
async getNewsComments(
  newsId: string, 
  params: CommentQueryParams = {}
) {
  try {
    const response = await this.axiosInstance.get(`/news/${newsId}/comments`, {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        sortBy: params.sortBy || 'latest'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('获取评论失败:', error);
    throw error.response?.data?.error || '获取评论失败';
  }
}

  // 创建评论
  async createComment(newsId: string, data: CreateCommentInput) {
    try {
      const response = await this.axiosInstance.post(`/news/${newsId}/comments`, data);
      return response.data;
    } catch (error: any) {
      console.error('创建评论失败:', error);
      throw error.response?.data?.error || '发布评论失败';
    }
  }

  // 更新评论
  async updateComment(commentId: string, content: string) {
    try {
      const response = await this.axiosInstance.put(`/news/comments/${commentId}`, { content });
      return response.data;
    } catch (error: any) {
      console.error('更新评论失败:', error);
      throw error.response?.data?.error || '更新评论失败';
    }
  }

  // 删除评论
  async deleteComment(commentId: string) {
    try {
      const response = await this.axiosInstance.delete(`/news/comments/${commentId}`);
      return response.data;
    } catch (error: any) {
      console.error('删除评论失败:', error);
      throw error.response?.data?.error || '删除评论失败';
    }
  }

  // 点赞/取消点赞
  async toggleLike(commentId: string) {
    try {
      const response = await this.axiosInstance.post(`/news/comments/${commentId}/like`);
      return response.data;
    } catch (error: any) {
      console.error('点赞操作失败:', error);
      throw error.response?.data?.error || '操作失败';
    }
  }

  // 检查点赞状态
  async checkLike(commentId: string) {
    try {
      const response = await this.axiosInstance.get(`/news/comments/${commentId}/like`);
      return response.data;
    } catch (error: any) {
      console.error('检查点赞状态失败:', error);
      throw error.response?.data?.error || '检查失败';
    }
  }
}

export default new NewsCommentService();