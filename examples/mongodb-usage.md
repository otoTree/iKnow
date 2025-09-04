# MongoDB 使用指南

## 🔐 安全配置

### 1. 环境变量配置

**永远不要将数据库连接字符串直接写入代码！** 

正确的做法是使用环境变量：

```bash
# .env.local 文件
MONGODB_URI=mongodb://root:67nz4dqm@dbconn.sealosbja.site:47366/?directConnection=true
```

### 2. 代码中的使用

```typescript
// ✅ 正确：使用环境变量
const mongoUrl = process.env.MONGODB_URI

// ❌ 错误：硬编码敏感信息
const mongoUrl = "mongodb://root:67nz4dqm@dbconn.sealosbja.site:47366/?directConnection=true"
```

## 🚀 使用示例

### 初始化连接

```typescript
import { initMongoDB, getMongoStatus } from '@/lib/mongodb-config'

// 在应用启动时初始化
async function startApp() {
  try {
    await initMongoDB()
    console.log('数据库连接状态:', getMongoStatus())
  } catch (error) {
    console.error('应用启动失败:', error)
  }
}
```

### 在 Next.js API 路由中使用

```typescript
// app/api/test-mongo/route.ts
import { NextResponse } from 'next/server'
import { initMongoDB } from '@/lib/mongodb-config'
import { getMongoModel } from '@/package/mongo'

export async function GET() {
  try {
    // 确保数据库连接
    await initMongoDB()
    
    // 使用数据库
    // ... 你的业务逻辑
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: '数据库连接失败' },
      { status: 500 }
    )
  }
}
```

## 🔒 安全最佳实践

1. **环境变量文件**：
   - `.env.local` - 本地开发环境
   - `.env.production` - 生产环境
   - 这些文件已在 `.gitignore` 中被忽略

2. **生产环境部署**：
   - 在服务器或云平台上设置环境变量
   - 不要在代码仓库中提交任何包含敏感信息的文件

3. **权限控制**：
   - 使用专用的数据库用户
   - 设置适当的权限级别
   - 定期更换密码

## 🔧 配置选项

当前项目支持的 MongoDB 环境变量：

- `MONGODB_URI` - 主数据库连接字符串
- `MONGODB_LOG_URI` - 日志数据库连接字符串（可选）
- `DB_MAX_LINK` - 最大连接数（默认：20）
- `SYNC_INDEX` - 是否同步索引（默认：1）
