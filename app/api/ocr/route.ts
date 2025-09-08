import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '@/package/file-storage';
import { OCRResponse } from '@/lib/types';
import { ocrService } from '@/package/ocr';

export async function POST(request: NextRequest): Promise<NextResponse<OCRResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileId = formData.get('fileId') as string;
    const language = formData.get('language') as string || 'chi_sim+eng';

    let imageData: Buffer;
    let fileName: string;
    let fileSize: number;
    let fileType: string;

    if (fileId) {
      // 从文件存储服务获取文件
      try {
        const { file, data } = await fileStorageService.getFile(fileId);
        
        if (!file || !data) {
          return NextResponse.json({
            success: false,
            error: '文件不存在'
          }, { status: 404 });
        }

        if (!file.mimetype.startsWith('image/')) {
          return NextResponse.json({
            success: false,
            error: '只支持图片文件的OCR识别'
          }, { status: 400 });
        }

        imageData = data;
        fileName = file.originalName;
        fileSize = file.size;
        fileType = file.mimetype;

      } catch (error) {
        return NextResponse.json({
          success: false,
          error: '文件不存在或无法访问'
        }, { status: 404 });
      }
    } else if (file) {
      // 直接处理上传的文件
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({
          success: false,
          error: '只支持图片文件的OCR识别'
        }, { status: 400 });
      }

      // 验证文件大小 (最大10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          success: false,
          error: '图片文件过大，请选择小于10MB的图片'
        }, { status: 400 });
      }

      imageData = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type;
    } else {
      return NextResponse.json({
        success: false,
        error: '没有找到要处理的图片文件'
      }, { status: 400 });
    }

    const startTime = Date.now();

    // 使用 OCR 服务进行文字识别
    try {
      // 将 Buffer 转换为 Blob 以供 OCR 服务使用
      const blob = new Blob([imageData], { type: fileType });
      
      const ocrResult = await ocrService.recognize(blob, {
        language: language
      });

      const processingTime = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        data: {
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          language: language,
          boundingBoxes: ocrResult.words.map(word => ({
            text: word.text,
            x: word.bbox.x0,
            y: word.bbox.y0,
            width: word.bbox.x1 - word.bbox.x0,
            height: word.bbox.y1 - word.bbox.y0,
            confidence: word.confidence
          })),
          metadata: {
            processingTime,
            imageWidth: 0,
            imageHeight: 0,
            detectedLanguages: [language],
            ocrEngine: 'tesseract.js',
            version: '6.0.1'
          }
        }
      });

    } catch (ocrError) {
      console.error('OCR 识别失败:', ocrError);
      return NextResponse.json({
        success: false,
        error: 'OCR 识别失败: ' + (ocrError instanceof Error ? ocrError.message : '未知错误')
      }, { status: 500 });
    }

  } catch (error) {
    console.error('OCR API错误:', error);
    return NextResponse.json({
      success: false,
      error: 'OCR服务暂时不可用，请稍后重试'
    }, { status: 500 });
  }
}

// 获取 OCR 统计信息的 API
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({
      success: true,
      data: {
        message: 'OCR 服务运行正常',
        supportedLanguages: [
          { code: 'chi_sim+eng', name: '中英文' },
          { code: 'eng', name: '英文' },
          { code: 'chi_sim', name: '简体中文' },
          { code: 'chi_tra', name: '繁体中文' }
        ],
        version: '6.0.1'
      }
    });
  } catch (error) {
    console.error('OCR 服务状态检查失败:', error);
    return NextResponse.json({
      success: false,
      error: 'OCR 服务不可用'
    }, { status: 500 });
  }
}
