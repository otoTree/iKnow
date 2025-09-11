"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category } from "@/lib/types"

const defaultColors = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
]

export interface CategoryFormData {
  name: string
  description: string
  color: string
  parentId: number | undefined
}

interface CategoryFormProps {
  formData: CategoryFormData
  onFormDataChange: (data: CategoryFormData) => void
  rootCategories: Category[]
  editingCategory?: Category | null
  mode: 'create' | 'edit'
}

export function CategoryForm({ 
  formData, 
  onFormDataChange, 
  rootCategories, 
  editingCategory, 
  mode 
}: CategoryFormProps) {
  const updateFormData = (updates: Partial<CategoryFormData>) => {
    onFormDataChange({ ...formData, ...updates })
  }

  const availableRootCategories = mode === 'edit' 
    ? rootCategories.filter(cat => cat.id !== editingCategory?.id)
    : rootCategories

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={mode === 'create' ? 'name' : 'edit-name'}>分类名称</Label>
        <Input
          id={mode === 'create' ? 'name' : 'edit-name'}
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="输入分类名称"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={mode === 'create' ? 'description' : 'edit-description'}>描述（可选）</Label>
        <Textarea
          id={mode === 'create' ? 'description' : 'edit-description'}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="输入分类描述"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={mode === 'create' ? 'parent' : 'edit-parent'}>父分类（可选）</Label>
        <Select 
          value={formData.parentId?.toString()} 
          onValueChange={(value) => updateFormData({ parentId: value ? parseInt(value) : undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择父分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="undefined">无父分类</SelectItem>
            {availableRootCategories.map((category) => (
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
              onClick={() => updateFormData({ color })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { defaultColors }