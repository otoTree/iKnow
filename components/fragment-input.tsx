"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Globe } from "lucide-react"
// API调用现在通过Next.js API路由处理，不再需要直接导入
import { useFragmentStore } from "@/lib/stores/fragment-store"
import { useCategoryStore } from "@/lib/stores/category-store"
import { WebFragmentInput } from "./web-fragment-input"

export function FragmentInput() {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined)
  const { addFragment } = useFragmentStore()
  const { categories, initializeStore } = useCategoryStore()

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  const handleAddFragment = async () => {
    if (!text.trim()) {
      alert("请输入知识碎片内容")
      return
    }

    setIsLoading(true)
    try {
      const name = `Fragment_${Date.now()}` // 生成默认名称
      const datasetId = process.env.NEXT_PUBLIC_DATASET_ID || '68b1e346220e714542241b8e'
      const chatId = crypto.randomUUID() // 生成随机UUID作为聊天ID
      const token = process.env.NEXT_PUBLIC_WORKFLOW_CARD
      
      // 1. 先调用chat API获取响应数据（通过Next.js API路由）
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId,
          token,
          content: text,
          workflow: "card"
        })
      })
      
      const chatResult = await chatResponse.json()
      
      let tags: Array<string> = [] // 默认空标签数组
      let fragmentData = {
          title: "未知标题",
          content: text,
          tags: [],
          category: "未分类",
          categoryId: selectedCategoryId,
          priority: "medium" as "medium" | "low" | "high",
          status: "active" as "active" | "draft" | "archived",
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            wordCount: text.length,
            readingTime: Math.ceil(text.length / 200)
          }
        }
      
      if (chatResult.success && chatResult.data?.choices?.[0]?.message?.content) {
        const aiResponseString = chatResult.data.choices[0].message.content
        
        try {
          // 尝试解析JSON格式的AI响应
          const aiResponse = JSON.parse(aiResponseString)
          
          // 从AI响应中提取tags
          tags = aiResponse.tags || []
          
          // 根据示例JSON结构组织数据
          fragmentData = {
            title: aiResponse.title || "未知标题",
            content: text, // 添加原始内容
            tags: aiResponse.tags || [],
            category: aiResponse.category || "未分类",
            categoryId: selectedCategoryId,
            priority: aiResponse.priority || "medium",
            status: aiResponse.status || "active",
            createdAt: new Date(aiResponse.createdAt || new Date().toISOString()),
            updatedAt: new Date(aiResponse.updatedAt || new Date().toISOString()),
            metadata: {
              wordCount: aiResponse.metadata?.wordCount || text.length,
              readingTime: aiResponse.metadata?.readingTime || Math.ceil(text.length / 200),
              ...aiResponse.metadata
            }
          }
        } catch (parseError) {
          // 如果解析失败，使用默认值
          console.warn('AI响应不是有效的JSON格式，使用默认值:', parseError)
        }
      }
      
      // 2. 调用知识库API添加内容（通过Next.js API路由），使用从AI获取的tags
      const fragmentResponse = await fetch('/api/fragment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          tags, // 使用从AI获取的tags
          name,
          datasetId
        })
      })
      
      const fragmentResult = await fragmentResponse.json()
      
      if (!fragmentResult.success) {
        alert(`知识碎片添加失败: ${fragmentResult.error}`)
        return
      }
      
      // 将数据添加到zustand store中（异步持久化）
      await addFragment(fragmentData)
      
      if (chatResult.success && chatResult.data?.choices?.[0]?.message?.content) {
        alert(`知识碎片添加成功！\n\n标题：${fragmentData.title}\n分类：${fragmentData.category}\n标签：${fragmentData.tags.join(', ')}\n优先级：${fragmentData.priority}`)
      } else {
        alert("知识碎片添加成功！但AI分析失败，请稍后重试")
      }
      
      setText("") // 清空输入框
    } catch (error) {
      alert("操作失败，请稍后重试")
      console.error("Error in handleAddFragment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            文本输入
          </TabsTrigger>
          <TabsTrigger value="web" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            网页解析
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>手动输入知识碎片</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-select">选择分类</Label>
                  <Select value={selectedCategoryId?.toString()} onValueChange={(value) => setSelectedCategoryId(value ? parseInt(value) : undefined)}>
                    <SelectTrigger id="category-select">
                      <SelectValue placeholder="选择一个分类（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undefined">无分类</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id!.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入新的知识碎片..."
                    className="flex-1 min-h-[160px] resize-none"
                  />
                  <Button 
                    onClick={handleAddFragment}
                    disabled={isLoading}
                    className="h-40 px-6"
                  >
                    {isLoading ? "添加中..." : "添加"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="web" className="mt-6">
          <WebFragmentInput />
        </TabsContent>
      </Tabs>
    </div>
  )
}