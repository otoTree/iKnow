/**
 * Jina AI 网页内容提取 API 路由
 */

import { NextRequest, NextResponse } from 'next/server'
import { jinaService } from '../../../../lib/jina-service'
import { WebContentExtractRequest } from '../../../../lib/jina-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, userPrompt, extractMode = 'full', language = 'zh' } = body

    // 验证必需参数
    if (!url) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: url' },
        { status: 400 }
      )
    }

    // 验证URL格式
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: '无效的URL格式' },
        { status: 400 }
      )
    }

    // 构建请求参数
    const extractRequest: WebContentExtractRequest = {
      url,
      userPrompt,
      extractMode,
      language
    }

    // 调用Jina服务提取内容
    const result = await jinaService.extractWebContent(extractRequest)

    if (!result) {
      return NextResponse.json(
        { success: false, error: '网页内容提取失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Jina extract API error:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'test') {
      // 测试Jina服务连接
      const testUrl = 'https://example.com'
      const testResult = await jinaService.parseWebPage(testUrl)
      
      return NextResponse.json({
        success: true,
        data: {
          service: 'Jina AI',
          status: testResult.success ? 'connected' : 'error',
          error: testResult.error
        }
      })
    }

    if (action === 'config') {
      // 返回服务配置信息
      return NextResponse.json({
        success: true,
        data: {
          readerApiEnabled: true,
          deepSearchEnabled: !!process.env.JINA_API_KEY,
          supportedModes: ['full', 'summary', 'custom'],
          maxContentLength: 8000,
          rateLimits: {
            reader: '20 requests/minute (free), 500 requests/minute (paid)',
            deepSearch: '50 requests/minute'
          }
        }
      })
    }

    return NextResponse.json(
      { success: false, error: '无效的操作' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Jina config API error:', error)
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
      { status: 500 }
    )
  }
}
