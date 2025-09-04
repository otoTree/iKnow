"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Activity, FileText, MessageCircle, Calendar } from "lucide-react"
import { UserStats } from "@/lib/types"

interface UserStatsCardProps {
  userStats: UserStats
}

export function UserStatsCard({ userStats }: UserStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          使用统计
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm">知识碎片</span>
            </div>
            <Badge variant="secondary">{userStats.totalFragments}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">对话次数</span>
            </div>
            <Badge variant="secondary">{userStats.totalChats}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <span className="text-sm">今日活跃</span>
            </div>
            <Badge variant={userStats.activeToday > 0 ? "default" : "secondary"}>
              {userStats.activeToday > 0 ? "活跃" : "未活跃"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm">加入天数</span>
            </div>
            <Badge variant="outline">{userStats.joinDays} 天</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}