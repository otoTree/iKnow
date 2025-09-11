import { ChatMessage, ChatContextFragment } from './ai-chat-types'

export interface AIResponse {
  content: string
  error?: string
}

export class AIChatService {
  private apiEndpoint: string
  private apiKey?: string

  constructor(apiEndpoint: string = '/api/chat', apiKey?: string) {
    this.apiEndpoint = apiEndpoint
    this.apiKey = apiKey
  }

  /**
   * 发送消息到AI并获取响应
   */
  async sendMessage(
    message: string,
    context: ChatContextFragment[],
    chatId: string = `chat_${Date.now()}`
  ): Promise<AIResponse> {
    try {
      const token = process.env.NEXT_PUBLIC_KNOW_CHAT
      // 构建基于tags的上下文提示
      const contextPrompt = this.buildContextPrompt(context)
      
      // 提取所有碎片的tags
      const allTags = context.flatMap(contextFragment => contextFragment.fragment.tags)
      const uniqueTags = [...new Set(allTags)] // 去重
      
      // 组合完整的消息内容 - 使用模板字符串优化拼接
      const fullContent =  message

      console.log('chat know',token)
      console.log('tags',uniqueTags)
      console.log('message',message)
      const payload = {
        token,
        chatId,
        content: fullContent,
        stream: false,
        detail: false,
        responseChatItemId: `response_${Date.now()}`,
        variables: { tags: uniqueTags }, // 存储传入的碎片知识的tags
        whichWorkflow: 'common'
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // 处理API响应格式
      if (result.success && result.data && result.data.choices && result.data.choices.length > 0) {
        return {
          content: result.data.choices[0].message.content || '抱歉，我无法理解您的问题。'
        }
      } else if (result.error) {
        return {
          content: '抱歉，服务暂时不可用，请稍后再试。',
          error: result.error
        }
      } else {
        return {
          content: result.content || result.message || '抱歉，我无法理解您的问题。'
        }
      }
    } catch (error) {
      console.error('AI Chat Service Error:', error)
      return {
        content: '抱歉，服务暂时不可用，请稍后再试。',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 构建基于tags的上下文提示
   */
  private buildContextPrompt(context: ChatContextFragment[]): string {
    if (context.length === 0) {
      return ''
    }

    // 按tags分组整理上下文信息
    const tagGroups = new Map<string, ChatContextFragment[]>()
    context.forEach(contextFragment => {
      contextFragment.fragment.tags.forEach(tag => {
        if (!tagGroups.has(tag)) {
          tagGroups.set(tag, [])
        }
        tagGroups.get(tag)!.push(contextFragment)
      })
    })

    let contextText = ''
    
    // 如果有标签分组，按标签组织信息
    if (tagGroups.size > 0) {
      const tagSections = Array.from(tagGroups.entries()).map(([tag, fragments]) => {
        const fragmentsText = fragments.map(contextFragment => 
          `• ${contextFragment.fragment.title}: ${contextFragment.fragment.content}`
        ).join('\n')
        return `【${tag}】\n${fragmentsText}`
      }).join('\n\n')
      
      contextText = `相关知识片段（按标签分类）：\n\n${tagSections}`
    } else {
      // 如果没有标签，使用原有格式
      contextText = context.map(contextFragment => 
        `标题: ${contextFragment.fragment.title}\n内容: ${contextFragment.fragment.content}\n优先级: ${contextFragment.fragment.priority}`
      ).join('\n\n---\n\n')
    }

    return `${contextText}\n\n---\n\n请基于以上知识片段回答用户问题：\n\n`
  }

  /**
   * 格式化历史消息
   */
  private formatHistory(history: ChatMessage[]): string {
    return history.map(msg => 
      `${msg.type === 'user' ? '用户' : 'AI'}: ${msg.content}`
    ).join('\n')
  }
}

// 默认实例
export const aiChatService = new AIChatService()

// 模拟AI响应（用于开发测试）
export const mockAIResponse = async (
  message: string,
  context: ChatContextFragment[]
): Promise<AIResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  const contextInfo = context.length > 0 
    ? `\n\n基于您提供的${context.length}个片段信息，` 
    : ''

  const responses = [
    `我理解您的问题："${message}"${contextInfo}这是一个很好的问题。让我为您详细解答...`,
    `关于"${message}"${contextInfo}我可以从以下几个方面来分析：\n1. 首先...\n2. 其次...\n3. 最后...`,
    `您提到的"${message}"${contextInfo}确实是一个重要的话题。根据相关信息，我建议...`,
    `针对"${message}"这个问题${contextInfo}我认为可以这样理解...`
  ]

  return {
    content: responses[Math.floor(Math.random() * responses.length)]
  }
}