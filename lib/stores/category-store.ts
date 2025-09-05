import { create } from 'zustand'
import { Category } from '@/lib/types'
import { categoryDB } from '@/lib/category-db'

// 示例分类数据
const sampleCategories: Category[] = [
  {
    id: 1,
    name: "技术笔记",
    description: "编程、开发相关的技术知识和经验",
    color: "#3B82F6",
    createdAt: new Date('2024-01-01T00:00:00')
  },
  {
    id: 2,
    name: "工作经验",
    description: "职场、项目管理、团队协作等工作相关内容",
    color: "#10B981",
    createdAt: new Date('2024-01-01T00:00:00')
  },
  {
    id: 3,
    name: "学习笔记",
    description: "学习过程中的知识点和心得体会",
    color: "#F59E0B",
    createdAt: new Date('2024-01-01T00:00:00')
  },
  {
    id: 4,
    name: "生活感悟",
    description: "日常生活中的思考和感悟",
    color: "#EF4444",
    createdAt: new Date('2024-01-01T00:00:00')
  },
  {
    id: 5,
    name: "前端开发",
    description: "前端技术栈相关内容",
    color: "#8B5CF6",
    parentId: 1,
    createdAt: new Date('2024-01-01T00:00:00')
  },
  {
    id: 6,
    name: "后端开发",
    description: "后端技术栈相关内容",
    color: "#06B6D4",
    parentId: 1,
    createdAt: new Date('2024-01-01T00:00:00')
  }
]

interface CategoryStore {
  categories: Category[]
  selectedCategory: Category | null
  isInitialized: boolean

  // 初始化和数据管理
  initializeStore: () => Promise<void>
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => Promise<void>
  updateCategory: (category: Category) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  setSelectedCategory: (category: Category | null) => void

  // 查询方法
  getCategoryById: (id: number) => Category | undefined
  getCategoriesByParentId: (parentId?: number) => Category[]
  getRootCategories: () => Category[]
  getSubCategories: (parentId: number) => Category[]
  searchCategories: (query: string) => Category[]
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  selectedCategory: null,
  isInitialized: false,

  initializeStore: async () => {
    try {
      await categoryDB.init()
      const categories = await categoryDB.getAllCategories()
      
      if (categories.length === 0) {
        // 如果没有数据，初始化示例数据
        await categoryDB.setCategories(sampleCategories)
        set({ categories: sampleCategories, isInitialized: true })
      } else {
        set({ categories, isInitialized: true })
      }
    } catch (error) {
      console.error('Failed to initialize category store:', error)
      set({ isInitialized: true })
    }
  },

  setCategories: (categories) => set({ categories }),

  addCategory: async (category) => {
    try {
      const categoryToAdd = {
        ...category,
        createdAt: new Date()
      }
      delete categoryToAdd.id // 让数据库自动生成ID
      
      const newCategory = await categoryDB.addCategory(categoryToAdd)
      set((state) => ({
        categories: [...state.categories, newCategory]
      }))
    } catch (error) {
      console.error('Failed to add category:', error)
      throw error
    }
  },

  updateCategory: async (updatedCategory) => {
    try {
      await categoryDB.updateCategory(updatedCategory)
      set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      }))
    } catch (error) {
      console.error('Failed to update category:', error)
      throw error
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryDB.deleteCategory(id)
      set((state) => ({
        categories: state.categories.filter(cat => cat.id !== id),
        selectedCategory: state.selectedCategory?.id === id ? null : state.selectedCategory
      }))
    } catch (error) {
      console.error('Failed to delete category:', error)
      throw error
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  getCategoryById: (id) => {
    return get().categories.find(cat => cat.id === id)
  },

  getCategoriesByParentId: (parentId) => {
    return get().categories.filter(cat => cat.parentId === parentId)
  },

  getRootCategories: () => {
    return get().categories.filter(cat => !cat.parentId)
  },

  getSubCategories: (parentId) => {
    return get().categories.filter(cat => cat.parentId === parentId)
  },

  searchCategories: (query) => {
    const { categories } = get()
    const lowerQuery = query.toLowerCase()
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.description?.toLowerCase().includes(lowerQuery)
    )
  }
}))