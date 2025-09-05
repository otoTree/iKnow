"use client"

import { useEffect } from 'react'
import { useCategoryStore } from '@/lib/stores/category-store'

/**
 * 用于初始化分类 store 的 hook
 * 在应用启动时自动初始化分类数据
 */
export function useCategoryStoreInit() {
  const { initializeStore } = useCategoryStore()

  useEffect(() => {
    initializeStore()
  }, [initializeStore])
}