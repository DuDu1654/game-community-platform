// client/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/TestView.vue'),
      meta: { hideNavbar: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, hideNavbar: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresAuth: false, hideNavbar: true }
    },
    {
      path: '/forums',
      name: 'forums',
      component: () => import('@/views/forums/ForumListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forums/:id',
      name: 'forum-detail',
      component: () => import('@/views/forums/ForumDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forums/create',
      name: 'forum-create',
      component: () => import('@/views/forums/CreatePostView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forums/:id/edit',
      name: 'forum-edit',
      component: () => import('@/views/forums/EditPostView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/news/NewsListView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: () => import('@/views/news/NewsDetailView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/user/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/user/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/chat/ChatView.vue'),
      meta: { requiresAuth: true }
    },
    {
      // 管理员登录页面
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLogin.vue'),
      meta: { requiresAuth: false, hideNavbar: true }
    },
    {
      // 管理员布局页面
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboard.vue')
        },
        {
          path: 'news',
          name: 'admin-news',
          component: () => import('@/views/admin/news/NewsManagement.vue')
        },
        {
          path: 'news/create',
          name: 'admin-news-create',
          component: () => import('@/views/admin/news/NewsEditor.vue')
        },
        {
          path: 'news/edit/:id',
          name: 'admin-news-edit',
          component: () => import('@/views/admin/news/NewsEditor.vue'),
          props: true
        }
      ]
    },
    {
      // 原有的DashboardView（如果需要保留的话）
      path: '/old-admin',
      name: 'old-admin',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

// 修改路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('admin_token')
  const userRole = localStorage.getItem('user_role') || 'USER'
  
  console.log('🚀 路由导航:', to.path, 'token:', !!adminToken)
  
  // 管理员路由特殊处理
  if (to.path.startsWith('/admin')) {
    console.log('🛡️ 进入管理员路由检查')
    
    // 如果是登录页
    if (to.name === 'admin-login') {
      if (adminToken) {
        console.log('✅ 已登录，跳转到/admin')
        next('/admin')
      } else {
        console.log('👤 未登录，允许访问登录页')
        next()
      }
      return
    }
    
    // 非登录页s
    if (!adminToken) {
      console.log('❌ 没有管理员token，跳转到登录页')
      next('/admin/login')
      return
    }
    
    console.log('✅ 允许访问管理员页面')
    next()
    return
  }
  
  // 其他路由逻辑...
  next()
})

export default router