"use client"

import { Fragment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useCategoryStore } from "@/lib/stores/category-store"

interface FragmentCardProps {
  fragment: Fragment
  onEdit?: (fragment: Fragment) => void
  onDelete?: (fragment: Fragment) => void
  onView?: (fragment: Fragment) => void
}

const priorityColors = {
  low: "bg-green-100 text-green-800 hover:bg-green-200",
  medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  high: "bg-red-100 text-red-800 hover:bg-red-200"
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  active: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  archived: "bg-purple-100 text-purple-800 hover:bg-purple-200"
}

const priorityLabels = {
  low: "低优先级",
  medium: "中优先级",
  high: "高优先级"
}

const statusLabels = {
  draft: "草稿",
  active: "活跃",
  archived: "已归档"
}

export function FragmentCard({ fragment, onEdit, onDelete, onView }: FragmentCardProps) {
  const { getCategoryById } = useCategoryStore()
  const category = fragment.categoryId ? getCategoryById(fragment.categoryId) : null
  
  const truncatedContent = fragment.content.length > 150 
    ? fragment.content.substring(0, 150) + "..."
    : fragment.content

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {fragment.title}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2 text-sm">
              <span>
                {formatDistanceToNow(new Date(fragment.updatedAt), {
                  addSuffix: true,
                  locale: zhCN
                })}
              </span>
              {fragment.metadata?.wordCount && (
                <span>• {fragment.metadata.wordCount} 字</span>
              )}
              {fragment.metadata?.readingTime && (
                <span>• {fragment.metadata.readingTime} 分钟阅读</span>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(fragment)}>
                  <Eye className="mr-2 h-4 w-4" />
                  查看详情
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(fragment)}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(fragment)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 内容预览 */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncatedContent}
          </p>
          
          {/* 标签 */}
          {fragment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {fragment.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* 分类 */}
          {(category || fragment.category) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">分类:</span>
              {category ? (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {fragment.category}
                </Badge>
              )}
            </div>
          )}
          
          {/* 状态和优先级 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${priorityColors[fragment.priority]}`}>
                {priorityLabels[fragment.priority]}
              </Badge>
              <Badge className={`text-xs ${statusColors[fragment.status]}`}>
                {statusLabels[fragment.status]}
              </Badge>
            </div>
            
            {/* 来源链接 */}
            {fragment.metadata?.source && (
              <a 
                href={fragment.metadata.source} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                查看来源
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}