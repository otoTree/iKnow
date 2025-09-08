/**
 * 文件上传工具封装
 * 支持单文件和多文件上传，文件预览，拖拽上传等功能
 */

export interface FileUploadOptions {
  maxFileSize?: number; // 最大文件大小(bytes)，默认10MB
  allowedTypes?: string[]; // 允许的文件类型，默认支持常见图片和文本格式
  multiple?: boolean; // 是否支持多文件上传，默认false
  autoUpload?: boolean; // 是否自动上传，默认false
  quality?: number; // 图片压缩质量(0-1)，默认0.8
  maxWidth?: number; // 图片最大宽度，默认1920
  maxHeight?: number; // 图片最大高度，默认1080
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface FilePreview {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string; // 预览URL
  thumbnail?: string; // 缩略图URL
  isImage: boolean;
  isText: boolean;
  lastModified: number;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export class FileUploadService {
  private options: Required<FileUploadOptions>;
  private uploadProgressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();

  constructor(options: FileUploadOptions = {}) {
    this.options = {
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedTypes: options.allowedTypes || [
        // 图片格式
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml',
        // 文本格式
        'text/plain', 'text/csv', 'text/html', 'text/xml',
        // 文档格式
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      multiple: options.multiple || false,
      autoUpload: options.autoUpload || false,
      quality: options.quality || 0.8,
      maxWidth: options.maxWidth || 1920,
      maxHeight: options.maxHeight || 1080
    };
  }

  /**
   * 验证文件是否符合要求
   */
  validateFile(file: File): FileValidationResult {
    const result: FileValidationResult = { isValid: true, warnings: [] };

    // 检查文件大小
    if (file.size > this.options.maxFileSize) {
      result.isValid = false;
      result.error = `文件大小超过限制(${this.formatFileSize(this.options.maxFileSize)})`;
      return result;
    }

    // 检查文件类型
    if (this.options.allowedTypes.length > 0 && !this.options.allowedTypes.includes(file.type)) {
      result.isValid = false;
      result.error = `不支持的文件类型: ${file.type}`;
      return result;
    }

    // 添加警告信息
    if (file.size > 5 * 1024 * 1024) { // 5MB
      result.warnings?.push('文件较大，处理可能需要更多时间');
    }

    return result;
  }

  /**
   * 批量验证文件
   */
  validateFiles(files: File[]): { validFiles: File[]; invalidFiles: Array<{ file: File; error: string }> } {
    const validFiles: File[] = [];
    const invalidFiles: Array<{ file: File; error: string }> = [];

    for (const file of files) {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error || '未知错误' });
      }
    }

    return { validFiles, invalidFiles };
  }

  /**
   * 创建文件预览
   */
  async createFilePreview(file: File): Promise<FilePreview> {
    const id = this.generateFileId();
    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/');

    const preview: FilePreview = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      isImage,
      isText,
      lastModified: file.lastModified
    };

    // 为图片创建预览URL
    if (isImage) {
      try {
        preview.previewUrl = await this.createImagePreview(file);
        preview.thumbnail = await this.createThumbnail(file);
      } catch (error) {
        console.warn('创建图片预览失败:', error);
      }
    }

    return preview;
  }

  /**
   * 批量创建文件预览
   */
  async createFilePreviews(files: File[]): Promise<FilePreview[]> {
    const previews: FilePreview[] = [];
    
    for (const file of files) {
      try {
        const preview = await this.createFilePreview(file);
        previews.push(preview);
      } catch (error) {
        console.error(`创建文件预览失败: ${file.name}`, error);
      }
    }
    
    return previews;
  }

  /**
   * 创建图片预览URL
   */
  private async createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 创建缩略图
   */
  private async createThumbnail(file: File, maxSize: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }

      img.onload = () => {
        // 计算缩略图尺寸
        const { width, height } = this.calculateThumbnailSize(img.width, img.height, maxSize);
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制缩略图
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为数据URL
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 计算缩略图尺寸
   */
  private calculateThumbnailSize(originalWidth: number, originalHeight: number, maxSize: number): { width: number; height: number } {
    if (originalWidth <= maxSize && originalHeight <= maxSize) {
      return { width: originalWidth, height: originalHeight };
    }

    const ratio = Math.min(maxSize / originalWidth, maxSize / originalHeight);
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }

  /**
   * 压缩图片
   */
  async compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }

      img.onload = () => {
        // 计算压缩后的尺寸
        const { width, height } = this.calculateCompressedSize(img.width, img.height);
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          this.options.quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 计算压缩后的图片尺寸
   */
  private calculateCompressedSize(originalWidth: number, originalHeight: number): { width: number; height: number } {
    const maxWidth = this.options.maxWidth;
    const maxHeight = this.options.maxHeight;

    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }

  /**
   * 读取文本文件内容
   */
  async readTextFile(file: File): Promise<string> {
    if (!file.type.startsWith('text/') && file.type !== 'application/json') {
      throw new Error('不支持的文本文件类型');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * 生成文件ID
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 清理预览URL
   */
  cleanupPreviewUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * 批量清理预览URL
   */
  cleanupPreviewUrls(previews: FilePreview[]): void {
    previews.forEach(preview => {
      if (preview.previewUrl) {
        this.cleanupPreviewUrl(preview.previewUrl);
      }
      if (preview.thumbnail) {
        this.cleanupPreviewUrl(preview.thumbnail);
      }
    });
  }

  /**
   * 检查是否支持拖拽上传
   */
  static isDragDropSupported(): boolean {
    const div = document.createElement('div');
    return ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) && 
           'FormData' in window && 'FileReader' in window;
  }

  /**
   * 从拖拽事件中提取文件
   */
  static extractFilesFromDragEvent(event: DragEvent): File[] {
    const files: File[] = [];
    
    if (event.dataTransfer?.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (file) {
          files.push(file);
        }
      }
    }
    
    return files;
  }

  /**
   * 从输入元素中提取文件
   */
  static extractFilesFromInput(input: HTMLInputElement): File[] {
    const files: File[] = [];
    
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file) {
          files.push(file);
        }
      }
    }
    
    return files;
  }
}

// 创建默认实例
export const fileUploadService = new FileUploadService();

// 便捷函数
export const validateFile = (file: File, options?: FileUploadOptions): FileValidationResult => {
  const service = new FileUploadService(options);
  return service.validateFile(file);
};

export const createFilePreview = async (file: File, options?: FileUploadOptions): Promise<FilePreview> => {
  const service = new FileUploadService(options);
  return service.createFilePreview(file);
};

export const readTextFile = async (file: File): Promise<string> => {
  return fileUploadService.readTextFile(file);
};
