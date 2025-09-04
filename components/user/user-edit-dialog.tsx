"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserType } from "@/lib/mongodb/user/type"

interface UserEditDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  user: UserType
  onSave: (editForm: { username: string; phone: string }) => void
}

export function UserEditDialog({ isOpen, onOpenChange, user, onSave }: UserEditDialogProps) {
  const [editForm, setEditForm] = useState({
    username: user.username,
    phone: user.phone
  })

  useEffect(() => {
    setEditForm({
      username: user.username,
      phone: user.phone
    })
  }, [user])

  const handleSave = () => {
    onSave(editForm)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑个人信息</DialogTitle>
          <DialogDescription>
            更新您的基本信息
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={editForm.username}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}