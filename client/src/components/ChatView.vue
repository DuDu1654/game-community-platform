// 修改 loadMessages 函数
const loadMessages = async () => {
  if (!activeRoomId.value) return
  
  isLoading.value = true
  try {
    console.log(`📥 加载房间消息: ${activeRoomId.value}`)
    const response = await chatService.getRoomMessages(activeRoomId.value, 1, 50)
    
    console.log('📤 加载消息结果:', {
      success: response.success,
      messagesCount: response.data?.messages?.length || 0
    })
    
    if (response.success && response.data) {
      // ✅ 从 response.data.messages 获取消息列表
      messages.value = response.data.messages || []
      console.log(`✅ 加载了 ${messages.value.length} 条消息`)
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    } else {
      console.warn('⚠️ 加载消息失败:', response.error)
      messages.value = []
    }
  } catch (error) {
    console.error('❌ 加载消息失败:', error)
    messages.value = []
  } finally {
    isLoading.value = false
  }
}