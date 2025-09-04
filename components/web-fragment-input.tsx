"use client";

/**
 * 网页链接知识碎片输入组件
 * 支持通过Jina AI解析网页内容并生成知识碎片
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Globe,
  Sparkles,
  FileText,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useFragmentStore } from "@/lib/stores/fragment-store";
import { ExtractedWebContent } from "@/lib/jina-service";

type ExtractModeType = "full" | "summary" | "custom";
export function WebFragmentInput() {
  const [url, setUrl] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [extractMode, setExtractMode] = useState<ExtractModeType>(
    "summary"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [extractedContent, setExtractedContent] =
    useState<ExtractedWebContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { addFragment } = useFragmentStore();

  // 预设的提取模板
  const promptTemplates = [
    {
      name: "技术要点提取",
      prompt:
        "请提取文章中的关键技术要点、核心概念和实践建议，重点关注可操作的内容。",
    },
    {
      name: "新闻摘要",
      prompt: "请提取新闻的核心事实、关键人物、时间地点和影响分析。",
    },
    {
      name: "学习笔记",
      prompt: "请整理成学习笔记的格式，包括主要概念、重要观点和实例说明。",
    },
    {
      name: "商业洞察",
      prompt: "请提取商业相关的洞察、市场趋势、商业模式和战略要点。",
    },
    {
      name: "工具介绍",
      prompt: "请重点提取工具的功能特性、使用方法、优缺点和适用场景。",
    },
  ];

  // 验证URL格式
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  // 处理网页内容提取
  const handleExtractContent = async () => {
    if (!url.trim()) {
      setError("请输入网页链接");
      return;
    }

    if (!isValidUrl(url)) {
      setError("请输入有效的网页链接");
      return;
    }

    if (extractMode === "custom" && !userPrompt.trim()) {
      setError("自定义模式需要输入提取要求");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setExtractedContent(null);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/jina/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          userPrompt: extractMode === "custom" ? userPrompt.trim() : undefined,
          extractMode,
          language: "zh",
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "网页内容提取失败");
      }

      setExtractedContent(result.data);
    } catch (error) {
      console.error("Extract content error:", error);
      setError(error instanceof Error ? error.message : "提取失败，请稍后重试");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // 保存为知识碎片
  const handleSaveAsFragment = async () => {
    if (!extractedContent) return;

    try {
      const fragmentData = {
        title: extractedContent.title,
        content: extractedContent.extractedContent || extractedContent.content,
        tags: extractedContent.tags,
        category: extractedContent.category,
        priority: extractedContent.priority,
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          wordCount: extractedContent.metadata.wordCount,
          readingTime: extractedContent.metadata.readingTime,
          source: extractedContent.metadata.url,
          extractedAt: extractedContent.metadata.extractedAt,
          userPrompt: extractedContent.metadata.userPrompt,
        },
      };

      await addFragment(fragmentData);

      // 成功提示
      alert(
        `知识碎片保存成功！\n\n标题：${fragmentData.title}\n分类：${
          fragmentData.category
        }\n标签：${fragmentData.tags.join(", ")}`
      );

      // 清空表单
      setUrl("");
      setUserPrompt("");
      setExtractedContent(null);
    } catch (error) {
      console.error("Save fragment error:", error);
      setError("保存知识碎片失败");
    }
  };

  // 复制内容到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加toast提示
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            网页链接解析
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL输入 */}
          <div>
            <label className="text-sm font-medium">网页链接 *</label>
            <div className="mt-1 flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, "_blank")}
                disabled={!isValidUrl(url)}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 提取模式选择 */}
          <div>
            <label className="text-sm font-medium">提取模式</label>
            <Select
              value={extractMode}
              onValueChange={(value: ExtractModeType) => setExtractMode(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">完整内容</SelectItem>
                <SelectItem value="summary">智能摘要</SelectItem>
                <SelectItem value="custom">自定义提取</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 自定义提取要求 */}
          {extractMode === "custom" && (
            <div>
              <label className="text-sm font-medium">提取要求 *</label>
              <div className="mt-1 space-y-2">
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="请描述您希望从网页中提取什么样的内容..."
                  className="min-h-[100px]"
                />

                {/* 预设模板 */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">
                    快速模板：
                  </span>
                  {promptTemplates.map((template) => (
                    <Button
                      key={template.name}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setUserPrompt(template.prompt)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleExtractContent}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始解析
                </>
              )}
            </Button>
          </div>

          {/* 进度条 */}
          {isLoading && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                正在解析网页内容... {progress}%
              </p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 提取结果展示 */}
      {extractedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                提取结果
              </span>
              <Button onClick={handleSaveAsFragment}>
                <FileText className="w-4 h-4 mr-2" />
                保存为碎片
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">内容</TabsTrigger>
                <TabsTrigger value="metadata">元信息</TabsTrigger>
                <TabsTrigger value="tags">标签分类</TabsTrigger>
                <TabsTrigger value="raw">原始内容</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">标题</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(extractedContent.title)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-lg font-semibold">
                    {extractedContent.title}
                  </p>
                </div>

                {extractedContent.summary && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">摘要</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(extractedContent.summary!)
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground">
                      {extractedContent.summary}
                    </p>
                  </div>
                )}

                {extractedContent.extractedContent && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">提取内容</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(extractedContent.extractedContent!)
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                        {extractedContent.extractedContent}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">来源URL:</span>
                    <p className="text-muted-foreground break-all">
                      {extractedContent.metadata.url}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">字数:</span>
                    <p className="text-muted-foreground">
                      {extractedContent.metadata.wordCount}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">阅读时长:</span>
                    <p className="text-muted-foreground">
                      {extractedContent.metadata.readingTime} 分钟
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">提取时间:</span>
                    <p className="text-muted-foreground">
                      {new Date(
                        extractedContent.metadata.extractedAt
                      ).toLocaleString()}
                    </p>
                  </div>
                  {extractedContent.metadata.userPrompt && (
                    <div className="col-span-2">
                      <span className="font-medium">用户要求:</span>
                      <p className="text-muted-foreground">
                        {extractedContent.metadata.userPrompt}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tags" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">分类</h3>
                  <Badge variant="secondary">{extractedContent.category}</Badge>
                </div>

                <div>
                  <h3 className="font-medium mb-2">优先级</h3>
                  <Badge
                    variant={
                      extractedContent.priority === "high"
                        ? "destructive"
                        : extractedContent.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {extractedContent.priority === "high"
                      ? "高"
                      : extractedContent.priority === "medium"
                      ? "中"
                      : "低"}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-medium mb-2">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedContent.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">原始网页内容</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(extractedContent.content)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-xs">
                      {extractedContent.content}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
