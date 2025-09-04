import { NextRequest, NextResponse } from 'next/server'
import { MongoUser } from '@/lib/mongodb/user/schema'
import { hashStr } from '@/package/utils/utils'

// 用户登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, action } = body

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: phone, password' },
        { status: 400 }
      )
    }

    // 根据action执行不同操作
    switch (action) {
      case 'login':
        return await handleLogin(phone, password)
      case 'verify':
        return await handlePasswordVerify(phone, password)
      default:
        return NextResponse.json(
          { success: false, error: '无效的操作类型' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('认证操作失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 处理用户登录
async function handleLogin(phone: string, password: string) {
  try {
    // 查找用户（包含密码字段用于验证）
    const user = await MongoUser.findOne({ phone }).select('+password')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证密码
    const hashedPassword = await hashStr(password)
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { success: false, error: '密码错误' },
        { status: 401 }
      )
    }

    // 更新最后登录时间
    await MongoUser.findByIdAndUpdate(user._id, {
      updateTime: new Date()
    })

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user.toObject()

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: '登录成功'
    })
  } catch (error) {
    console.error('登录处理失败:', error)
    throw error
  }
}

// 处理密码验证
async function handlePasswordVerify(phone: string, password: string) {
  try {
    // 查找用户（包含密码字段用于验证）
    const user = await MongoUser.findOne({ phone }).select('+password')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证密码
    const hashedPassword = await hashStr(password)
    const isValid = user.password === hashedPassword

    return NextResponse.json({
      success: true,
      data: { isValid },
      message: isValid ? '密码验证成功' : '密码验证失败'
    })
  } catch (error) {
    console.error('密码验证失败:', error)
    throw error
  }
}

// 修改密码
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, oldPassword, newPassword } = body

    if (!userId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: userId, oldPassword, newPassword' },
        { status: 400 }
      )
    }

    // 验证新密码强度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '新密码长度至少6位' },
        { status: 400 }
      )
    }

    // 查找用户（包含密码字段用于验证）
    const user = await MongoUser.findById(userId).select('+password')
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证旧密码
    const hashedOldPassword = await hashStr(oldPassword)
    if (user.password !== hashedOldPassword) {
      return NextResponse.json(
        { success: false, error: '原密码错误' },
        { status: 401 }
      )
    }

    // 更新密码
    await MongoUser.findByIdAndUpdate(userId, {
      password: newPassword, // 会在schema中自动hash
      updateTime: new Date()
    })

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}