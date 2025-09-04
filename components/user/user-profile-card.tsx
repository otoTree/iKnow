"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Phone, Activity, Edit3 } from "lucide-react"
import { UserType } from "@/lib/mongodb/user/type"
import { UserEditDialog } from "./user-edit-dialog"

interface UserProfileCardProps {
  user: UserType
  onUserUpdate: (updatedUser: UserType) => void
  formatDate: (date: Date) => string
}

export function UserProfileCard({ user, onUserUpdate, formatDate }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (editForm: { username: string; phone: string }) => {
    const updatedUser = {
      ...user,
      username: editForm.username,
      phone: editForm.phone,
      updateTime: new Date()
    }
    onUserUpdate(updatedUser)
    setIsEditing(false)
  }

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
              <CardDescription>用户ID: {user._id}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{user.phone}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>注册时间: {formatDate(user.createTime)}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span>最后更新: {formatDate(user.updateTime)}</span>
        </div>
      </CardContent>
      
      <UserEditDialog
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        user={user}
        onSave={handleSave}
      />
    </Card>
  )
}