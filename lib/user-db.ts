import { UserType, UserStats } from './types'

// IndexedDB 数据库配置
const DB_NAME = 'iknow-users'
const DB_VERSION = 1
const STORE_NAME = 'users'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'

class UserDB {
  private db: IDBDatabase | null = null

  // 初始化数据库
  async init(): Promise<void> {
    // 如果不在浏览器环境中，直接返回
    if (!isBrowser) {
      console.log('IndexedDB 不可用：不在浏览器环境中')
      return Promise.resolve()
    }
    
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
          console.error('打开用户数据库失败')
          reject(new Error('Failed to open user database'))
        }

        request.onsuccess = () => {
          this.db = request.result
          console.log('用户数据库初始化成功')
          resolve()
        }

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          
          // 创建对象存储
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { 
              keyPath: '_id'
            })
            
            // 创建索引
            store.createIndex('phone', 'phone', { unique: true })
            store.createIndex('username', 'username', { unique: false })
            store.createIndex('createTime', 'createTime', { unique: false })
          }
        }
      } catch (error) {
        console.error('初始化用户数据库时出错:', error)
        reject(error)
      }
    })
  }

  // 获取所有用户
  async getAllUsers(): Promise<UserType[]> {
    // 如果不在浏览器环境中，返回空数组
    if (!isBrowser) {
      console.log('getAllUsers: IndexedDB 不可用，返回空数组')
      return []
    }
    
    if (!this.db) await this.init()
    
    // 如果初始化后数据库仍然不可用，返回空数组
    if (!this.db) {
      console.log('getAllUsers: 数据库初始化失败，返回空数组')
      return []
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const users = request.result.map((user: UserType & { createTime: string; updateTime: string }) => ({
            ...user,
            createTime: new Date(user.createTime),
            updateTime: new Date(user.updateTime)
          }))
          resolve(users)
        }

        request.onerror = () => {
          console.error('获取用户列表失败')
          reject(new Error('Failed to get users'))
        }
      } catch (error) {
        console.error('获取用户列表时出错:', error)
        resolve([])
      }
    })
  }

  // 通过ID获取用户
  async getUserById(id: string): Promise<UserType | null> {
    // 如果不在浏览器环境中，返回null
    if (!isBrowser) {
      console.log(`getUserById: IndexedDB 不可用，无法获取用户 ${id}`)
      return null
    }
    
    if (!this.db) await this.init()
    
    // 如果初始化后数据库仍然不可用，返回null
    if (!this.db) {
      console.log(`getUserById: 数据库初始化失败，无法获取用户 ${id}`)
      return null
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(id)

        request.onsuccess = () => {
          if (!request.result) {
            resolve(null)
            return
          }
          
          const user = request.result
          resolve({
            ...user,
            createTime: new Date(user.createTime),
            updateTime: new Date(user.updateTime)
          })
        }

        request.onerror = () => {
          console.error(`获取用户 ${id} 失败`)
          reject(new Error('Failed to get user by ID'))
        }
      } catch (error) {
        console.error(`获取用户 ${id} 时出错:`, error)
        resolve(null)
      }
    })
  }

  // 通过手机号获取用户
  async getUserByPhone(phone: string): Promise<UserType | null> {
    // 如果不在浏览器环境中，返回null
    if (!isBrowser) {
      console.log(`getUserByPhone: IndexedDB 不可用，无法获取用户 ${phone}`)
      return null
    }
    
    if (!this.db) await this.init()
    
    // 如果初始化后数据库仍然不可用，返回null
    if (!this.db) {
      console.log(`getUserByPhone: 数据库初始化失败，无法获取用户 ${phone}`)
      return null
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const index = store.index('phone')
        const request = index.get(phone)

        request.onsuccess = () => {
          if (!request.result) {
            resolve(null)
            return
          }
          
          const user = request.result
          resolve({
            ...user,
            createTime: new Date(user.createTime),
            updateTime: new Date(user.updateTime)
          })
        }

        request.onerror = () => {
          console.error(`获取用户 ${phone} 失败`)
          reject(new Error('Failed to get user by phone'))
        }
      } catch (error) {
        console.error(`获取用户 ${phone} 时出错:`, error)
        resolve(null)
      }
    })
  }

  // 添加用户
  async addUser(user: Omit<UserType, '_id'>): Promise<UserType> {
    // 如果不在浏览器环境中，返回模拟用户
    if (!isBrowser) {
      console.log('addUser: IndexedDB 不可用，返回模拟用户')
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      return {
        ...user,
        _id: userId
      }
    }
    
    if (!this.db) await this.init()
    
    // 如果初始化后数据库仍然不可用，返回模拟用户
    if (!this.db) {
      console.log('addUser: 数据库初始化失败，返回模拟用户')
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      return {
        ...user,
        _id: userId
      }
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        // 生成唯一ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        
        const userToAdd = {
          _id: userId,
          ...user,
          createTime: user.createTime.toISOString(),
          updateTime: user.updateTime.toISOString()
        }
        
        const request = store.add(userToAdd)

        request.onsuccess = () => {
          const newUser = {
            ...user,
            _id: userId
          }
          console.log(`用户 ${userId} 添加成功`)
          resolve(newUser)
        }

        request.onerror = () => {
          console.error('添加用户失败')
          reject(new Error('Failed to add user'))
        }
      } catch (error) {
        console.error('添加用户时出错:', error)
        // 出错时也返回一个模拟用户，避免应用崩溃
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        resolve({
          ...user,
          _id: userId
        })
      }
    })
  }

  // 更新用户
  async updateUser(user: UserType): Promise<void> {
    // 如果不在浏览器环境中，直接返回
    if (!isBrowser) {
      console.log(`updateUser: IndexedDB 不可用，无法更新用户 ${user._id}`)
      return
    }
    
    if (!this.db) await this.init()
    
    // 如果初始化后数据库仍然不可用，直接返回
    if (!this.db) {
      console.log(`updateUser: 数据库初始化失败，无法更新用户 ${user._id}`)
      return
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        const userToUpdate = {
          ...user,
          createTime: user.createTime.toISOString(),
          updateTime: new Date().toISOString()
        }
        
        const request = store.put(userToUpdate)

        request.onsuccess = () => {
          console.log(`用户 ${user._id} 更新成功`)
          resolve()
        }

        request.onerror = () => {
          console.error(`更新用户 ${user._id} 失败`)
          reject(new Error('Failed to update user'))
        }
      } catch (error) {
        console.error(`更新用户 ${user._id} 时出错:`, error)
        resolve() // 出错时也返回成功，避免应用崩溃
      }
    })
  }

  // 删除用户
  async deleteUser(id: string): Promise<void> {
    // 如果不在浏览器环境中，直接返回
    if (!isBrowser) {
      console.log(`deleteUser: IndexedDB 不可用，无法删除用户 ${id}`)
      return
    }
    
    if (!this.db) await this.init()
    
    // 如果初始化后数据库仍然不可用，直接返回
    if (!this.db) {
      console.log(`deleteUser: 数据库初始化失败，无法删除用户 ${id}`)
      return
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => {
          console.log(`用户 ${id} 删除成功`)
          resolve()
        }

        request.onerror = () => {
          console.error(`删除用户 ${id} 失败`)
          reject(new Error('Failed to delete user'))
        }
      } catch (error) {
        console.error(`删除用户 ${id} 时出错:`, error)
        resolve() // 出错时也返回成功，避免应用崩溃
      }
    })
  }

  // 验证密码
  async verifyPassword(phone: string, password: string): Promise<boolean> {
    // 如果不在浏览器环境中，返回false
    if (!isBrowser) {
      console.log(`verifyPassword: IndexedDB 不可用，无法验证用户 ${phone} 的密码`)
      return false
    }
    
    try {
      const user = await this.getUserByPhone(phone)
      if (!user) return false
      
      // 在实际应用中，这里应该使用加密比较
      return user.password === password
    } catch (error) {
      console.error('密码验证失败:', error)
      return false
    }
  }

  // 获取用户统计信息（模拟数据）
  async getUserStats(userId: string): Promise<UserStats> {
    // 如果不在浏览器环境中，返回默认统计信息
    if (!isBrowser) {
      console.log(`getUserStats: IndexedDB 不可用，返回默认统计信息`)
      return {
        totalFragments: 0,
        totalChats: 0,
        activeToday: 0,
        joinDays: 1
      }
    }
    
    try {
      const user = await this.getUserById(userId)
      if (!user) {
        console.log(`用户 ${userId} 不存在，返回默认统计信息`)
        return {
          totalFragments: 0,
          totalChats: 0,
          activeToday: 0,
          joinDays: 1
        }
      }
      
      // 这里返回模拟数据，实际应用中可能需要从其他存储中获取
      const now = new Date()
      const joinDays = Math.floor((now.getTime() - user.createTime.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      return {
        totalFragments: Math.floor(Math.random() * 50),
        totalChats: Math.floor(Math.random() * 20),
        activeToday: Math.random() > 0.5 ? 1 : 0,
        joinDays
      }
    } catch (error) {
      console.error('获取用户统计信息失败:', error)
      return {
        totalFragments: 0,
        totalChats: 0,
        activeToday: 0,
        joinDays: 1
      }
    }
  }
  
  // 检查数据库是否为空，如果为空则初始化一个默认用户
  async initDefaultUserIfEmpty(): Promise<UserType | null> {
    // 如果不在浏览器环境中，直接返回
    if (!isBrowser) {
      console.log('initDefaultUserIfEmpty: IndexedDB 不可用，跳过初始化默认用户')
      return null
    }
    
    try {
      // 获取所有用户
      const users = await this.getAllUsers()
      
      // 如果没有用户，创建一个默认用户
      if (users.length === 0) {
        console.log('数据库为空，初始化默认用户')
        const now = new Date()
        const defaultUser = await this.addUser({
          username: '默认用户',
          phone: '13800138000',
          password: 'password123',
          createTime: now,
          updateTime: now
        })
        
        console.log('默认用户创建成功:', defaultUser)
        return defaultUser
      }
      
      return null // 数据库不为空，不需要初始化
    } catch (error) {
      console.error('检查或初始化默认用户失败:', error)
      return null
    }
  }
}

// 导出单例实例
export const userDB = new UserDB()