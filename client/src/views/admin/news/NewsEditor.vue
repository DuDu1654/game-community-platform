<!-- client/src/views/admin/news/NewsEditor.vue -->
<template>
  <div class="news-editor">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="top"
    >
      <el-form-item label="新闻标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入新闻标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="分类" prop="category">
        <el-select
          v-model="form.category"
          placeholder="请选择分类"
          class="w-full"
        >
          <el-option label="游戏新闻" value="game" />
          <el-option label="攻略指南" value="guide" />
          <el-option label="赛事资讯" value="tournament" />
          <el-option label="社区公告" value="announcement" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="10"
          placeholder="请输入新闻内容"
        />
      </el-form-item>
      
      <el-form-item label="摘要">
        <el-input
          v-model="form.summary"
          type="textarea"
          :rows="3"
          placeholder="请输入新闻摘要（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          placeholder="请输入标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="draft">草稿</el-radio>
          <el-radio label="published">已发布</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="作者" prop="author">
        <el-input
          v-model="form.author"
          placeholder="请输入作者"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">
          保存
        </el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  title: '',
  content: '',
  summary: '',
  category: 'game',
  tags: [] as string[],
  author: '管理员',
  status: 'draft'
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, message: '标题至少3个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ]
}

const tagOptions = [
  '英雄联盟', '王者荣耀', '原神', 'CS:GO', 'DOTA2',
  '赛事', '攻略', '更新', '活动', '公告'
]

// 如果是编辑模式，加载数据
onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        Object.assign(form, data.data)
      }
    } catch (error) {
      console.error('加载新闻失败:', error)
    }
  }
})

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const url = route.params.id 
      ? `/api/admin/news/${route.params.id}`
      : '/api/admin/news'
    
    const method = route.params.id ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(form)
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success(route.params.id ? '更新成功' : '创建成功')
      router.push('/admin/news')
    } else {
      ElMessage.error(data.message || '操作失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push('/admin/news')
}
</script>

<style scoped>
.news-editor {
  padding: 20px;
  background: white;
  border-radius: 8px;
}
</style>