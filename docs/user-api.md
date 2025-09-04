# 用户管理 API 文档

本文档描述了用户管理相关的所有API接口，包括用户基本信息管理、统计数据和认证功能。

## 基础信息

- **基础URL**: `/api/user`
- **数据格式**: JSON
- **字符编码**: UTF-8

## 数据类型定义

### UserType
```typescript
interface UserType {
  _id: string
  username: string
  phone: string
  password: string  // 仅在创建/更新时使用，查询时不返回
  createTime: Date
  updateTime: Date
}
```

### UserStats
```typescript
interface UserStats {
  totalFragments: number    // 总片段数
  totalChats: number       // 总对话数
  activeToday: number      // 今日活跃次数
  joinDays: number         // 加入天数
  lastActiveTime?: Date    // 最后活跃时间
}
```

### ApiResponse
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

## API 接口

### 1. 用户基本信息管理

#### 1.1 获取用户信息

**GET** `/api/user`

**查询参数**:
- `id` (string, 可选): 用户ID
- `phone` (string, 可选): 手机号

*注意: id 和 phone 至少提供一个*

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "username": "知识探索者",
    "phone": "13800138000",
    "createTime": "2024-01-15T00:00:00.000Z",
    "updateTime": "2024-12-20T00:00:00.000Z"
  }
}
```

**错误响应**:
- `400`: 缺少必需参数
- `404`: 用户不存在
- `500`: 服务器内部错误

#### 1.2 创建用户

**POST** `/api/user`

**请求体**:
```json
{
  "username": "用户名",
  "phone": "13800138000",
  "password": "用户密码"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "username": "用户名",
    "phone": "13800138000",
    "createTime": "2024-12-20T00:00:00.000Z",
    "updateTime": "2024-12-20T00:00:00.000Z"
  },
  "message": "用户创建成功"
}
```

**错误响应**:
- `400`: 缺少必需参数或手机号格式不正确
- `409`: 该手机号已注册
- `500`: 服务器内部错误

#### 1.3 更新用户信息

**PUT** `/api/user`

**请求体**:
```json
{
  "id": "user123",
  "username": "新用户名",
  "phone": "13800138001",
  "password": "新密码"
}
```

*注意: 除了id外，其他字段都是可选的*

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "username": "新用户名",
    "phone": "13800138001",
    "createTime": "2024-01-15T00:00:00.000Z",
    "updateTime": "2024-12-20T10:30:00.000Z"
  },
  "message": "用户信息更新成功"
}
```

**错误响应**:
- `400`: 缺少必需参数或手机号格式不正确
- `404`: 用户不存在
- `409`: 该手机号已被其他用户使用
- `500`: 服务器内部错误

#### 1.4 删除用户

**DELETE** `/api/user`

**查询参数**:
- `id` (string, 必需): 用户ID

**响应示例**:
```json
{
  "success": true,
  "message": "用户删除成功"
}
```

**错误响应**:
- `400`: 缺少必需参数
- `404`: 用户不存在
- `500`: 服务器内部错误

### 2. 用户统计信息

#### 2.1 获取用户统计信息

**GET** `/api/user/stats`

**查询参数**:
- `id` (string, 必需): 用户ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "totalFragments": 156,
    "totalChats": 42,
    "activeToday": 8,
    "joinDays": 340,
    "lastActiveTime": "2024-12-20T10:30:00.000Z"
  }
}
```

**错误响应**:
- `400`: 缺少必需参数
- `404`: 用户不存在
- `500`: 服务器内部错误

#### 2.2 更新用户活跃时间

**PUT** `/api/user/stats`

**请求体**:
```json
{
  "userId": "user123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "lastActiveTime": "2024-12-20T10:30:00.000Z"
  },
  "message": "活跃时间更新成功"
}
```

**错误响应**:
- `400`: 缺少必需参数
- `404`: 用户不存在
- `500`: 服务器内部错误

### 3. 用户认证

#### 3.1 用户登录

**POST** `/api/user/auth`

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "用户密码",
  "action": "login"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "user123",
    "username": "知识探索者",
    "phone": "13800138000",
    "createTime": "2024-01-15T00:00:00.000Z",
    "updateTime": "2024-12-20T10:30:00.000Z"
  },
  "message": "登录成功"
}
```

**错误响应**:
- `400`: 缺少必需参数
- `401`: 密码错误
- `404`: 用户不存在
- `500`: 服务器内部错误

#### 3.2 密码验证

**POST** `/api/user/auth`

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "用户密码",
  "action": "verify"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "isValid": true
  },
  "message": "密码验证成功"
}
```

**错误响应**:
- `400`: 缺少必需参数
- `404`: 用户不存在
- `500`: 服务器内部错误

#### 3.3 修改密码

**PUT** `/api/user/auth`

**请求体**:
```json
{
  "userId": "user123",
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "密码修改成功"
}
```

**错误响应**:
- `400`: 缺少必需参数或新密码长度不足
- `401`: 原密码错误
- `404`: 用户不存在
- `500`: 服务器内部错误

## 客户端使用示例

### 使用 UserApiService 类

```typescript
import { UserApiService } from '@/api-requests/user'

// 获取用户信息
const userResponse = await UserApiService.getUserById('user123')
if (userResponse.success) {
  console.log('用户信息:', userResponse.data)
}

// 用户登录
const loginResponse = await UserApiService.login('13800138000', 'password')
if (loginResponse.success) {
  console.log('登录成功:', loginResponse.data)
}
```

### 使用便捷的函数式API

```typescript
import { userApi } from '@/api-requests/user'

// 获取用户统计信息
const statsResponse = await userApi.getStats('user123')
if (statsResponse.success) {
  console.log('统计信息:', statsResponse.data)
}

// 修改密码
const changePasswordResponse = await userApi.changePassword(
  'user123',
  'oldPassword',
  'newPassword'
)
if (changePasswordResponse.success) {
  console.log('密码修改成功')
}
```

## 注意事项

1. **密码安全**: 密码在存储时会自动进行哈希处理，前端传输的是明文密码
2. **手机号格式**: 必须是11位数字，以1开头，第二位为3-9
3. **密码强度**: 新密码长度至少6位
4. **数据验证**: 所有API都会进行参数验证，无效参数会返回400错误
5. **错误处理**: 建议在客户端对所有API调用进行错误处理
6. **统计数据**: 目前统计功能返回模拟数据，实际项目中需要根据fragments和chats集合进行统计

## 待完善功能

1. **JWT认证**: 当前未实现JWT token机制
2. **权限控制**: 未实现用户权限和角色管理
3. **数据统计**: 需要实现真实的fragments和chats统计
4. **头像上传**: 用户头像上传功能
5. **邮箱验证**: 邮箱注册和验证功能