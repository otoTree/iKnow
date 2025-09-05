import { NextRequest, NextResponse } from 'next/server'
import axios, { AxiosError } from 'axios'
import { da } from 'date-fns/locale';

export interface CreateFragmentRequest {
  text: string;
  datasetId: string;
  parentId?: string | null;
  name: string;
  trainingType: string;
  chunkSettingMode: string;
  qaPrompt: string;
  metadata: Record<string, unknown>;
  tags: Array<string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, tags, name, datasetId } = body

    // 验证必需参数
    if (!text || !name || !datasetId) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: text, name, datasetId' },
        { status: 400 }
      )
    }

    // 从服务端环境变量获取配置
    const apiBaseUrl = process.env.API_BASE_URL
    const authToken = process.env.AUTH_TOKEN
    //console.log(apiBaseUrl)

    if (!apiBaseUrl || !authToken) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误：缺少API_BASE_URL或AUTH_TOKEN' },
        { status: 500 }
      )
    }

    // 构建请求数据
    const requestData: CreateFragmentRequest = {
      text,
      datasetId,
      parentId: null,
      name,
      trainingType: "qa",
      chunkSettingMode: "auto",
      qaPrompt: "",
      metadata: {},
      tags: tags || [],
    }

    //console.log(requestData)

    // 转发请求到外部API
    try {
      //console.log(1)
      //console.log(`${apiBaseUrl}/api/core/dataset/collection/create/text`)
      const response = await axios.post(`${apiBaseUrl}/api/core/dataset/collection/create/text`, requestData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = response.data

      console.log(data)
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
    console.error('Fragment API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    )
  }
}