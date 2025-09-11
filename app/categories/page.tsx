"use client"

import { useState, useEffect } from "react"
import { useCategoryStore } from "@/lib/stores/category-store"
import { Category } from "@/lib/types"
import { CategoryItem } from "@/components/categories/category-item"
import { CategoryDialog, CreateCategoryButton } from "@/components/categories/category-dialog"
import { CategoryFormData, defaultColors } from "@/components/categories/category-form"
import { EmptyState } from "@/components/categories/empty-state"

export default function CategoriesPage() {
  const { categories, initializeStore, addCategory, updateCategory, deleteCategory, getRootCategories } = useCategoryStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: defaultColors[0],
    parentId: undefined
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">分类管理</h1>
          <p className="text-muted-foreground mt-2">
            管理知识碎片的分类，支持层级结构
          </p>
        </div>
        <CategoryDialog
          mode="create"
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleCreateCategory}
          onCancel={resetForm}
          rootCategories={rootCategories}
          triggerButton={<CreateCategoryButton onClick={resetForm} />}
        />
      </div>

      <div className="grid gap-4">
        {rootCategories.length === 0 ? (
          <EmptyState onCreateCategory={() => setIsCreateDialogOpen(true)} />
        ) : (
          rootCategories.map((category) => (
            <CategoryItem 
              key={category.id} 
              category={category} 
              onEdit={openEditDialog}
              onDelete={handleDeleteCategory}
            />
          ))
        )}
      </div>

      <CategoryDialog
        mode="edit"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleEditCategory}
        onCancel={() => {
          setEditingCategory(null)
          resetForm()
        }}
        rootCategories={rootCategories}
        editingCategory={editingCategory}
      />
    </div>
  )
}