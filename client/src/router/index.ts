import { createRouter, createWebHistory } from 'vue-router'

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
      meta: { hideNavbar: true }  // 测试页面不显示导航栏
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
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      // 保留原有的 about 路由，但改为懒加载
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
    },
    // 在路由配置中添加
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
}
  ]
})

// 路由守卫：检查认证
router.beforeEach((to, from, next) => {
  // 这里稍后我们会从Pinia store中获取用户信息
  const isAuthenticated = localStorage.getItem('token') !== null
  const userRole = localStorage.getItem('user_role') || 'USER'
  
  // 如果需要认证但未登录，重定向到登录页
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // 如果需要管理员权限但不是管理员
  else if (to.meta.requiresAdmin && userRole !== 'ADMIN') {
    next('/')
  }
  // 如果已登录但访问登录/注册页，重定向到首页
  else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next('/')
  }
  else {
    next()
  }
})

export default router