import { Schema } from 'mongoose';
import { getMongoModel } from '../mongo';

/**
 * 文件存储模型
 * 使用GridFS存储大文件，小文件直接存储在文档中
 */

// 文件存储接口定义
export interface FileDocument {
  _id?: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  encoding: string;
  uploadedAt: Date;
  uploadedBy?: string; // 用户ID
  metadata: {
    width?: number;
    height?: number;
    duration?: number; // 视频/音频时长
    description?: string;
    tags?: string[];
    [key: string]: any;
  };
  // 小文件直接存储
  data?: Buffer;
  // 大文件使用GridFS
  gridfsId?: string;
  // 文件状态
  status: 'uploading' | 'completed' | 'error' | 'deleted';
  // 错误信息
  error?: string;
}

// OCR结果存储接口
export interface OCRDocument {
  _id?: string;
  fileId: string; // 关联的文件ID
  text: string; // 识别的文本
  confidence: number; // 置信度
  language: string; // 识别语言
  boundingBoxes?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  metadata: {
    processingTime: number;
    imageWidth: number;
    imageHeight: number;
    detectedLanguages: string[];
    ocrEngine: string; // 使用的OCR引擎
    version: string; // OCR引擎版本
  };
  processedAt: Date;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

// 文件存储Schema
const fileSchema = new Schema<FileDocument>({
  filename: { type: String, required: true, index: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true, index: true },
  size: { type: Number, required: true },
  encoding: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now, index: true },
  uploadedBy: { type: String, index: true },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  data: { type: Buffer }, // 小文件直接存储
  gridfsId: { type: String, index: true }, // 大文件GridFS ID
  status: {
    type: String,
    enum: ['uploading', 'completed', 'error', 'deleted'],
    default: 'uploading',
    index: true
  },
  error: { type: String }
});

// OCR结果Schema
const ocrSchema = new Schema<OCRDocument>({
  fileId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  confidence: { type: Number, required: true },
  language: { type: String, required: true },
  boundingBoxes: [{
    text: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    confidence: Number
  }],
  metadata: {
    processingTime: { type: Number, required: true },
    imageWidth: { type: Number, required: true },
    imageHeight: { type: Number, required: true },
    detectedLanguages: [String],
    ocrEngine: { type: String, required: true },
    version: { type: String, required: true }
  },
  processedAt: { type: Date, default: Date.now, index: true },
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing',
    index: true
  },
  error: { type: String }
});

// 创建索引
fileSchema.index({ filename: 1, uploadedAt: -1 });
fileSchema.index({ mimetype: 1, size: -1 });
fileSchema.index({ status: 1, uploadedAt: -1 });

ocrSchema.index({ fileId: 1, processedAt: -1 });
ocrSchema.index({ status: 1, processedAt: -1 });

// 导出模型
export const FileModel = getMongoModel<FileDocument>('File', fileSchema);
export const OCRModel = getMongoModel<OCRDocument>('OCR', ocrSchema);
