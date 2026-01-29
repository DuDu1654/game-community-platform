<template>
  <div class="rich-text-editor" :class="readonly ? 'readonly-mode' : ''">
    <!-- 工具栏 -->
    <div v-if="!readonly" class="editor-toolbar">
      <div class="toolbar-buttons">
        <!-- 字体样式 -->
        <button
          v-for="item in fontStyleButtons"
          :key="item.icon"
          @click="insertText(item.prefix, item.suffix, item.placeholder)"
          :title="item.title"
          class="toolbar-button"
        >
          <i :class="item.icon"></i>
        </button>
        
        <div class="toolbar-divider"></div>
        
        <!-- 列表 -->
        <button
          v-for="item in listButtons"
          :key="item.icon"
          @click="insertText(item.prefix, item.suffix, item.placeholder)"
          :title="item.title"
          class="toolbar-button"
        >
          <i :class="item.icon"></i>
        </button>
        
        <div class="toolbar-divider"></div>
        
        <!-- 对齐 -->
        <button
          v-for="item in alignButtons"
          :key="item.icon"
          @click="insertText(item.prefix, item.suffix, item.placeholder)"
          :title="item.title"
          class="toolbar-button"
        >
          <i :class="item.icon"></i>
        </button>
        
        <div class="toolbar-divider"></div>
        
        <!-- 上传图片按钮 -->
        <label for="image-upload" class="toolbar-button upload-label" title="上传图片">
          <i class="el-icon-picture-outline"></i>
        </label>
        <input
          id="image-upload"
    type="file"
    accept="image/*"
    multiple
    class="hidden-file-input"
    @change="handleFileChange" 
        />
        
        <!-- 添加链接 -->
        <button
          @click="insertLink"
          title="添加链接"
          class="toolbar-button"
        >
          <i class="el-icon-link"></i>
        </button>
        
        <!-- 清空 -->
        <button
          @click="clearContent"
          title="清空"
          class="toolbar-button"
        >
          <i class="el-icon-delete"></i>
        </button>
      </div>
    </div>
    
    <!-- 编辑器区域 -->
    <div class="editor-wrapper">
      <!-- Markdown 模式 -->
      <template v-if="mode === 'markdown'">
        <textarea
          v-model="markdownContent"
          :placeholder="placeholder"
          class="markdown-editor"
          :readonly="readonly"
          @input="onMarkdownInput"
        />
      </template>
      
      <!-- 预览模式 -->
      <template v-else-if="mode === 'preview'">
        <div
          class="preview-content"
          v-html="renderedContent"
        />
      </template>
      
      <!-- 编辑器模式 -->
      <template v-else>
        <div
          ref="editorContent"
          :contenteditable="!readonly"
          class="editor-content"
          :data-placeholder="placeholder"
          @input="onContentInput"
          @paste="onPaste"
          @keydown="onKeydown"
        />
      </template>
    </div>
    
    <!-- 模式切换 -->
    <div v-if="!readonly" class="editor-footer">
      <div class="mode-buttons">
        <button
          v-for="modeOption in modeOptions"
          :key="modeOption.value"
          @click="mode = modeOption.value"
          :class="[
            'mode-button',
            mode === modeOption.value ? 'mode-button-active' : 'mode-button-inactive'
          ]"
        >
          {{ modeOption.label }}
        </button>
      </div>
      
      <div class="word-count">
        字数: {{ wordCount }} 字
      </div>
    </div>
    
    <!-- 上传进度 -->
    <div v-if="uploadProgress > 0" class="upload-progress">
      <div class="progress-container">
        <div
          class="progress-bar"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
      <span class="progress-text">{{ uploadProgress }}%</span>
    </div>
    
    <!-- 图片列表 -->
    <div v-if="uploadedImages.length > 0" class="uploaded-images">
      <h4 class="images-title">已上传图片</h4>
      <div class="images-grid">
        <div
          v-for="(image, index) in uploadedImages"
          :key="index"
          class="image-item"
        >
          <img
            :src="image.url"
            :alt="image.name"
            class="image-thumbnail"
          />
          <button
            @click="removeImage(index)"
            class="remove-image-button"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'  // 确保导入 ElMessage


// Props 接口定义
interface Props {
  modelValue: string
  placeholder?: string
  readonly?: boolean
  maxLength?: number
}

// 定义props
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  readonly: false,
  maxLength: 10000
})


// 修改 handleFileChange 函数
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    // 使用数组索引而不是 item 方法
    for (let i = 0; i < files.length; i++) {
      const file = files[i]  // ✅ 使用数组索引
      if (file) {
        handleImageUpload(file)
      }
    }
  }

  // 清空 input 值，以便可以再次选择同一文件
  target.value = ''
}


// 定义emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'contentChange', value: string, images: string[]): void
}>()

