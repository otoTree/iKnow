"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UserStatsCardProps {
  stats: {
    totalFragments: number
    totalChats: number
    activeToday: number
    joinDays: number
  }
}

export function UserStatsCard({ stats }: UserStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>使用概览</CardTitle>
        <CardDescription>您在 iKnow 的活动统计</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalFragments}</div>
            <div className="text-sm text-muted-foreground">知识碎片</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalChats}</div>
            <div className="text-sm text-muted-foreground">AI对话</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.activeToday}</div>
            <div className="text-sm text-muted-foreground">今日活跃</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.joinDays}</div>
            <div className="text-sm text-muted-foreground">加入天数</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}