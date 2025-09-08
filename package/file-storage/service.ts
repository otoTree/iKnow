import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { connectionMongo } from '../mongo';
import { FileModel, OCRModel, type FileDocument, type OCRDocument } from './models';
import { delay } from '../utils/utils';

/**
 * 文件存储服务
 * 支持MongoDB GridFS和直接存储
 */

export interface FileUploadOptions {
  maxSize?: number; // 最大文件大小，默认10MB
  directStorageThreshold?: number; // 直接存储阈值，默认1MB
  allowedMimeTypes?: string[]; // 允许的MIME类型
  metadata?: Record<string, any>; // 额外的元数据
  uploadedBy?: string; // 上传用户ID
}

export interface FileQueryOptions {
  mimetype?: string;
  uploadedBy?: string;
  status?: FileDocument['status'];
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

export class FileStorageService {
  private gridFSBucket: GridFSBucket | null = null;
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly DIRECT_STORAGE_THRESHOLD = 1 * 1024 * 1024; // 1MB

  constructor() {
    this.initGridFS();
  }

  /**
   * 初始化GridFS
   */
  private async initGridFS(): Promise<void> {
    try {
      if (!connectionMongo.connection.readyState) {
        await connectionMongo.connect(process.env.MONGODB_URI!);
      }
      
      this.gridFSBucket = new GridFSBucket(connectionMongo.connection.db, {
        bucketName: 'uploads'
      });
    } catch (error) {
      console.error('GridFS初始化失败:', error);
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    originalName: string,
    mimetype: string,
    options: FileUploadOptions = {}
  ): Promise<FileDocument> {
    const {
      maxSize = this.DEFAULT_MAX_SIZE,
      directStorageThreshold = this.DIRECT_STORAGE_THRESHOLD,
      allowedMimeTypes,
      metadata = {},
      uploadedBy
    } = options;

    // 验证文件大小
    if (file.length > maxSize) {
      throw new Error(`文件大小超过限制 (${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    // 验证MIME类型
    if (allowedMimeTypes && !allowedMimeTypes.includes(mimetype)) {
      throw new Error(`不支持的文件类型: ${mimetype}`);
    }

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(originalName);
    const filename = `${timestamp}_${randomStr}${extension}`;

    // 创建文件文档
    const fileDoc: Partial<FileDocument> = {
      filename,
      originalName,
      mimetype,
      size: file.length,
      encoding: 'buffer',
      uploadedAt: new Date(),
      uploadedBy,
      metadata,
      status: 'uploading'
    };

    try {
      // 小文件直接存储在MongoDB文档中
      if (file.length <= directStorageThreshold) {
        fileDoc.data = Buffer.from(file);
        fileDoc.status = 'completed';
        
        const savedFile = await FileModel.create(fileDoc);
        return savedFile.toObject();
      }

      // 大文件使用GridFS存储
      if (!this.gridFSBucket) {
        await this.initGridFS();
      }

      if (!this.gridFSBucket) {
        throw new Error('GridFS未初始化');
      }

      // 先创建文档记录
      const savedFile = await FileModel.create(fileDoc);

      // 上传到GridFS
      return new Promise((resolve, reject) => {
        const readableStream = new Readable();
        readableStream.push(file);
        readableStream.push(null);

        const uploadStream = this.gridFSBucket!.openUploadStream(filename, {
          metadata: {
            fileDocId: savedFile._id,
            originalName,
            mimetype,
            uploadedBy,
            ...metadata
          }
        });

        uploadStream.on('error', async (error) => {
          // 更新文件状态为错误
          await FileModel.findByIdAndUpdate(savedFile._id, {
            status: 'error',
            error: error.message
          });
          reject(error);
        });

        uploadStream.on('finish', async () => {
          // 更新文件文档
          const updatedFile = await FileModel.findByIdAndUpdate(
            savedFile._id,
            {
              gridfsId: uploadStream.id.toString(),
              status: 'completed'
            },
            { new: true }
          );
          
          if (updatedFile) {
            resolve(updatedFile.toObject());
          } else {
            reject(new Error('文件上传完成但更新记录失败'));
          }
        });

        readableStream.pipe(uploadStream);
      });

    } catch (error) {
      console.error('文件上传失败:', error);
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取文件
   */
  async getFile(fileId: string): Promise<{ file: FileDocument; data?: Buffer }> {
    const file = await FileModel.findById(fileId);
    
    if (!file) {
      throw new Error('文件不存在');
    }

    if (file.status !== 'completed') {
      throw new Error(`文件状态异常: ${file.status}`);
    }

    // 直接存储的文件
    if (file.data) {
      return { file: file.toObject(), data: file.data };
    }

    // GridFS存储的文件
    if (file.gridfsId) {
      if (!this.gridFSBucket) {
        await this.initGridFS();
      }

      if (!this.gridFSBucket) {
        throw new Error('GridFS未初始化');
      }

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = this.gridFSBucket!.openDownloadStream(
          connectionMongo.Types.ObjectId.createFromHexString(file.gridfsId!)
        );

        downloadStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        downloadStream.on('end', () => {
          const data = Buffer.concat(chunks);
          resolve({ file: file.toObject(), data });
        });

        downloadStream.on('error', (error) => {
          reject(new Error(`文件下载失败: ${error.message}`));
        });
      });
    }

    throw new Error('文件数据不存在');
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const file = await FileModel.findById(fileId);
    
    if (!file) {
      return false;
    }

    try {
      // 删除GridFS中的文件
      if (file.gridfsId && this.gridFSBucket) {
        await this.gridFSBucket.delete(
          connectionMongo.Types.ObjectId.createFromHexString(file.gridfsId)
        );
      }

      // 删除OCR结果
      await OCRModel.deleteMany({ fileId });

      // 标记文件为已删除
      await FileModel.findByIdAndUpdate(fileId, { status: 'deleted' });

      return true;
    } catch (error) {
      console.error('文件删除失败:', error);
      return false;
    }
  }

  /**
   * 查询文件列表
   */
  async queryFiles(options: FileQueryOptions = {}): Promise<FileDocument[]> {
    const {
      mimetype,
      uploadedBy,
      status = 'completed',
      limit = 50,
      skip = 0,
      sort = { uploadedAt: -1 }
    } = options;

    const query: any = { status };

    if (mimetype) {
      query.mimetype = new RegExp(mimetype, 'i');
    }

    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    const files = await FileModel
      .find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean();

    return files;
  }

  /**
   * 保存OCR结果
   */
  async saveOCRResult(
    fileId: string,
    text: string,
    confidence: number,
    language: string,
    metadata: OCRDocument['metadata'],
    boundingBoxes?: OCRDocument['boundingBoxes']
  ): Promise<OCRDocument> {
    const ocrDoc: Partial<OCRDocument> = {
      fileId,
      text,
      confidence,
      language,
      boundingBoxes,
      metadata,
      processedAt: new Date(),
      status: 'completed'
    };

    const savedOCR = await OCRModel.create(ocrDoc);
    return savedOCR.toObject();
  }

  /**
   * 获取OCR结果
   */
  async getOCRResult(fileId: string): Promise<OCRDocument | null> {
    const ocrResult = await OCRModel.findOne({ 
      fileId, 
      status: 'completed' 
    }).lean();

    return ocrResult;
  }

  /**
   * 获取文件统计信息
   */
  async getFileStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    recentUploads: number; // 最近24小时
  }> {
    const [totalFiles, totalSizeResult, filesByType, recentUploads] = await Promise.all([
      FileModel.countDocuments({ status: 'completed' }),
      FileModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ]),
      FileModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$mimetype', count: { $sum: 1 } } }
      ]),
      FileModel.countDocuments({
        status: 'completed',
        uploadedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    const totalSize = totalSizeResult[0]?.totalSize || 0;
    const typeStats: Record<string, number> = {};
    
    filesByType.forEach((item: any) => {
      typeStats[item._id] = item.count;
    });

    return {
      totalFiles,
      totalSize,
      filesByType: typeStats,
      recentUploads
    };
  }

  /**
   * 清理过期的未完成上传
   */
  async cleanupExpiredUploads(hoursOld: number = 24): Promise<number> {
    const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    
    const expiredFiles = await FileModel.find({
      status: 'uploading',
      uploadedAt: { $lt: cutoffDate }
    });

    let cleanedCount = 0;
    
    for (const file of expiredFiles) {
      try {
        await this.deleteFile(file._id!.toString());
        cleanedCount++;
      } catch (error) {
        console.error(`清理过期文件失败 ${file._id}:`, error);
      }
    }

    return cleanedCount;
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot >= 0 ? filename.substring(lastDot) : '';
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 创建单例实例
export const fileStorageService = new FileStorageService();
