"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Edit, Trash2, Folder, FolderOpen } from "lucide-react"
import { Category } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useCategoryStore } from "@/lib/stores/category-store"

interface CategoryItemProps {
  category: Category
  level?: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryItem({ category, level = 0, onEdit, onDelete }: CategoryItemProps) {
  const { getSubCategories } = useCategoryStore()
  const subCategories = getSubCategories(category.id!)
  const hasSubCategories = subCategories.length > 0

  return (
    <div className="space-y-2">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {hasSubCategories ? (
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Folder className="w-4 h-4 text-muted-foreground" />
                )}
                <div 
                  className="w-4 h-4 rounded-full border" 
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{category.name}</h3>
                  {level > 0 && (
                    <Badge variant="outline" className="text-xs">
                      子分类
                    </Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  创建于 {formatDistanceToNow(new Date(category.createdAt), {
                    addSuffix: true,
                    locale: zhCN
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(category)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除分类 &quot;{category.name}&quot; 吗？此操作无法撤销。
                      {hasSubCategories && (
                        <span className="block mt-2 text-red-600">
                          注意：此分类包含子分类，删除后子分类也会被删除。
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(category)}>
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 子分类 */}
      {hasSubCategories && (
        <div className="ml-6 space-y-2">
          {subCategories.map((subCategory) => (
            <CategoryItem 
              key={subCategory.id} 
              category={subCategory} 
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}