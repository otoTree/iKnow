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

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (oldPassword: string, newPassword: string, confirmPassword: string) => Promise<void>
}

export function ChangePasswordDialog({ open, onOpenChange, onSave }: ChangePasswordDialogProps) {
  const [passwordForm, setPasswordForm] = useState({ 
    oldPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await onSave(passwordForm.oldPassword, passwordForm.newPassword, passwordForm.confirmPassword)
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      onOpenChange(false)
    } catch (error) {
      console.error('修改密码失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            请输入原密码和新密码
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="oldPassword">原密码</Label>
            <Input
              id="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              placeholder="请输入原密码"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="请输入新密码（至少6位）"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="请再次输入新密码"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
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