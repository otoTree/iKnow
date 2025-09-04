"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { UserType } from "@/lib/types"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType
  onSave: (username: string, phone: string) => Promise<void>
}

export function EditUserDialog({ open, onOpenChange, user, onSave }: EditUserDialogProps) {
  const [editForm, setEditForm] = useState({ username: user.username, phone: user.phone })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await onSave(editForm.username, editForm.phone)
      onOpenChange(false)
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑个人信息</DialogTitle>
          <DialogDescription>
            修改您的用户名和手机号
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="请输入手机号"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}