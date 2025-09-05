"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Folder, FolderOpen } from "lucide-react"
import { useCategoryStore } from "@/lib/stores/category-store"
import { Category } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

const defaultColors = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
]

export default function CategoriesPage() {
  const { categories, initializeStore, addCategory, updateCategory, deleteCategory, getRootCategories, getSubCategories } = useCategoryStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: defaultColors[0],
    parentId: undefined as number | undefined
  })

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) return

    const newCategory: Category = {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      parentId: formData.parentId,
      createdAt: new Date()
    }

    await addCategory(newCategory)
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) return

    const updatedCategory: Category = {
      ...editingCategory,
      name: formData.name,
      description: formData.description,
      color: formData.color,
      parentId: formData.parentId
    }

    await updateCategory(updatedCategory)
    setIsEditDialogOpen(false)
    setEditingCategory(null)
    resetForm()
  }

  const handleDeleteCategory = async (category: Category) => {
    if (category.id) {
      await deleteCategory(category.id)
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
      parentId: category.parentId
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: defaultColors[0],
      parentId: undefined
    })
  }

  const rootCategories = getRootCategories()

  const CategoryItem = ({ category, level = 0 }: { category: Category; level?: number }) => {
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
                  onClick={() => openEditDialog(category)}
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
                      <AlertDialogAction onClick={() => handleDeleteCategory(category)}>
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
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">分类管理</h1>
          <p className="text-muted-foreground mt-2">
            管理知识碎片的分类，支持层级结构
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              新建分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新分类</DialogTitle>
              <DialogDescription>
                创建一个新的分类来组织你的知识碎片
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入分类名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述（可选）</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入分类描述"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent">父分类（可选）</Label>
                <Select 
                  value={formData.parentId?.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, parentId: value ? parseInt(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">无父分类</SelectItem>
                    {rootCategories.map((category) => (
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
              <div className="space-y-2">
                <Label>颜色</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateCategory} disabled={!formData.name.trim()}>
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rootCategories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无分类</h3>
              <p className="text-muted-foreground mb-4">
                创建你的第一个分类来开始组织知识碎片
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建分类
              </Button>
            </CardContent>
          </Card>
        ) : (
          rootCategories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))
        )}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
            <DialogDescription>
              修改分类信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">分类名称</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入分类名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">描述（可选）</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="输入分类描述"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">父分类（可选）</Label>
              <Select 
                value={formData.parentId?.toString()} 
                onValueChange={(value) => setFormData({ ...formData, parentId: value ? parseInt(value) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择父分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">无父分类</SelectItem>
                  {rootCategories
                    .filter(cat => cat.id !== editingCategory?.id) // 防止选择自己作为父分类
                    .map((category) => (
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
            <div className="space-y-2">
              <Label>颜色</Label>
              <div className="flex flex-wrap gap-2">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditCategory} disabled={!formData.name.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}