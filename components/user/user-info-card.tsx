"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Phone, Calendar, Clock } from "lucide-react"
import { UserType } from "@/lib/types"
import { format, formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface UserInfoCardProps {
  user: UserType
  onEditClick: () => void
}

export function UserInfoCard({ user, onEditClick }: UserInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Phone className="h-4 w-4 mr-1" />
                {user.phone}
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            编辑信息
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">注册时间</p>
              <p className="text-sm text-muted-foreground">
                {format(user.createTime, 'yyyy年MM月dd日', { locale: zhCN })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">最后更新</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(user.updateTime, { addSuffix: true, locale: zhCN })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}