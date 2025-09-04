"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

interface SecurityCardProps {
  onChangePasswordClick: () => void
}

export function SecurityCard({ onChangePasswordClick }: SecurityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          账户安全
        </CardTitle>
        <CardDescription>
          管理您的密码和安全设置
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">登录密码</p>
              <p className="text-sm text-muted-foreground">用于登录系统的密码</p>
            </div>
            <Button variant="outline" size="sm" onClick={onChangePasswordClick}>
              修改密码
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}