import { createWorker, Worker, PSM, OEM } from 'tesseract.js';

/**
 * OCR工具封装
 * 基于Tesseract.js实现图片文字识别
 */

export interface OCROptions {
  language?: string; // 识别语言，默认为'chi_sim+eng'（简体中文+英文）
  psm?: PSM; // 页面分割模式
  oem?: OEM; // OCR引擎模式
  whitelist?: string; // 字符白名单
  blacklist?: string; // 字符黑名单
}

export interface OCRResult {
  text: string; // 识别的文本
  confidence: number; // 置信度 0-100
  words?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  lines?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  paragraphs?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface OCRProgress {
  status: string;
  progress: number; // 0-1
  userJobId: string;
}

export class OCRService {
  private worker: Worker | null = null;
  private isInitialized = false;

  /**
   * 初始化OCR Worker
   */
  async initialize(options: OCROptions = {}): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      const language = options.language || 'chi_sim+eng';
      const oem = options.oem || 1;
      
      // 检查是否在服务端环境
      const isServer = typeof window === 'undefined';
      
      // v6 API: createWorker(language, oem, options)
      this.worker = await createWorker(language, oem, {
        logger: (m: any) => {
          console.log(`OCR进度: ${m.status} - ${Math.round((m.progress || 0) * 100)}%`);
        },
        // 服务端环境配置
        ...(isServer && {
          workerPath: require.resolve('tesseract.js/dist/worker.min.js'),
          corePath: require.resolve('tesseract.js/dist/tesseract-core.wasm.js'),
        })
      });

      // 设置OCR参数
      if (options.psm !== undefined) {
        await this.worker.setParameters({
          tessedit_pageseg_mode: options.psm,
        });
      }

      if (options.whitelist) {
        await this.worker.setParameters({
          tessedit_char_whitelist: options.whitelist,
        });
      }

      if (options.blacklist) {
        await this.worker.setParameters({
          tessedit_char_blacklist: options.blacklist,
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('OCR初始化失败:', error);
      throw new Error('OCR初始化失败');
    }
  }

  /**
   * 识别图片中的文字
   */
  async recognize(
    imageSource: string | File | Blob | HTMLImageElement | HTMLCanvasElement,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    if (!this.isInitialized || !this.worker) {
      await this.initialize(options);
    }

    if (!this.worker) {
      throw new Error('OCR Worker未初始化');
    }

    try {
      const startTime = Date.now();
      // v6 API: 需要指定输出格式
      const result = await this.worker.recognize(imageSource, {}, {
        blocks: true, // 启用详细输出
        text: true
      });
      const processingTime = Date.now() - startTime;

      console.log(`OCR识别完成，耗时: ${processingTime}ms`);

      return {
        text: (result.data.text || '').trim(),
        confidence: result.data.confidence || 0,
        words: result.data.blocks?.[0]?.paragraphs?.[0]?.lines?.[0]?.words?.map((word: any) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        })),
        lines: result.data.blocks?.[0]?.paragraphs?.[0]?.lines?.map((line: any) => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox
        })),
        paragraphs: result.data.blocks?.[0]?.paragraphs?.map((paragraph: any) => ({
          text: paragraph.text,
          confidence: paragraph.confidence,
          bbox: paragraph.bbox
        }))
      };
    } catch (error) {
      console.error('OCR识别失败:', error);
      throw new Error('图片文字识别失败');
    }
  }

  /**
   * 识别多个图片
   */
  async recognizeMultiple(
    imageSources: Array<string | File | Blob | HTMLImageElement | HTMLCanvasElement>,
    options: OCROptions = {}
  ): Promise<OCRResult[]> {
    const results: OCRResult[] = [];
    
    for (const imageSource of imageSources) {
      const result = await this.recognize(imageSource, options);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 获取支持的语言列表
   */
  static getSupportedLanguages(): string[] {
    return [
      'afr', 'amh', 'ara', 'asm', 'aze', 'aze_cyrl', 'bel', 'ben', 'bod', 'bos',
      'bul', 'cat', 'ceb', 'ces', 'chi_sim', 'chi_tra', 'chr', 'cym', 'dan',
      'deu', 'dzo', 'ell', 'eng', 'enm', 'epo', 'est', 'eus', 'fas', 'fin',
      'fra', 'frk', 'frm', 'gle', 'glg', 'grc', 'guj', 'hat', 'heb', 'hin',
      'hrv', 'hun', 'iku', 'ind', 'isl', 'ita', 'ita_old', 'jav', 'jpn', 'kan',
      'kat', 'kat_old', 'kaz', 'khm', 'kir', 'kor', 'kur', 'lao', 'lat', 'lav',
      'lit', 'mal', 'mar', 'mkd', 'mlt', 'mon', 'mri', 'msa', 'mya', 'nep',
      'nld', 'nor', 'ori', 'pan', 'pol', 'por', 'pus', 'ron', 'rus', 'san',
      'sin', 'slk', 'slv', 'spa', 'spa_old', 'sqi', 'srp', 'srp_latn', 'swa',
      'swe', 'syr', 'tam', 'tel', 'tgk', 'tgl', 'tha', 'tir', 'tur', 'uig',
      'ukr', 'urd', 'uzb', 'uzb_cyrl', 'vie', 'yid'
    ];
  }

  /**
   * 销毁Worker释放资源
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}

// 创建单例实例
export const ocrService = new OCRService();

// 便捷函数
export const recognizeText = async (
  imageSource: string | File | Blob | ImageData | HTMLImageElement | HTMLCanvasElement,
  options: OCROptions = {}
): Promise<string> => {
  const result = await ocrService.recognize(imageSource, options);
  return result.text;
};

export const recognizeTextWithDetails = async (
  imageSource: string | File | Blob | ImageData | HTMLImageElement | HTMLCanvasElement,
  options: OCROptions = {}
): Promise<OCRResult> => {
  return await ocrService.recognize(imageSource, options);
};
