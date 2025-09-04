"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface UserStatsDetailProps {
  stats: {
    totalFragments: number
    totalChats: number
    activeToday: number
    joinDays: number
  }
}

export function UserStatsDetail({ stats }: UserStatsDetailProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>内容统计</CardTitle>
          <CardDescription>您创建的内容数量</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>知识碎片</span>
            <Badge variant="secondary">{stats.totalFragments}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span>AI对话记录</span>
            <Badge variant="secondary">{stats.totalChats}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span>今日新增</span>
            <Badge variant="secondary">{stats.activeToday}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>活跃度分析</CardTitle>
          <CardDescription>您的使用习惯分析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6">
            <div className="text-3xl font-bold text-primary mb-2">{stats.joinDays}</div>
            <div className="text-muted-foreground">天</div>
            <div className="text-sm text-muted-foreground mt-2">已加入 iKnow</div>
          </div>
          <Separator />
          <div className="text-center text-sm text-muted-foreground">
            平均每天创建 {(stats.totalFragments / Math.max(stats.joinDays, 1)).toFixed(1)} 个碎片
          </div>
        </CardContent>
      </Card>
    </div>
  )
}