"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserType } from "@/lib/mongodb/user/type"
import { UserStats } from "@/app/api/user/stats/route"
import { userApi } from "@/api-requests/user"
import { UserProfileCard } from "./user-profile-card"
import { UserStatsCard } from "./user-stats-card"
import { UserStatsDetail } from "./user-stats-detail"
import { UserSettingsPanel } from "./user-settings-panel"

export function UserPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // 临时使用固定用户ID，实际项目中应该从认证状态获取
  const currentUserId = "user123"

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 并行获取用户信息和统计数据
        const [userResponse, statsResponse] = await Promise.all([
          userApi.getById(currentUserId),
          userApi.getStats(currentUserId)
        ])

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
        } else {
          setError(userResponse.error || '获取用户信息失败')
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        } else {
          // 统计数据获取失败时使用默认值
          setStats({
            totalFragments: 0,
            totalChats: 0,
            activeToday: 0,
            joinDays: 0
          })
        }
      } catch (err) {
        console.error('加载用户数据失败:', err)
        setError('加载数据时发生错误')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [currentUserId])

  const handleUserUpdate = async (updatedUser: UserType) => {
    try {
      const response = await userApi.update({
        id: updatedUser._id,
        username: updatedUser.username,
        phone: updatedUser.phone
      })

      if (response.success && response.data) {
        setUser(response.data)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setError(response.error || '更新用户信息失败')
      }
    } catch (err) {
      console.error('更新用户信息失败:', err)
      setError('更新用户信息时发生错误')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // 加载状态
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">个人中心</h1>
          <p className="text-xl text-muted-foreground mt-2">
            管理您的个人信息和账户设置
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">加载中...</div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error || !user || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">个人中心</h1>
          <p className="text-xl text-muted-foreground mt-2">
            管理您的个人信息和账户设置
          </p>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error || '加载用户数据失败'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">个人中心</h1>
        <p className="text-xl text-muted-foreground mt-2">
          管理您的个人信息和账户设置
        </p>
      </div>

      {/* 成功提示 */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            用户信息更新成功！
          </AlertDescription>
        </Alert>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">个人资料</TabsTrigger>
          <TabsTrigger value="stats">使用统计</TabsTrigger>
          <TabsTrigger value="settings">账户设置</TabsTrigger>
        </TabsList>

        {/* 个人资料标签页 */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <UserProfileCard
              user={user}
              onUserUpdate={handleUserUpdate}
              formatDate={formatDate}
            />
            <UserStatsCard stats={stats} />
          </div>
        </TabsContent>

        {/* 使用统计标签页 */}
        <TabsContent value="stats" className="space-y-6">
          <UserStatsDetail stats={stats} />
        </TabsContent>

        {/* 账户设置标签页 */}
        <TabsContent value="settings" className="space-y-6">
          <UserSettingsPanel user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}