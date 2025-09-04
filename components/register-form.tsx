"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { userApi } from "@/api-requests/user"
import { UserType } from "@/lib/mongodb/user/type"

interface RegisterFormProps {
  onSuccess?: (user: UserType) => void
  onError?: (error: string) => void
}

interface FormData {
  username: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  username?: string
  phone?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = "请输入用户名"
    } else if (formData.username.length < 2) {
      newErrors.username = "用户名至少需要2个字符"
    } else if (formData.username.length > 20) {
      newErrors.username = "用户名不能超过20个字符"
    }

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "请输入手机号"
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "请输入正确的手机号格式"
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = "请输入密码"
    } else if (formData.password.length < 6) {
      newErrors.password = "密码至少需要6个字符"
    } else if (formData.password.length > 50) {
      newErrors.password = "密码不能超过50个字符"
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "请确认密码"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await userApi.create({
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      })

      if (response.success && response.data) {
        onSuccess?.(response.data)
      } else {
        const errorMessage = response.error || "注册失败，请重试"
        setErrors({ general: errorMessage })
        onError?.(errorMessage)
      }
    } catch (error) {
      const errorMessage = "网络错误，请检查网络连接后重试"
      setErrors({ general: errorMessage })
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">注册账户</CardTitle>
        <CardDescription className="text-center">
          创建您的iKnow账户，开始管理您的知识碎片
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 通用错误提示 */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* 用户名输入 */}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* 手机号输入 */}
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* 密码输入 */}
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码（至少6位）"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* 确认密码输入 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                注册中...
              </>
            ) : (
              "注册"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}