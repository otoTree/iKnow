import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '@/package/file-storage';
import { FileUploadResponse } from '@/lib/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
  'text/plain', 'text/csv', 'text/html',
  'application/pdf'
];

export async function POST(request: NextRequest): Promise<NextResponse<FileUploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadedBy = formData.get('uploadedBy') as string || undefined;
    const description = formData.get('description') as string || undefined;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: '没有找到上传的文件'
      }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `文件大小超过限制(${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)`
      }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `不支持的文件类型: ${file.type}`
      }, { status: 400 });
    }

    // 准备文件数据
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // 准备元数据
    const metadata: Record<string, any> = {};
    if (description) metadata.description = description;
    if (tags) {
      try {
        metadata.tags = JSON.parse(tags);
      } catch {
        metadata.tags = tags.split(',').map((tag: string) => tag.trim());
      }
    }

    // 如果是图片，尝试获取尺寸信息
    if (file.type.startsWith('image/')) {
      // 这里可以添加图片尺寸检测逻辑
      // 为了简化，暂时跳过
    }

    // 上传文件到MongoDB
    const savedFile = await fileStorageService.uploadFile(
      fileBuffer,
      file.name,
      file.type,
      {
        maxSize: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_TYPES,
        metadata,
        uploadedBy
      }
    );

    const response: FileUploadResponse = {
      success: true,
      data: {
        fileId: savedFile._id!,
        fileName: savedFile.originalName,
        fileSize: savedFile.size,
        uploadedAt: savedFile.uploadedAt.toISOString(),
        downloadUrl: `/api/upload/${savedFile._id}` // 下载链接
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '文件上传失败，请稍后重试'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'info';

    if (action === 'list') {
      // 获取文件列表
      const mimetype = searchParams.get('mimetype') || undefined;
      const limit = parseInt(searchParams.get('limit') || '50');
      const skip = parseInt(searchParams.get('skip') || '0');

      const files = await fileStorageService.queryFiles({
        mimetype,
        limit,
        skip,
        sort: { uploadedAt: -1 }
      });

      return NextResponse.json({
        success: true,
        data: {
          files: files.map(file => ({
            fileId: file._id,
            fileName: file.originalName,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: file.uploadedAt,
            metadata: file.metadata
          })),
          count: files.length
        }
      });
    }

    if (action === 'stats') {
      // 获取文件统计信息
      const stats = await fileStorageService.getFileStats();
      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    // 默认获取文件信息
    const fileId = searchParams.get('fileId');
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: '缺少文件ID参数'
      }, { status: 400 });
    }

    try {
      const { file } = await fileStorageService.getFile(fileId);
      return NextResponse.json({
        success: true,
        data: {
          fileId: file._id,
          fileName: file.originalName,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: file.uploadedAt,
          metadata: file.metadata,
          status: file.status
        }
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : '文件不存在'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('文件查询错误:', error);
    return NextResponse.json({
      success: false,
      error: '文件查询失败'
    }, { status: 500 });
  }
}