// 状态
const mode = ref<'edit' | 'preview' | 'markdown'>('edit')
const editorContent = ref<HTMLElement | null>(null)
const markdownContent = ref('')
const uploadedImages = ref<Array<{url: string, name: string}>>([])
const uploadProgress = ref(0)
const markdownTextareaRef = ref<HTMLTextAreaElement | null>(null)  // 修改这里

// 编辑器模式选项
const modeOptions = [
  { value: 'edit' as const, label: '编辑模式' },
  { value: 'markdown' as const, label: 'Markdown' },
  { value: 'preview' as const, label: '预览' }
]

// 工具栏按钮配置
const fontStyleButtons = [
  { icon: 'el-icon-bold', prefix: '**', suffix: '**', placeholder: '加粗文字', title: '加粗' },
  { icon: 'el-icon-italic', prefix: '*', suffix: '*', placeholder: '斜体文字', title: '斜体' },
  { icon: 'el-icon-header', prefix: '# ', suffix: '', placeholder: '标题', title: '标题' },
  { icon: 'el-icon-strikethrough', prefix: '~~', suffix: '~~', placeholder: '删除线', title: '删除线' }
]

const listButtons = [
  { icon: 'el-icon-list', prefix: '- ', suffix: '', placeholder: '列表项', title: '无序列表' },
  { icon: 'el-icon-s-order', prefix: '1. ', suffix: '', placeholder: '列表项', title: '有序列表' }
]

const alignButtons = [
  { icon: 'el-icon-align-left', prefix: '<div style="text-align: left;">', suffix: '</div>', placeholder: '左对齐内容', title: '左对齐' },
  { icon: 'el-icon-align-center', prefix: '<div style="text-align: center;">', suffix: '</div>', placeholder: '居中内容', title: '居中' },
  { icon: 'el-icon-align-right', prefix: '<div style="text-align: right;">', suffix: '</div>', placeholder: '右对齐内容', title: '右对齐' }
]

// 计算属性
const wordCount = computed(() => {
  const content = mode.value === 'markdown' ? markdownContent.value : props.modelValue
  return content.replace(/<[^>]*>/g, '').replace(/\s/g, '').length
})

const renderedContent = computed(() => {
  const content = markdownContent.value
  return content
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
})

// 从内容中提取图片
const getImagesFromContent = (content: string): string[] => {
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const matches: string[] = []
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1]) {
      matches.push(match[1])
    }
  }
  return matches
}

// Markdown 输入处理
const onMarkdownInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  markdownContent.value = value
  emit('update:modelValue', value)
  emit('contentChange', value, getImagesFromContent(value))
}

// 编辑器输入处理
const onContentInput = (event: Event) => {
  if (!editorContent.value) return
  const value = editorContent.value.innerHTML
  emit('update:modelValue', value)
  emit('contentChange', value, getImagesFromContent(value))
}

// 插入文本
const insertText = (prefix: string, suffix: string, placeholder: string) => {
  if (mode.value === 'markdown') {
    insertIntoTextarea(prefix, suffix, placeholder)
  } else {
    insertIntoContentEditable(prefix, suffix, placeholder)
  }
}

const insertIntoTextarea = (prefix: string, suffix: string, placeholder: string) => {
  const textarea = document.querySelector('textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = markdownContent.value.substring(start, end)
  const textToInsert = selectedText || placeholder
  
  const newText = markdownContent.value.substring(0, start) + 
                 prefix + textToInsert + suffix + 
                 markdownContent.value.substring(end)
  
  markdownContent.value = newText
  emit('update:modelValue', newText)
  emit('contentChange', newText, getImagesFromContent(newText))
  
  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + prefix.length + textToInsert.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const insertIntoContentEditable = (prefix: string, suffix: string, placeholder: string) => {
  if (!editorContent.value) return
  
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return
  
  const range = selection.getRangeAt(0)
  const selectedText = range.toString()
  const textToInsert = selectedText || placeholder
  
  const textNode = document.createTextNode(prefix + textToInsert + suffix)
  range.deleteContents()
  range.insertNode(textNode)
  
  const content = editorContent.value.innerHTML
  emit('update:modelValue', content)
  emit('contentChange', content, getImagesFromContent(content))
}

// 图片上传
// 图片上传处理
// 修改 handleImageUpload 函数
const handleImageUpload = async (file: File) => {
  try {
    console.log('开始上传图片:', file.name, file.size)
    
    const formData = new FormData()
    formData.append('image', file)
    
    // 使用完整的URL，避免相对路径问题
    const baseUrl = window.location.origin
    const uploadUrl = `${baseUrl}/api/upload/image`
    
    console.log('发送上传请求到:', uploadUrl)
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        // 如果有token，添加token
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      }
    })
    
    console.log('上传响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('上传失败:', errorText)
      
      // 尝试使用备用路径
      const backupUrl = `${baseUrl}/upload/image`
      console.log('尝试备用路径:', backupUrl)
      
      const backupResponse = await fetch(backupUrl, {
        method: 'POST',
        body: formData
      })
      
      if (!backupResponse.ok) {
        throw new Error(`上传失败: ${response.status} ${response.statusText}`)
      }
      
      const backupData = await backupResponse.json()
      if (backupData.success && backupData.data?.url) {
        return processUploadSuccess(backupData.data.url, file.name)
      }
      
      throw new Error('备用路径也失败了')
    }
    
    const data = await response.json()
    console.log('上传返回数据:', data)
    
    if (data.success && data.data?.url) {
      return processUploadSuccess(data.data.url, file.name)
    } else {
      console.error('上传返回格式不正确:', data)
      throw new Error(data.message || '上传失败，服务器返回格式不正确')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败: ' + (error as Error).message)
    throw error
  }
}

