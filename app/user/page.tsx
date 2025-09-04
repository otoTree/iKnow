"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserType, UserStats } from "@/lib/types"
import { userDB } from "@/lib/user-db"
import { UserInfoCard } from "@/components/user/user-info-card"
import { UserStatsCard } from "@/components/user/user-stats-card"
import { SecurityCard } from "@/components/user/security-card"
import { QuickActionsCard } from "@/components/user/quick-actions-card"
import { EditUserDialog } from "@/components/user/edit-user-dialog"
import { ChangePasswordDialog } from "@/components/user/change-password-dialog"

export default function UserPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 加载用户数据
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      // 这里使用默认用户ID，实际应用中应该从认证状态获取
      const users = await userDB.getAllUsers()
      if (users.length > 0) {
        const currentUser = users[0] // 使用第一个用户作为当前用户
        setUser(currentUser)
        
        // 加载用户统计信息
        const stats = await userDB.getUserStats(currentUser._id)
        setUserStats(stats)
      } else {
        // 如果没有用户，初始化默认用户
        const defaultUser = await userDB.initDefaultUserIfEmpty()
        if (defaultUser) {
          setUser(defaultUser)
          const stats = await userDB.getUserStats(defaultUser._id)
          setUserStats(stats)
        }
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      setError('加载用户数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 更新用户信息
  const handleUpdateUser = async (username: string, phone: string) => {
    if (!user) return
    
    try {
      setError('')
      setSuccess('')
      
      const updatedUser = {
        ...user,
        username,
        phone,
        updateTime: new Date()
      }
      
      await userDB.updateUser(updatedUser)
      setUser(updatedUser)
      setSuccess('用户信息更新成功')
    } catch (error) {
      console.error('更新用户信息失败:', error)
      setError('更新用户信息失败')
      throw error
    }
  }

  // 修改密码
  const handleChangePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
    if (!user) return
    
    try {
      setError('')
      setSuccess('')
      
      if (newPassword !== confirmPassword) {
        setError('新密码和确认密码不匹配')
        throw new Error('新密码和确认密码不匹配')
      }
      
      if (newPassword.length < 6) {
        setError('新密码长度至少6位')
        throw new Error('新密码长度至少6位')
      }
      
      // 验证旧密码
      const isValidOldPassword = await userDB.verifyPassword(user.phone, oldPassword)
      if (!isValidOldPassword) {
        setError('原密码错误')
        throw new Error('原密码错误')
      }
      
      const updatedUser = {
        ...user,
        password: newPassword,
        updateTime: new Date()
      }
      
      await userDB.updateUser(updatedUser)
      setUser(updatedUser)
      setSuccess('密码修改成功')
    } catch (error) {
      console.error('修改密码失败:', error)
      if (!(error instanceof Error) || (!error.message.includes('新密码') && !error.message.includes('原密码'))) {
        setError('修改密码失败')
      }
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
            <p className="text-muted-foreground">管理您的个人信息和账户设置</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
            <p className="text-muted-foreground">管理您的个人信息和账户设置</p>
          </div>
        </div>
        <Alert>
          <AlertDescription>未找到用户信息，请重新登录</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">个人中心</h1>
          <p className="text-muted-foreground">管理您的个人信息和账户设置</p>
        </div>
      </div>

      {/* 成功/错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 用户基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          <UserInfoCard 
            user={user} 
            onEditClick={() => setIsEditDialogOpen(true)} 
          />
          <SecurityCard 
            onChangePasswordClick={() => setIsPasswordDialogOpen(true)} 
          />
        </div>

        {/* 统计信息侧边栏 */}
        <div className="space-y-6">
          {userStats && <UserStatsCard userStats={userStats} />}
          <QuickActionsCard />
        </div>
      </div>

      {/* 对话框 */}
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        onSave={handleUpdateUser}
      />
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSave={handleChangePassword}
      />
    </div>
  )
}