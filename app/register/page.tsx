"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ArrowLeft, Home, User } from "lucide-react"
import { UserType } from "@/lib/mongodb/user/type"

export default function RegisterPage() {
  const router = useRouter()
  const [registeredUser, setRegisteredUser] = useState<UserType | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // 处理注册成功
  const handleRegisterSuccess = (user: UserType) => {
    setRegisteredUser(user)
    setIsSuccess(true)
    
    // 3秒后自动跳转到首页
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  // 处理注册错误
  const handleRegisterError = (error: string) => {
    console.error('注册失败:', error)
    // 错误处理已在RegisterForm组件中完成
  }

  // 手动跳转到首页
  const handleGoHome = () => {
    router.push('/')
  }

  // 跳转到用户中心
  const handleGoToProfile = () => {
    router.push('/user')
  }

  // 返回上一页
  const handleGoBack = () => {
    router.back()
  }

  // 如果注册成功，显示成功页面
  if (isSuccess && registeredUser) {
    return (
      <div className="min-h-screen  to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16  rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              注册成功！
            </CardTitle>
            <CardDescription className="text-center">
              欢迎加入iKnow，{registeredUser.username}！
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                您的账户已创建成功，3秒后将自动跳转到首页
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button 
                onClick={handleGoHome} 
                className="w-full"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                立即进入首页
              </Button>
              
              <Button 
                onClick={handleGoToProfile} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                <User className="mr-2 h-4 w-4" />
                前往个人中心
              </Button>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>手机号: {registeredUser.phone}</p>
              <p>注册时间: {new Date(registeredUser.createTime).toLocaleString('zh-CN')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 显示注册表单
  return (
    <div className="min-h-screen   to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-4">
        {/* 返回按钮 */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            返回首页
          </Link>
        </div>

        {/* 注册表单 */}
        <RegisterForm 
          onSuccess={handleRegisterSuccess}
          onError={handleRegisterError}
        />
        
        {/* 登录链接 */}
        <div className="text-center text-sm text-muted-foreground">
          已有账户？
          <Link 
            href="/login" 
            className="ml-1 text-primary hover:underline font-medium"
          >
            立即登录
          </Link>
        </div>
        
        {/* 服务条款 */}
        <div className="text-center text-xs text-muted-foreground">
          注册即表示您同意我们的
          <Link href="/terms" className="text-primary hover:underline mx-1">
            服务条款
          </Link>
          和
          <Link href="/privacy" className="text-primary hover:underline mx-1">
            隐私政策
          </Link>
        </div>
      </div>
    </div>
  )
}