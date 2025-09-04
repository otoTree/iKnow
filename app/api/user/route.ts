import { NextRequest, NextResponse } from 'next/server'
import { MongoUser } from '@/lib/mongodb/user/schema'
import { UserType } from '@/lib/mongodb/user/type.d'
import { hashStr } from '@/package/utils/utils'

// 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    const phone = searchParams.get('phone')

    if (!userId && !phone) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: id 或 phone' },
        { status: 400 }
      )
    }

    let user
    if (userId) {
      user = await MongoUser.findById(userId).select('-password')
    } else if (phone) {
      user = await MongoUser.findOne({ phone }).select('-password')
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, phone, password } = body

    // 验证必需参数
    if (!username || !phone || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: username, phone, password' },
        { status: 400 }
      )
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: '手机号格式不正确' },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await MongoUser.findOne({ phone })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该手机号已注册' },
        { status: 409 }
      )
    }

    // 创建新用户
    const newUser = new MongoUser({
      username,
      phone,
      password, // 密码会在schema中自动hash
      createTime: new Date(),
      updateTime: new Date()
    })

    const savedUser = await newUser.save()

    // 返回用户信息（不包含密码）
    const userResponse = savedUser.toObject()
    const { password: _, ...userWithoutPassword } = userResponse

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: '用户创建成功'
    }, { status: 201 })
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, username, phone, password } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: id' },
        { status: 400 }
      )
    }

    // 构建更新数据
    const updateData: Partial<UserType> = {
      updateTime: new Date()
    }

    if (username) updateData.username = username
    if (phone) {
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, error: '手机号格式不正确' },
          { status: 400 }
        )
      }
      
      // 检查手机号是否已被其他用户使用
      const existingUser = await MongoUser.findOne({ phone, _id: { $ne: id } })
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: '该手机号已被其他用户使用' },
          { status: 409 }
        )
      }
      updateData.phone = phone
    }
    if (password) updateData.password = password // 会在schema中自动hash

    const updatedUser = await MongoUser.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '用户信息更新成功'
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: id' },
        { status: 400 }
      )
    }

    const deletedUser = await MongoUser.findByIdAndDelete(userId)

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '用户删除成功'
    })
  } catch (error) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}