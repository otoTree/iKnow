"use client"

import { useEffect } from 'react'
import { userDB } from '@/lib/user-db'

/**
 * 用于初始化用户数据库的Hook
 * 应该在应用的根组件中调用
 */
export function useUserDBInit() {
  useEffect(() => {
    const initUserDB = async () => {
      try {
        await userDB.init()
        // 检查数据库是否为空，如果为空则初始化默认用户
        const defaultUser = await userDB.initDefaultUserIfEmpty()
        if (defaultUser) {
          console.log('已初始化默认用户:', defaultUser._id)
        }
      } catch (error) {
        console.error('初始化用户数据库失败:', error)
      }
    }

    initUserDB()
  }, [])
}