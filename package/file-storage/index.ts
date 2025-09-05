/**
 * 文件存储包入口
 * 提供MongoDB文件存储和OCR结果管理功能
 */

export * from './models';
export * from './service';

// 便捷导出
export { FileStorageService, fileStorageService } from './service';
export { FileModel, OCRModel } from './models';
export type { FileDocument, OCRDocument } from './models';
