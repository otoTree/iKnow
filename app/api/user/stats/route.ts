import { NextRequest, NextResponse } from 'next/server'
import { MongoUser } from '@/lib/mongodb/user/schema'

// 用户统计数据接口
export interface UserStats {
  totalFragments: number
  totalChats: number
  activeToday: number
  joinDays: number
  lastActiveTime?: Date
}

// 获取用户统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: id' },
        { status: 400 }
      )
    }

    // 获取用户基本信息
    const user = await MongoUser.findById(userId).select('createTime')
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 计算加入天数
    const joinDays = Math.floor(
      (Date.now() - user.createTime.getTime()) / (1000 * 60 * 60 * 24)
    )

    // TODO: 这里需要根据实际的fragments和chats集合来统计
    // 目前返回模拟数据，实际项目中需要查询相关集合
    const stats: UserStats = {
      totalFragments: 0, // await FragmentModel.countDocuments({ userId })
      totalChats: 0,     // await ChatModel.countDocuments({ userId })
      activeToday: 0,    // 今日活跃次数
      joinDays,
      lastActiveTime: new Date() // 最后活跃时间
    }

    // 如果有fragments集合，可以这样统计：
    // const totalFragments = await MongoFragment.countDocuments({ userId })
    // const totalChats = await MongoChat.countDocuments({ userId })
    
    // 统计今日活跃（示例：今日创建的fragments + chats）
    // const today = new Date()
    // today.setHours(0, 0, 0, 0)
    // const tomorrow = new Date(today)
    // tomorrow.setDate(tomorrow.getDate() + 1)
    
    // const activeToday = await Promise.all([
    //   MongoFragment.countDocuments({
    //     userId,
    //     createTime: { $gte: today, $lt: tomorrow }
    //   }),
    //   MongoChat.countDocuments({
    //     userId,
    //     createTime: { $gte: today, $lt: tomorrow }
    //   })
    // ]).then(([fragments, chats]) => fragments + chats)

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取用户统计信息失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新用户活跃时间
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: userId' },
        { status: 400 }
      )
    }

    // 更新用户最后活跃时间
    const updatedUser = await MongoUser.findByIdAndUpdate(
      userId,
      { updateTime: new Date() },
      { new: true, select: 'updateTime' }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { lastActiveTime: updatedUser.updateTime },
      message: '活跃时间更新成功'
    })
  } catch (error) {
    console.error('更新用户活跃时间失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}