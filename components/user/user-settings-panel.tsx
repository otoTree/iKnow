"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Settings, Phone, Shield } from "lucide-react"
import { UserType } from "@/lib/mongodb/user/type"

interface UserSettingsPanelProps {
  user: UserType
}

export function UserSettingsPanel({ user }: UserSettingsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>账户设置</span>
        </CardTitle>
        <CardDescription>
          管理您的账户安全和偏好设置
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">修改密码</div>
                <div className="text-sm text-muted-foreground">定期更新密码以保护账户安全</div>
              </div>
            </div>
            <Button variant="outline">修改</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">手机号验证</div>
                <div className="text-sm text-muted-foreground">当前: {user.phone}</div>
              </div>
            </div>
            <Badge variant="secondary">已验证</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">账户注销</div>
                <div className="text-sm text-muted-foreground">永久删除账户和所有数据</div>
              </div>
            </div>
            <Button variant="destructive" size="sm">注销账户</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}