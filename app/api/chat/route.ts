import { NextRequest, NextResponse } from 'next/server'
import axios, { AxiosError } from 'axios'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  chatId: string;
  stream: boolean;
  detail: boolean;
  responseChatItemId: string;
  variables: Record<string, unknown>;
  messages: ChatMessage[];
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChoiceMessage {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export interface Choice {
  message: ChoiceMessage;
  finish_reason: 'stop' | 'length' | 'content_filter' | string;
  index: number;
}

export interface ApiResponseData {
  id: string;
  model: string;
  usage: Usage;
  choices: Choice[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      token,
      chatId, 
      content, 
      variables = {}, 
      stream = false, 
      detail = false,
      responseChatItemId,
      whitchWorkflow 
    } = body

    const workflowType ={
      'common':process.env.NEXT_PUBLIC_WORKFLOW_CHAT,
      'card':process.env.NEXT_PUBLIC_WORKFLOW_CARD
    }

    // 验证必需参数
    if (!chatId || !content) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: chatId, content' },
        { status: 400 }
      )
    }

    // 从服务端环境变量获取配置
    const apiBaseUrl = process.env.API_BASE_URL
    console.log('api base url',apiBaseUrl)
    const workflowCardToken = token
    console.log(workflowCardToken)
    if (!apiBaseUrl || !workflowCardToken) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误：缺少API_BASE_URL或WORKFLOW_CARD_TOKEN' },
        { status: 500 }
      )
    }

    // 构建消息数组
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content
      }
    ]

    // 构建请求数据
    const requestData: ChatCompletionRequest = {
      chatId,
      stream,
      detail,
      responseChatItemId: responseChatItemId || `response_${Date.now()}`,
      variables,
      messages,
    }

    // 转发请求到外部API
    try {
      const response = await axios.post(`${apiBaseUrl}/api/v1/chat/completions`, requestData, {
        headers: {
          'Authorization': `Bearer ${workflowType[whitchWorkflow as keyof typeof workflowType]}`,
          'Content-Type': 'application/json'
        }
      })

      const data: ApiResponseData = response.data
      return NextResponse.json({ success: true, data })
    } catch (axiosError: unknown) {
      if (axios.isAxiosError(axiosError) && axiosError.response) {
        // 服务器响应了错误状态码
        return NextResponse.json(
          { success: false, error: `外部API错误: ${axiosError.response.status} - ${axiosError.response.data}` },
          { status: axiosError.response.status }
        )
      } else {
        // 网络错误或其他错误
        throw axiosError
      }
     }

  } catch (error) {
    console.error('Chat API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}