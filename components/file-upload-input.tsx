"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { useFragmentStore } from "@/lib/stores/fragment-store"
import { cn } from "@/package/utils/utils"

interface UploadedFile {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  fileId?: string
}

interface FileUploadInputProps {
  onOCRResult?: (ocrText: string) => void
}

export function FileUploadInput({ onOCRResult }: FileUploadInputProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addFragment } = useFragmentStore()

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    // 自动开始上传
    newFiles.forEach((fileItem, index) => {
      uploadFile(fileItem, files.length + index)
    })
  }

  const uploadFile = async (fileItem: UploadedFile, index: number) => {
    const formData = new FormData()
    formData.append('file', fileItem.file)

    try {
      // 更新状态为上传中
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        // 上传成功，处理文件内容
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'success', 
            progress: 100, 
            fileId: result.data.fileId 
          } : f
        ))

        // 如果是文本文件，尝试读取内容并创建知识碎片
        if (fileItem.file.type.startsWith('text/') || 
            fileItem.file.name.endsWith('.txt') ||
            fileItem.file.name.endsWith('.md')) {
          
          const reader = new FileReader()
          reader.onload = async (e) => {
            const content = e.target?.result as string
            if (content) {
              await createFragmentFromFile(fileItem.file.name, content, result.data.fileId)
            }
          }
          reader.readAsText(fileItem.file)
        } else if (fileItem.file.type.startsWith('image/')) {
          // 如果是图片文件，进行 OCR 识别
          try {
            const ocrResponse = await fetch('/api/ocr', {
              method: 'POST',
              body: (() => {
                const formData = new FormData()
                formData.append('fileId', result.data.fileId)
                formData.append('language', 'chi_sim+eng')
                return formData
              })()
            })
            
            const ocrResult = await ocrResponse.json()
            
            if (ocrResult.success && ocrResult.data?.text) {
              const ocrText = ocrResult.data.text.trim()
              
              // 如果有 OCR 结果且有回调函数，将文字传递给父组件
              if (ocrText && onOCRResult) {
                onOCRResult(ocrText)
              }
              
              // 创建包含 OCR 文字的知识碎片
              await createFragmentFromFile(
                fileItem.file.name,
                `图片识别文字:\n\n${ocrText}\n\n---\n文件: ${fileItem.file.name}\n类型: ${fileItem.file.type}\n大小: ${formatFileSize(fileItem.file.size)}\n上传时间: ${new Date().toLocaleString()}`,
                result.data.fileId
              )
            } else {
              // OCR 识别失败，创建普通文件引用
              await createFragmentFromFile(
                fileItem.file.name, 
                `文件: ${fileItem.file.name}\n类型: ${fileItem.file.type}\n大小: ${formatFileSize(fileItem.file.size)}\n上传时间: ${new Date().toLocaleString()}\n\n注意: 图片文字识别失败`,
                result.data.fileId
              )
            }
          } catch (ocrError) {
            console.error('OCR 识别失败:', ocrError)
            // OCR 识别出错，创建普通文件引用
            await createFragmentFromFile(
              fileItem.file.name, 
              `文件: ${fileItem.file.name}\n类型: ${fileItem.file.type}\n大小: ${formatFileSize(fileItem.file.size)}\n上传时间: ${new Date().toLocaleString()}\n\n注意: 图片文字识别出错`,
              result.data.fileId
            )
          }
        } else {
          // 非文本和图片文件，创建文件引用类型的知识碎片
          await createFragmentFromFile(
            fileItem.file.name, 
            `文件: ${fileItem.file.name}\n类型: ${fileItem.file.type}\n大小: ${formatFileSize(fileItem.file.size)}\n上传时间: ${new Date().toLocaleString()}`,
            result.data.fileId
          )
        }
      } else {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'error', 
            error: result.error || '上传失败' 
          } : f
        ))
      }
    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error', 
          error: '网络错误，请重试' 
        } : f
      ))
    }
  }

  const createFragmentFromFile = async (fileName: string, content: string, fileId: string) => {
    try {
      const fragmentData = {
        title: fileName,
        content: content,
        tags: ['文件上传'],
        category: '文件',
        priority: 'medium' as const,
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          wordCount: content.length,
          readingTime: Math.ceil(content.length / 200),
          fileId: fileId,
          fileName: fileName
        }
      }

      await addFragment(fragmentData)
    } catch (error) {
      console.error('创建知识碎片失败:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>文件上传</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 拖拽上传区域 */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">拖拽文件到此处或点击选择</p>
          <p className="text-sm text-muted-foreground">
            支持文本文件、图片、PDF等格式，最大10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">上传文件</h4>
            {files.map((fileItem, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.file.size)}
                  </p>
                  
                  {fileItem.status === 'uploading' && (
                    <Progress value={fileItem.progress} className="mt-2 h-1" />
                  )}
                  
                  {fileItem.status === 'error' && fileItem.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {fileItem.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {fileItem.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {fileItem.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {fileItem.status === 'uploading' && (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}