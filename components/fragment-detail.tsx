"use client"

import { useState } from "react"
import { Fragment } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Edit, Save, X, ExternalLink, Clock, FileText, Calendar } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface FragmentDetailProps {
  fragment: Fragment
  isOpen: boolean
  onClose: () => void
  onSave?: (fragment: Fragment) => void
  readOnly?: boolean
}

const priorityOptions = [
  { value: "low", label: "低优先级" },
  { value: "medium", label: "中优先级" },
  { value: "high", label: "高优先级" }
]

const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "active", label: "活跃" },
  { value: "archived", label: "已归档" }
]

export function FragmentDetail({ fragment, isOpen, onClose, onSave, readOnly = false }: FragmentDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedFragment, setEditedFragment] = useState<Fragment>(fragment)
  const [tagInput, setTagInput] = useState("")

  const handleSave = () => {
    if (onSave) {
      const updatedFragment = {
        ...editedFragment,
        updatedAt: new Date(),
        metadata: {
          ...editedFragment.metadata,
          wordCount: editedFragment.content.length,
          readingTime: Math.ceil(editedFragment.content.length / 200) // 假设每分钟200字
        }
      }
      onSave(updatedFragment)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedFragment(fragment)
    setIsEditing(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !editedFragment.tags.includes(tagInput.trim())) {
      setEditedFragment(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditedFragment(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {isEditing ? "编辑碎片" : "碎片详情"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <>
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        取消
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <DialogDescription>
            {isEditing ? "修改碎片信息" : "查看碎片详细内容"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={editedFragment.title}
                  onChange={(e) => setEditedFragment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入碎片标题"
                />
              ) : (
                <div className="text-lg font-semibold break-words">{fragment.title}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              {isEditing ? (
                <Textarea
                  id="content"
                  value={editedFragment.content}
                  onChange={(e) => setEditedFragment(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="输入碎片内容"
                  className="min-h-[200px] resize-none"
                />
              ) : (
                <div className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-md whitespace-pre-wrap">
                  {fragment.content}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 分类和状态 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              {isEditing ? (
                <Input
                  id="category"
                  value={editedFragment.category || ""}
                  onChange={(e) => setEditedFragment(prev => ({ ...prev, category: e.target.value || undefined }))}
                  placeholder="输入分类名称"
                />
              ) : (
                <div>
                  {fragment.category ? (
                    <Badge variant="outline">{fragment.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground">未分类</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">优先级</Label>
              {isEditing ? (
                <Select
                  value={editedFragment.priority}
                  onValueChange={(value) => setEditedFragment(prev => ({ ...prev, priority: value as Fragment['priority'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <Badge className={`
                    ${fragment.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                    ${fragment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${fragment.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {priorityOptions.find(opt => opt.value === fragment.priority)?.label}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              {isEditing ? (
                <Select
                  value={editedFragment.status}
                  onValueChange={(value) => setEditedFragment(prev => ({ ...prev, status: value as Fragment['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div>
                  <Badge className={`
                    ${fragment.status === 'active' ? 'bg-blue-100 text-blue-800' : ''}
                    ${fragment.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                    ${fragment.status === 'archived' ? 'bg-purple-100 text-purple-800' : ''}
                  `}>
                    {statusOptions.find(opt => opt.value === fragment.status)?.label}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* 标签管理 */}
          <div className="space-y-2">
            <Label>标签</Label>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入标签名称"
                    className="flex-1"
                  />
                  <Button onClick={addTag} disabled={!tagInput.trim()}>
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {editedFragment.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {fragment.tags.length > 0 ? (
                  fragment.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">无标签</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* 元数据信息 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">元数据信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">字数:</span>
                <span>{fragment.metadata?.wordCount || fragment.content.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">阅读时长:</span>
                <span>{fragment.metadata?.readingTime || Math.ceil(fragment.content.length / 200)} 分钟</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">创建时间:</span>
                <span>{format(new Date(fragment.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">更新时间:</span>
                <span>{formatDistanceToNow(new Date(fragment.updatedAt), { addSuffix: true, locale: zhCN })}</span>
              </div>
            </div>

            {/* 来源链接 */}
            {fragment.metadata?.source && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">来源:</span>
                <a 
                  href={fragment.metadata.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {fragment.metadata.source}
                </a>
              </div>
            )}

            {/* 附件 */}
            {fragment.metadata?.attachments && fragment.metadata.attachments.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">附件:</span>
                <div className="space-y-1">
                  {fragment.metadata.attachments.map((attachment, index) => (
                    <a 
                      key={index}
                      href={attachment} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      附件 {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}