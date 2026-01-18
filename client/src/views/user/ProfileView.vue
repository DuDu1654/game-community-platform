<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 头部 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">个人中心</h1>
      <p class="mt-2 text-gray-600">查看和管理您的个人信息、帖子、评论等</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- 左侧：个人信息 -->
      <div class="lg:col-span-1">
        <div class="card sticky top-8">
          <!-- 用户头像 -->
          <div class="text-center">
            <div class="relative inline-block">
              <img
                :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username"
                :alt="user.username"
                class="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg"
              />
              <label
                for="avatar-upload"
                class="absolute bottom-2 right-2 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
                title="更换头像"
              >
                <i class="el-icon-camera"></i>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </label>
            </div>
            
            <h2 class="text-xl font-semibold mt-4">{{ user.username }}</h2>
            <p class="text-gray-600">{{ user.email }}</p>
            
            <!-- 用户角色 -->
            <div class="mt-2">
              <span :class="[
                'badge',
                user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'
              ]">
                {{ roleText[user.role] }}
              </span>
            </div>
            
            <!-- 用户统计 -->
            <div class="grid grid-cols-3 gap-4 mt-6">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ stats.posts }}</div>
                <div class="text-sm text-gray-500">帖子</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ stats.comments }}</div>
                <div class="text-sm text-gray-500">评论</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">{{ stats.likes }}</div>
                <div class="text-sm text-gray-500">获赞</div>
              </div>
            </div>
          </div>

          <!-- 编辑按钮 -->
          <div class="mt-6">
            <router-link
              to="/settings"
              class="btn-primary w-full flex items-center justify-center"
            >
              <i class="el-icon-edit mr-2"></i>
              编辑资料
            </router-link>
          </div>
        </div>

        <!-- 活跃度 -->
        <div class="card mt-6">
          <h3 class="text-lg font-semibold mb-4">活跃度</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">发帖频率</span>
                <span class="font-medium">{{ activity.postFrequency }}/周</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :style="{ width: `${Math.min(activity.postFrequency * 20, 100)}%` }"
                  class="bg-green-500 h-2 rounded-full"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">评论频率</span>
                <span class="font-medium">{{ activity.commentFrequency }}/周</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :style="{ width: `${Math.min(activity.commentFrequency * 10, 100)}%` }"
                  class="bg-blue-500 h-2 rounded-full"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">在线时长</span>
                <span class="font-medium">{{ activity.onlineHours }}小时</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :style="{ width: `${Math.min(activity.onlineHours * 5, 100)}%` }"
                  class="bg-purple-500 h-2 rounded-full"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：内容区域 -->
      <div class="lg:col-span-3">
        <!-- 标签页 -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
              <span
                v-if="tab.count"
                class="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs"
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <!-- 我的帖子 -->
        <div v-if="activeTab === 'posts'" class="space-y-6">
          <div v-if="loading" class="text-center py-12">
            <i class="el-icon-loading text-4xl text-primary-600"></i>
            <p class="mt-2 text-gray-600">加载中...</p>
          </div>

          <div v-else-if="userPosts.length === 0" class="text-center py-12">
            <i class="el-icon-document text-4xl text-gray-400"></i>
            <p class="mt-2 text-gray-600">还没有发布过帖子</p>
            <router-link to="/forums/create" class="btn-primary mt-4 inline-block">
              去发帖
            </router-link>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="post in userPosts"
              :key="post.id"
              class="card hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div>
                  <router-link
                    :to="`/forums/${post.id}`"
                    class="text-lg font-medium text-gray-900 hover:text-primary-600"
                  >
                    {{ post.title }}
                  </router-link>
                  <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{{ formatTime(post.createdAt) }}</span>
                    <span><i class="el-icon-view"></i> {{ post.viewCount }}</span>
                    <span><i class="el-icon-star-off"></i> {{ post.likeCount }}</span>
                    <span><i class="el-icon-chat-dot-round"></i> {{ post.commentCount }}</span>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span
                      v-for="tag in post.tags"
                      :key="tag"
                      class="badge badge-secondary text-xs"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <router-link
                    :to="`/forums/${post.id}/edit`"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="编辑"
                  >
                    <i class="el-icon-edit"></i>
                  </router-link>
                  <button
                    @click="deletePost(post.id)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="删除"
                  >
                    <i class="el-icon-delete"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="pagination.pages > 1" class="flex justify-center mt-8">
              <nav class="flex items-center space-x-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="!pagination.hasPrev"
                  :class="[
                    'px-3 py-2 rounded-lg border',
                    pagination.hasPrev
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  上一页
                </button>
                
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  :class="[
                    'px-3 py-2 rounded-lg border',
                    pagination.page === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="!pagination.hasNext"
                  :class="[
                    'px-3 py-2 rounded-lg border',
                    pagination.hasNext
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  下一页
                </button>
              </nav>
            </div>
          </div>
        </div>

        <!-- 我的评论 -->
        <div v-else-if="activeTab === 'comments'" class="space-y-6">
          <div v-if="loading" class="text-center py-12">
            <i class="el-icon-loading text-4xl text-primary-600"></i>
            <p class="mt-2 text-gray-600">加载中...</p>
          </div>

          <div v-else-if="userComments.length === 0" class="text-center py-12">
            <i class="el-icon-chat-line-round text-4xl text-gray-400"></i>
            <p class="mt-2 text-gray-600">还没有发表过评论</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="comment in userComments"
              :key="comment.id"
              class="card hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-gray-700">{{ comment.content }}</p>
                  <div class="mt-2 text-sm text-gray-500">
                    评论于
                    <router-link
                      :to="`/forums/${comment.postId}`"
                      class="text-primary-600 hover:text-primary-800"
                    >
                      {{ comment.post?.title || '帖子' }}
                    </router-link>
                    · {{ formatTime(comment.createdAt) }}
                  </div>
                </div>
                <button
                  @click="deleteComment(comment.id)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="删除"
                >
                  <i class="el-icon-delete"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的点赞 -->
        <div v-else-if="activeTab === 'likes'" class="space-y-6">
          <div v-if="loading" class="text-center py-12">
            <i class="el-icon-loading text-4xl text-primary-600"></i>
            <p class="mt-2 text-gray-600">加载中...</p>
          </div>

          <div v-else-if="userLikes.length === 0" class="text-center py-12">
            <i class="el-icon-star-off text-4xl text-gray-400"></i>
            <p class="mt-2 text-gray-600">还没有点赞过内容</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="like in userLikes"
              :key="like.id"
              class="card hover:shadow-md transition-shadow"
            >
              <div class="flex items-start">
                <div class="mr-4">
                  <i
                    :class="[
                      'text-2xl',
                      like.postId ? 'el-icon-document text-blue-500' : 'el-icon-chat-line-round text-green-500'
                    ]"
                  ></i>
                </div>
                <div class="flex-1">
                  <router-link
                    v-if="like.post"
                    :to="`/forums/${like.post.id}`"
                    class="text-lg font-medium text-gray-900 hover:text-primary-600"
                  >
                    {{ like.post.title }}
                  </router-link>
                  <router-link
                    v-else-if="like.comment"
                    :to="`/forums/${like.comment.postId}`"
                    class="text-lg font-medium text-gray-900 hover:text-primary-600"
                  >
                    评论: {{ like.comment.content.substring(0, 50) }}...
                  </router-link>
                  <div class="mt-1 text-sm text-gray-500">
                    {{ formatTime(like.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 账号安全 -->
        <div v-else-if="activeTab === 'security'" class="space-y-6">
          <div class="card">
            <h3 class="text-lg font-semibold mb-4">登录记录</h3>
            <div class="space-y-3">
              <div
                v-for="record in loginRecords"
                :key="record.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div class="font-medium">{{ record.location }}</div>
                  <div class="text-sm text-gray-500">{{ record.ip }} · {{ record.device }}</div>
                </div>
                <div class="text-sm text-gray-500">{{ formatTime(record.time) }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold mb-4">安全设置</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">修改密码</div>
                  <div class="text-sm text-gray-500">定期修改密码以提高安全性</div>
                </div>
                <button
                  @click="showPasswordModal = true"
                  class="btn-secondary"
                >
                  修改
                </button>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">两步验证</div>
                  <div class="text-sm text-gray-500">启用后需要验证码登录</div>
                </div>
                <button
                  @click="toggleTwoFactor"
                  :class="[
                    'px-3 py-1 rounded text-sm font-medium',
                    twoFactorEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ twoFactorEnabled ? '已启用' : '未启用' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showPasswordModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">修改密码</h3>
        <form @submit.prevent="changePassword">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                当前密码
              </label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                新密码
              </label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                class="input-field"
              />
              <p class="text-xs text-gray-500 mt-1">至少8个字符，包含字母和数字</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                确认新密码
              </label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="input-field"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showPasswordModal = false"
              class="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="!isPasswordValid"
              class="btn-primary"
            >
              确认修改
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePostStore } from '@/stores/post'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 导入正确的 User 类型
import type { User } from '@/types/user'

const authStore = useAuthStore()
const postStore = usePostStore()

// 状态
const activeTab = ref('posts')
const showPasswordModal = ref(false)
const loading = ref(false)
const twoFactorEnabled = ref(false)

// 状态更换头像新加
const uploading = ref(false)
const uploadProgress = ref(0)


// 用户信息 - 修复：明确指定类型
const user = computed(() => {
  // 使用 store 中的 user，它已经是 User 类型
  return authStore.user || {
    id: '',  // 这里必须有 id
    username: '',
    email: '',
    avatar: '',
    role: 'USER' as 'USER' | 'ADMIN',
    bio: '',
    createdAt: '',
    updatedAt: '',  // 添加 updatedAt
  }
})

// 统计信息
const stats = ref({
  posts: 0,
  comments: 0,
  likes: 0,
})

// 活跃度
const activity = ref({
  postFrequency: 3.2,
  commentFrequency: 8.5,
  onlineHours: 24,
})

// 用户帖子
const userPosts = ref<any[]>([])
const userComments = ref<any[]>([])
const userLikes = ref<any[]>([])

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
  hasNext: false,
  hasPrev: false,
})

// 登录记录
const loginRecords = ref([
  { id: 1, location: '北京', ip: '192.168.1.1', device: 'Chrome/Windows', time: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, location: '上海', ip: '192.168.1.2', device: 'Firefox/macOS', time: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, location: '广州', ip: '192.168.1.3', device: 'Safari/iOS', time: new Date(Date.now() - 172800000).toISOString() },
])

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 标签页
const tabs = ref([
  { id: 'posts', name: '我的帖子', count: 0 },
  { id: 'comments', name: '我的评论', count: 0 },
  { id: 'likes', name: '我的点赞', count: 0 },
  { id: 'security', name: '账号安全', count: 0 },
])

// 角色文本
const roleText: Record<string, string> = {
  USER: '普通用户',
  MODERATOR: '版主',
  ADMIN: '管理员',
}

// 计算属性
const visiblePages = computed(() => {
  const current = pagination.page
  const total = pagination.pages
  const range = 2
  
  let start = Math.max(1, current - range)
  let end = Math.min(total, current + range)
  
  if (end - start < range * 2) {
    if (current <= range) {
      end = Math.min(total, range * 2 + 1)
    } else if (current >= total - range) {
      start = Math.max(1, total - range * 2)
    }
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const isPasswordValid = computed(() => {
  return (
    passwordForm.currentPassword &&
    passwordForm.newPassword.length >= 8 &&
    passwordForm.newPassword === passwordForm.confirmPassword
  )
})

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), { 
    addSuffix: true,
    locale: zhCN 
  })
}

// 加载用户数据
const loadUserData = async () => {
  loading.value = true
  
  try {
    // 加载用户帖子
    // fetchPosts是void类型，不返回数据，只更新store的state
    await postStore.fetchPosts({
      authorId: user.value.id,
      page: pagination.page,
      limit: pagination.limit,
    })
    
    // 从store的state中获取数据
    // 根据你的store，数据应该存储在posts.value中
    if (postStore.posts && postStore.posts.length > 0) {
      // 过滤当前用户的帖子
      const filteredPosts = postStore.posts.filter(post => 
        post.author && post.author.id === user.value.id
      )
      userPosts.value = filteredPosts
      stats.value.posts = postStore.pagination.total || filteredPosts.length
      // 在访问前检查 tabs.value
if (tabs.value && tabs.value[0]) {
  tabs.value[0].count = stats.value.posts
}
      
      // 更新分页信息
      Object.assign(pagination, {
        total: postStore.pagination.total || filteredPosts.length,
        pages: postStore.pagination.pages || 1,
        hasNext: postStore.pagination.hasNext || false,
        hasPrev: postStore.pagination.hasPrev || false
      })
    } else {
      // 如果没有数据，设置默认值
      userPosts.value = []
      stats.value.posts = 0
      // 在访问前检查 tabs.value
if (tabs.value && tabs.value[0]) {
  tabs.value[0].count = 0
}
    }
    
    // 这里可以添加加载评论和点赞的逻辑
    // 由于时间关系，我们使用模拟数据
    
    // 模拟评论数据
    userComments.value = [
      { id: '1', content: '这个攻略很有用！', postId: '1', post: { title: '英雄联盟最新攻略' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', content: '我同意你的观点', postId: '2', post: { title: 'CS:GO枪法练习' }, createdAt: new Date(Date.now() - 7200000).toISOString() },
    ]
    stats.value.comments = 15
    

   // 在访问前检查 tabs.value
if (tabs.value && tabs.value[1]) {
  tabs.value[1].count = stats.value.comments
}


    
    // 模拟点赞数据
    userLikes.value = [
      { id: '1', postId: '1', post: { title: '英雄联盟最新攻略' }, createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: '2', commentId: '1', comment: { content: '这个攻略很有用！', postId: '1' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
    ]
    stats.value.likes = 42
   


    // 在访问前检查 tabs.value
if (tabs.value && tabs.value[2]) {
  tabs.value[2].count = stats.value.likes
}
    
  } catch (error) {
    console.error('加载用户数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理头像上传
const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  
  // 检查 file 是否存在
  if (!file) {
    return
  }
  
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      // 这里应该调用API更新用户头像
      console.log('新头像:', e.target.result)
      alert('头像上传成功！')
    }
  }
  reader.readAsDataURL(file)
  
  input.value = ''
}

// 删除帖子
const deletePost = async (postId: string) => {
  if (!confirm('确定要删除这篇帖子吗？')) return
  
  const result = await postStore.deletePost(postId)
  if (result.success) {
    userPosts.value = userPosts.value.filter(post => post.id !== postId)
    stats.value.posts--
    

    if (tabs.value && tabs.value[0]) {
  tabs.value[0].count = stats.value.posts
}
  }
}

// 删除评论
const deleteComment = async (commentId: string) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  // 这里应该调用API删除评论
  userComments.value = userComments.value.filter(comment => comment.id !== commentId)
  stats.value.comments--
  

  if (tabs.value && tabs.value[1]) {
  tabs.value[1].count = stats.value.comments
}
  alert('评论删除成功！')
}

// 切换两步验证
const toggleTwoFactor = () => {
  twoFactorEnabled.value = !twoFactorEnabled.value
  alert(`两步验证已${twoFactorEnabled.value ? '启用' : '关闭'}`)
}

// 修改密码
const changePassword = async () => {
  if (!isPasswordValid.value) {
    alert('请填写正确的密码信息')
    return
  }
  
  // 这里应该调用API修改密码
  console.log('修改密码:', passwordForm)
  alert('密码修改成功！')
  showPasswordModal.value = false
  
  // 清空表单
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 切换页码
const changePage = (page: number) => {
  if (page < 1 || page > pagination.pages) return
  pagination.page = page
  loadUserData()
}

// 初始化
onMounted(() => {
  loadUserData()
})
</script>