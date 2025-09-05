import { Category } from './types'

// IndexedDB 数据库配置
const DB_NAME = 'iknow-categories'
const DB_VERSION = 1
const STORE_NAME = 'categories'

class CategoryDB {
  private db: IDBDatabase | null = null

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open category database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          
          // 创建索引
          store.createIndex('name', 'name', { unique: true })
          store.createIndex('parentId', 'parentId', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  // 获取所有分类
  async getAllCategories(): Promise<Category[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const categories = request.result.map((category: Category & { createdAt: string }) => ({
          ...category,
          createdAt: new Date(category.createdAt)
        }))
        resolve(categories)
      }

      request.onerror = () => {
        reject(new Error('Failed to get categories'))
      }
    })
  }

  // 添加分类
  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const categoryToAdd = {
        ...category,
        createdAt: category.createdAt.toISOString()
      }
      
      const request = store.add(categoryToAdd)

      request.onsuccess = () => {
        const newCategory = {
          ...category,
          id: request.result as number
        }
        resolve(newCategory)
      }

      request.onerror = () => {
        reject(new Error('Failed to add category'))
      }
    })
  }

  // 更新分类
  async updateCategory(category: Category): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const categoryToUpdate = {
        ...category,
        createdAt: category.createdAt.toISOString()
      }
      
      const request = store.put(categoryToUpdate)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to update category'))
      }
    })
  }

  // 删除分类
  async deleteCategory(id: number): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to delete category'))
      }
    })
  }

  // 批量设置分类（用于初始化）
  async setCategories(categories: Category[]): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      // 先清空现有数据
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        // 添加新数据
        let completed = 0
        const total = categories.length
        
        if (total === 0) {
          resolve()
          return
        }
        
        categories.forEach(category => {
          const categoryToAdd = {
            ...category,
            createdAt: category.createdAt.toISOString()
          }
          
          const addRequest = store.add(categoryToAdd)
          
          addRequest.onsuccess = () => {
            completed++
            if (completed === total) {
              resolve()
            }
          }
          
          addRequest.onerror = () => {
            reject(new Error('Failed to set categories'))
          }
        })
      }
      
      clearRequest.onerror = () => {
        reject(new Error('Failed to clear existing categories'))
      }
    })
  }

  // 根据父分类ID获取子分类
  async getCategoriesByParentId(parentId?: number): Promise<Category[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('parentId')
      const request = index.getAll(parentId)

      request.onsuccess = () => {
        const categories = request.result.map((category: Category & { createdAt: string }) => ({
          ...category,
          createdAt: new Date(category.createdAt)
        }))
        resolve(categories)
      }

      request.onerror = () => {
        reject(new Error('Failed to get categories by parent ID'))
      }
    })
  }
}

// 导出单例实例
export const categoryDB = new CategoryDB()