// 提取成功处理逻辑
const processUploadSuccess = (imageUrl: string, fileName: string) => {
  // 在编辑器中插入图片
  insertImageToEditor(imageUrl, fileName)
  
  // 记录上传的图片
  uploadedImages.value.push({
    url: imageUrl,
    name: fileName
  })
  
  // 触发事件
  const currentContent = mode.value === 'markdown' 
    ? markdownContent.value 
    : editorContent.value?.innerHTML || ''
  
  const images = getImagesFromContent(currentContent)
  emit('contentChange', currentContent, images)
  
  console.log('图片上传成功:', imageUrl)
  return imageUrl
}

// 插入图片到编辑器
const insertImageToEditor = (imageUrl: string, altText: string) => {
  if (mode.value === 'markdown') {
    // Markdown 模式
    const imgMarkdown = `![${altText}](${imageUrl})`
    // 使用正确的 ref 名称
    const textarea = markdownTextareaRef.value
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const beforeText = markdownContent.value.substring(0, start)
      const afterText = markdownContent.value.substring(end)
      markdownContent.value = beforeText + imgMarkdown + afterText
      
      // 设置光标位置
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = start + imgMarkdown.length
      }, 0)
    }
  } else {
    // HTML 模式
    const imgHtml = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto;" />`
    
    if (editorContent.value) {
      // 获取当前选区
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        // 创建图片元素
        const imgElement = document.createElement('div')
        imgElement.innerHTML = imgHtml
        
        // 插入图片
        const fragment = document.createDocumentFragment()
        Array.from(imgElement.childNodes).forEach(node => {
          fragment.appendChild(node)
        })
        
        range.insertNode(fragment)
        
        // 移动光标到图片后面
        range.setStartAfter(fragment.lastChild || fragment)
        range.setEndAfter(fragment.lastChild || fragment)
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        // 没有选区，在末尾插入
        editorContent.value.insertAdjacentHTML('beforeend', `<p>${imgHtml}</p>`)
      }
    }
  }
  
  emit('update:modelValue', mode.value === 'markdown' ? markdownContent.value : editorContent.value?.innerHTML || '')
}


const uploadImage = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('image', file)
    
    // 模拟上传进度
    const simulateProgress = () => {
      uploadProgress.value = 0
      const interval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10
        }
      }, 100)
      return interval
    }
    
    const progressInterval = simulateProgress()
    
    // 这里应该替换为你的实际上传接口
    fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    .then(async response => {
      clearInterval(progressInterval)
      uploadProgress.value = 100
      
      const data = await response.json()
      if (data.success && data.data?.url) {
        const imageUrl = data.data.url
        const imageName = file.name
        
        // 添加到已上传图片列表
        uploadedImages.value.push({
          url: imageUrl,
          name: imageName
        })
        
        // 插入到编辑器
        insertImage(imageUrl, imageName)
        
        setTimeout(() => {
          uploadProgress.value = 0
        }, 1000)
        
        resolve()
      } else {
        throw new Error(data.message || '上传失败')
      }
    })
    .catch(error => {
      clearInterval(progressInterval)
      uploadProgress.value = 0
      console.error('图片上传失败:', error)
      alert('图片上传失败: ' + error.message)
      reject(error)
    })
  })
}

const insertImage = (imageUrl: string, altText: string) => {
  const imgHtml = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5rem 0;" />`
  
  if (mode.value === 'markdown') {
    const markdown = `![${altText}](${imageUrl})`
    insertIntoTextarea(markdown, '', '')
  } else if (editorContent.value) {
    insertIntoContentEditable(imgHtml, '', '')
  }
}

