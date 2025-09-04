/**
 * MongoDB 配置文件
 * 
 * 该文件展示了如何安全地使用环境变量来配置MongoDB连接
 * 而不是将敏感信息硬编码到代码中
 */

import { connectMongo } from '../package/mongo/init'
import { connectionMongo, MONGO_URL } from '../package/mongo/index'

/**
 * 初始化MongoDB连接
 * 使用环境变量中的连接字符串
 */
export async function initMongoDB() {
  try {
    // 检查环境变量是否配置
    if (!MONGO_URL) {
      throw new Error('MONGODB_URI 环境变量未配置。请在 .env.local 文件中设置 MONGODB_URI')
    }

    console.log('正在连接 MongoDB...')
    
    // 使用环境变量中的连接字符串连接数据库
    await connectMongo(connectionMongo, MONGO_URL)
    
    console.log('MongoDB 连接成功')
    return connectionMongo
  } catch (error) {
    console.error('MongoDB 连接失败:', error)
    throw error
  }
}

/**
 * 获取MongoDB连接状态
 */
export function getMongoStatus() {
  const states = {
    0: '断开连接',
    1: '已连接',
    2: '正在连接',
    3: '正在断开连接'
  }
  
  return {
    state: connectionMongo.connection.readyState,
    stateText: states[connectionMongo.connection.readyState as keyof typeof states] || '未知状态',
    host: connectionMongo.connection.host,
    name: connectionMongo.connection.name
  }
}

/**
 * 关闭MongoDB连接
 */
export async function closeMongoDB() {
  try {
    await connectionMongo.disconnect()
    console.log('MongoDB 连接已关闭')
  } catch (error) {
    console.error('关闭 MongoDB 连接时出错:', error)
  }
}
