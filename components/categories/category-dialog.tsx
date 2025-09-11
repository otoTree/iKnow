"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { Category } from "@/lib/types"
import { CategoryForm, CategoryFormData } from "./category-form"

interface CategoryDialogProps {
  mode: 'create' | 'edit'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: CategoryFormData
  onFormDataChange: (data: CategoryFormData) => void
  onSubmit: () => void
  onCancel: () => void
  rootCategories: Category[]
  editingCategory?: Category | null
  triggerButton?: React.ReactNode
}

export function CategoryDialog({
  mode,
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  rootCategories,
  editingCategory,
  triggerButton
}: CategoryDialogProps) {
  const isCreateMode = mode === 'create'
  const title = isCreateMode ? '创建新分类' : '编辑分类'
  const description = isCreateMode ? '创建一个新的分类来组织你的知识碎片' : '修改分类信息'
  const submitText = isCreateMode ? '创建' : '保存'

  const handleSubmit = () => {
    onSubmit()
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <CategoryForm
          formData={formData}
          onFormDataChange={onFormDataChange}
          rootCategories={rootCategories}
          editingCategory={editingCategory}
          mode={mode}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            {submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 创建分类按钮组件
export function CreateCategoryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Plus className="w-4 h-4 mr-2" />
      新建分类
    </Button>
  )
}