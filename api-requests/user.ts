import { UserType } from '@/lib/mongodb/user/type.d'
import { UserStats } from '@/app/api/user/stats/route'

// API响应基础类型
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 用户相关API请求类
export class UserApiService {
  private static baseUrl = '/api/user'

  // 获取用户信息
  static async getUserById(id: string): Promise<ApiResponse<UserType>> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`)
      return await response.json()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 通过手机号获取用户信息
  static async getUserByPhone(phone: string): Promise<ApiResponse<UserType>> {
    try {
      const response = await fetch(`${this.baseUrl}?phone=${phone}`)
      return await response.json()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 创建用户
  static async createUser(userData: {
    username: string
    phone: string
    password: string
  }): Promise<ApiResponse<UserType>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      return await response.json()
    } catch (error) {
      console.error('创建用户失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 更新用户信息
  static async updateUser(userData: {
    id: string
    username?: string
    phone?: string
    password?: string
  }): Promise<ApiResponse<UserType>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      return await response.json()
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 删除用户
  static async deleteUser(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: 'DELETE',
      })
      return await response.json()
    } catch (error) {
      console.error('删除用户失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 获取用户统计信息
  static async getUserStats(userId: string): Promise<ApiResponse<UserStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/stats?id=${userId}`)
      return await response.json()
    } catch (error) {
      console.error('获取用户统计信息失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 更新用户活跃时间
  static async updateUserActiveTime(userId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      return await response.json()
    } catch (error) {
      console.error('更新用户活跃时间失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 用户登录
  static async login(phone: string, password: string): Promise<ApiResponse<UserType>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password, action: 'login' }),
      })
      return await response.json()
    } catch (error) {
      console.error('用户登录失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 验证密码
  static async verifyPassword(phone: string, password: string): Promise<ApiResponse<{ isValid: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password, action: 'verify' }),
      })
      return await response.json()
    } catch (error) {
      console.error('密码验证失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }

  // 修改密码
  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, oldPassword, newPassword }),
      })
      return await response.json()
    } catch (error) {
      console.error('修改密码失败:', error)
      return { success: false, error: '网络请求失败' }
    }
  }
}

// 导出便捷的函数式API
export const userApi = {
  // 用户基本操作
  getById: UserApiService.getUserById,
  getByPhone: UserApiService.getUserByPhone,
  create: UserApiService.createUser,
  update: UserApiService.updateUser,
  delete: UserApiService.deleteUser,
  
  // 统计相关
  getStats: UserApiService.getUserStats,
  updateActiveTime: UserApiService.updateUserActiveTime,
  
  // 认证相关
  login: UserApiService.login,
  verifyPassword: UserApiService.verifyPassword,
  changePassword: UserApiService.changePassword,
}