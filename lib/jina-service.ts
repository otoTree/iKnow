/**
 * Jina AI 服务集成
 * 支持网页解析、内容提取和AI增强处理
 */

import { delay } from '../package/utils/utils'

// Jina API 响应类型定义
export interface JinaReaderResponse {
  success: boolean
  data?: {
    title?: string
    content: string
    description?: string
    url: string
    usage?: {
      tokens: number
    }
  }
  error?: string
}

export interface JinaDeepSearchResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  visitedURLs?: string[]
}

export interface WebContentExtractRequest {
  url: string
  userPrompt?: string
  extractMode: 'full' | 'summary' | 'custom'
  language?: string
}

export interface ExtractedWebContent {
  title: string
  content: string
  summary?: string
  extractedContent?: string
  tags: string[]
  category: string
  priority: 'low' | 'medium' | 'high'
  metadata: {
    url: string
    wordCount: number
    readingTime: number
    extractedAt: Date
    userPrompt?: string
  }
}

export class JinaService {
  private readerApiUrl = 'https://r.jina.ai'
  private deepSearchApiUrl = 'https://deepsearch.jina.ai/v1/chat/completions'
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.JINA_API_KEY || ''
    
    // 在服务器端环境中获取API密钥
    if (typeof window === 'undefined' && !this.apiKey) {
      console.warn('JINA_API_KEY not found in environment variables')
    }
  }

  /**
   * 使用Jina Reader API解析网页内容
   */
  async parseWebPage(url: string): Promise<JinaReaderResponse> {
    try {
      console.log('Parsing webpage:', url)
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'iKnow/1.0'
      }

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
        console.log('Using API key for authentication')
      } else {
        console.log('No API key provided, using free tier')
      }

      const requestUrl = `${this.readerApiUrl}/${encodeURIComponent(url)}`
      console.log('Request URL:', requestUrl)

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers,
        timeout: 30000 // 30秒超时
      } as any)

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Jina Reader API error: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const text = await response.text()
      console.log('Response length:', text.length)
      
      // 尝试解析为JSON，如果失败则作为纯文本处理
      let data
      try {
        data = JSON.parse(text)
        console.log('Successfully parsed JSON response')
      } catch (parseError) {
        console.log('Response is not JSON, treating as plain text')
        data = {
          content: text,
          url: url
        }
      }

      const result = {
        success: true,
        data: {
          title: data.title || this.extractTitleFromContent(data.content || text) || '未知标题',
          content: data.content || text,
          description: data.description,
          url: url,
          usage: data.usage
        }
      }

      console.log('Parse result:', {
        success: result.success,
        titleLength: result.data.title.length,
        contentLength: result.data.content.length,
        hasDescription: !!result.data.description
      })

      return result
    } catch (error) {
      console.error('Jina Reader API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '网页解析失败'
      }
    }
  }

  /**
   * 使用DeepSearch API进行智能内容提取
   */
  async extractContentWithAI(
    webContent: string,
    userPrompt: string,
    url: string
  ): Promise<JinaDeepSearchResponse | null> {
    try {
      if (!this.apiKey) {
        throw new Error('需要Jina API密钥才能使用DeepSearch功能')
      }

      const messages = [
        {
          role: 'system',
          content: 
          `你是一个专业的内容提取助手。用户会提供网页内容和特定的提取要求，请根据要求提取并整理内容。
          网页URL: ${url}
          返回结果需要纯文本形式输出，不要用 json 格式。包含以下字段：
            "title": "提取内容的标题",
            "summary": "内容摘要（50-100字）",
            "extractedContent": "根据用户要求提取的具体内容",
            "tags": ["相关标签1", "相关标签2", "相关标签3"],
            "category": "内容分类",
            "priority": "low|medium|high",
            "insights": "从内容中得出的见解或要点"
  `
        },
        {
          role: 'user',
          content: `网页内容：
${webContent.slice(0, 8000)} ${webContent.length > 8000 ? '...(内容已截断)' : ''}

用户提取要求：
${userPrompt}`
        }
      ]

      const response = await fetch(this.deepSearchApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'jina-deepsearch-v1',
          messages,
          stream: false,
          reasoning_effort: 'medium',
          max_returned_urls: 0 // 不需要额外搜索URL
        })
      })

      if (!response.ok) {
        throw new Error(`DeepSearch API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Jina DeepSearch API Error:', error)
      return null
    }
  }

  /**
   * 完整的网页内容提取流程
   */
  async extractWebContent(request: WebContentExtractRequest): Promise<ExtractedWebContent | null> {
    try {
      // 1. 使用Reader API解析网页
      const readerResult = await this.parseWebPage(request.url)
      
      if (!readerResult.success || !readerResult.data) {
        throw new Error(readerResult.error || '网页解析失败')
      }

      const { title, content, url } = readerResult.data

      // 2. 如果有用户prompt，使用DeepSearch AI提取内容
      let extractedData: any = {}
      
      if (request.userPrompt && request.extractMode === 'custom') {
        const aiResult = await this.extractContentWithAI(content, request.userPrompt, url)
        
        if (aiResult?.choices?.[0]?.message?.content) {
          try {
            extractedData = JSON.parse(aiResult.choices[0].message.content)
          } catch (error) {
            console.warn('AI响应解析失败，使用默认处理:', error)
            extractedData = {
              extractedContent: aiResult.choices[0].message.content
            }
          }
        }
      }

      // 3. 构建最终结果
      const wordCount = content.length
      const result: ExtractedWebContent = {
        title: extractedData.title || title,
        content: content,
        summary: extractedData.summary || this.generateSummary(content),
        extractedContent: extractedData.extractedContent,
        tags: extractedData.tags || this.extractDefaultTags(content, title),
        category: extractedData.category || this.inferCategory(title, content),
        priority: extractedData.priority || 'medium',
        metadata: {
          url: url,
          wordCount: wordCount,
          readingTime: Math.ceil(wordCount / 200),
          extractedAt: new Date(),
          userPrompt: request.userPrompt
        }
      }

      return result
    } catch (error) {
      console.error('Web content extraction error:', error)
      return null
    }
  }

  /**
   * 批量处理多个网页链接
   */
  async batchExtractWebContent(
    requests: WebContentExtractRequest[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<(ExtractedWebContent | null)[]> {
    const results: (ExtractedWebContent | null)[] = []
    
    for (let i = 0; i < requests.length; i++) {
      try {
        const result = await this.extractWebContent(requests[i])
        results.push(result)
        
        // 添加延迟避免API限制
        if (i < requests.length - 1) {
          await delay(1000) // 1秒延迟
        }
        
        onProgress?.(i + 1, requests.length)
      } catch (error) {
        console.error(`处理第${i + 1}个链接失败:`, error)
        results.push(null)
      }
    }
    
    return results
  }

  /**
   * 从内容中提取标题（备用方法）
   */
  private extractTitleFromContent(content: string): string | null {
    // 尝试从内容开头提取标题
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length > 0) {
      const firstLine = lines[0].trim()
      if (firstLine.length > 0 && firstLine.length < 100) {
        return firstLine
      }
    }
    return null
  }

  /**
   * 生成内容摘要
   */
  private generateSummary(content: string, maxLength: number = 200): string {
    const cleanContent = content.replace(/\s+/g, ' ').trim()
    if (cleanContent.length <= maxLength) {
      return cleanContent
    }
    return cleanContent.slice(0, maxLength) + '...'
  }

  /**
   * 提取默认标签
   */
  private extractDefaultTags(content: string, title: string): string[] {
    const text = `${title} ${content}`.toLowerCase()
    const commonTags = [
      '技术', '教程', '新闻', '分析', '指南', '工具', '产品', '服务',
      'AI', '机器学习', '编程', '开发', '设计', '商业', '科技', '创新'
    ]
    
    const foundTags = commonTags.filter(tag => 
      text.includes(tag.toLowerCase()) || 
      text.includes(tag)
    )
    
    return foundTags.slice(0, 5) // 最多返回5个标签
  }

  /**
   * 推断内容分类
   */
  private inferCategory(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase()
    
    const categories = {
      '技术文档': ['api', 'documentation', 'tutorial', 'guide', '教程', '文档'],
      '新闻资讯': ['news', 'announcement', 'update', '新闻', '公告', '更新'],
      '学习资料': ['learn', 'course', 'education', 'study', '学习', '课程'],
      '工具介绍': ['tool', 'software', 'app', 'service', '工具', '软件'],
      '商业分析': ['business', 'market', 'analysis', '商业', '市场', '分析']
    }
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category
      }
    }
    
    return '其他'
  }
}

// 默认实例
export const jinaService = new JinaService()
