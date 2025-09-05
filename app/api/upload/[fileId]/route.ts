import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '@/package/file-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
): Promise<NextResponse> {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: '缺少文件ID'
      }, { status: 400 });
    }

    // 获取文件
    const { file, data } = await fileStorageService.getFile(fileId);
    
    if (!data) {
      return NextResponse.json({
        success: false,
        error: '文件数据不存在'
      }, { status: 404 });
    }

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', file.mimetype);
    headers.set('Content-Length', file.size.toString());
    headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`);
    
    // 缓存控制
    headers.set('Cache-Control', 'public, max-age=31536000'); // 1年缓存
    headers.set('ETag', `"${file._id}"`);
    
    // 检查If-None-Match头（ETag缓存）
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === `"${file._id}"`) {
      return new NextResponse(null, { status: 304, headers });
    }

    return new NextResponse(data, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('文件下载错误:', error);
    
    if (error instanceof Error && error.message.includes('不存在')) {
      return NextResponse.json({
        success: false,
        error: '文件不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: '文件下载失败'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
): Promise<NextResponse> {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: '缺少文件ID'
      }, { status: 400 });
    }

    const success = await fileStorageService.deleteFile(fileId);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '文件删除成功'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '文件不存在或删除失败'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('文件删除错误:', error);
    return NextResponse.json({
      success: false,
      error: '文件删除失败'
    }, { status: 500 });
  }
}