// 移除图片
// 移除图片
const removeImage = (index: number) => {
  if (index < 0 || index >= uploadedImages.value.length) return
  
  const image = uploadedImages.value[index]!  // 添加非空断言
  const content = mode.value === 'markdown' ? markdownContent.value : props.modelValue
  
  if (mode.value === 'markdown') {
    const markdownPattern = new RegExp(`!\\[${image.name}\\]\\(${image.url}\\)`, 'g')
    const newMarkdown = content.replace(markdownPattern, '')
    markdownContent.value = newMarkdown
    emit('update:modelValue', newMarkdown)
    emit('contentChange', newMarkdown, getImagesFromContent(newMarkdown))
  } else {
    const imgPattern = new RegExp(`<img[^>]*src="${image.url}[^>]*>`, 'g')
    const newContent = content.replace(imgPattern, '')
    if (editorContent.value) {
      editorContent.value.innerHTML = newContent
    }
    emit('update:modelValue', newContent)
    emit('contentChange', newContent, getImagesFromContent(newContent))
  }
  
  uploadedImages.value.splice(index, 1)
}

// 粘贴处理
const onPaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item && item.type.indexOf('image') !== -1) {
      event.preventDefault()
      const file = item.getAsFile()
      if (file) {
        await uploadImage(file)
      }
    }
  }
}

// 添加链接
const insertLink = () => {
  const url = prompt('请输入链接地址:', 'https://')
  const text = prompt('请输入链接文本:', '链接')
  
  if (url && text) {
    if (mode.value === 'markdown') {
      const markdown = `[${text}](${url})`
      insertIntoTextarea(markdown, '', '')
    } else {
      const linkHtml = `<a href="${url}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${text}</a>`
      insertIntoContentEditable(linkHtml, '', '')
    }
  }
}

// 清空内容
const clearContent = () => {
  if (confirm('确定要清空所有内容吗？')) {
    if (mode.value === 'markdown') {
      markdownContent.value = ''
      emit('update:modelValue', '')
      emit('contentChange', '', [])
    } else if (editorContent.value) {
      editorContent.value.innerHTML = ''
      emit('update:modelValue', '')
      emit('contentChange', '', [])
    }
    uploadedImages.value = []
  }
}

// 键盘快捷键
const onKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    insertText('**', '**', '加粗文字')
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault()
    insertText('*', '*', '斜体文字')
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    insertLink()
  }
}

// 初始化
onMounted(() => {
  if (props.modelValue) {
    if (props.modelValue.includes('<') && props.modelValue.includes('>')) {
      // HTML 内容
      mode.value = 'edit'
      if (editorContent.value) {
        editorContent.value.innerHTML = props.modelValue
      }
    } else {
      // Markdown 内容
      mode.value = 'markdown'
      markdownContent.value = props.modelValue
    }
  }
})

// 监听 value 变化
watch(() => props.modelValue, (newValue) => {
  if (mode.value === 'markdown') {
    markdownContent.value = newValue
  } else if (editorContent.value) {
    editorContent.value.innerHTML = newValue
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: white;
}

.editor-toolbar {
  margin-bottom: 1rem;
}

.toolbar-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.toolbar-button {
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  background-color: white;
  cursor: pointer;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.toolbar-button:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.toolbar-divider {
  width: 1px;
  height: 1.5rem;
  background-color: #e5e7eb;
  margin: 0 0.25rem;
}

.upload-label {
  cursor: pointer;
}

.hidden-file-input {
  display: none;
}

.editor-wrapper {
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
}

.markdown-editor {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.markdown-editor:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.preview-content {
  min-height: 300px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  overflow: auto;
}

.editor-content {
  min-height: 300px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  outline: none;
  background-color: white;
  overflow: auto;
}

.editor-content:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}

.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.mode-buttons {
  display: flex;
  gap: 0.5rem;
}

.mode-button {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-button-active {
  background-color: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.mode-button-inactive {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.mode-button-inactive:hover {
  background-color: #e5e7eb;
}

.word-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.upload-progress {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-container {
  flex: 1;
  background-color: #e5e7eb;
  border-radius: 9999px;
  height: 0.5rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 2.5rem;
}

.uploaded-images {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.images-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

.image-item {
  position: relative;
  border-radius: 0.25rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-thumbnail {
  width: 100%;
  height: 5rem;
  object-fit: cover;
  display: block;
}

.remove-image-button {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background-color: #ef4444;
  color: white;
  border-radius: 9999px;
  width: 1.25rem;
  height: 1.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  border: none;
}

.image-item:hover .remove-image-button {
  opacity: 1;
}

.remove-image-button:hover {
  background-color: #dc2626;
}

.readonly-mode .editor-toolbar,
.readonly-mode .editor-footer {
  display: none;
}

.readonly-mode .editor-content {
  background-color: #f9fafb;
  border-color: #d1d5db;
}
</style>