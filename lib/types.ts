// 碎片管理数据类型定义

// 用户类型定义
export type UserType = {
  _id: string
  username: string
  phone: string
  password: string
  createTime: Date
  updateTime: Date
}

// 用户统计信息
export interface UserStats {
  totalFragments: number
  totalChats: number
  activeToday: number
  joinDays: number
}

// 碎片 Fragment
export interface Fragment {
  id?: number; // 主键（IndexedDB 自动递增）
  title: string; // 标题
  content: string; // 正文内容
  tags: string[]; // 关联标签名称
  category?: string; // 所属分类名称（可选，向后兼容）
  categoryId?: number; // 所属分类ID（可选，新的分类关联方式）
  priority: "low" | "medium" | "high"; // 优先级
  status: "draft" | "active" | "archived"; // 状态
  createdAt: Date; // 创建时间
  updatedAt: Date; // 最近更新时间
  lastAccessedAt?: Date; // 最近访问时间（可选）
  metadata?: {
    wordCount: number; // 字数
    readingTime: number; // 预估阅读时长（分钟）
    source?: string; // 来源（可选，如网址）
    attachments?: string[]; // 附件 URL 列表（可选）
  };
}

// 标签 Tag
export interface Tag {
  id?: number;
  name: string; // 标签名称（唯一）
  color: string; // 颜色 HEX
  description?: string; // 描述（可选）
  createdAt: Date; // 创建时间
  usageCount: number; // 被引用次数
}

// 分类 Category
export interface Category {
  id?: number;
  name: string; // 分类名称（唯一）
  description?: string; // 描述（可选）
  color: string; // 颜色 HEX
  parentId?: number; // 父分类 id（可选，支持多级分类）
  createdAt: Date; // 创建时间
}

// 碎片之间的关联关系
export interface FragmentRelation {
  id?: number;
  sourceId: number; // 源碎片 id
  targetId: number; // 目标碎片 id
  relationType: "reference" | "similar" | "opposite" | "extends"; // 关系类型
  strength: number; // 关联强度 0–1
  createdAt: Date; // 创建时间
}

// 搜索历史
export interface SearchHistory {
  id?: number;
  query: string; // 搜索关键字
  resultCount: number; // 返回结果数量
  createdAt: Date; // 搜索时间
}

// 碎片过滤条件
export interface FragmentFilter {
  searchQuery?: string; // 搜索关键字
  tags?: string[]; // 标签过滤
  category?: string; // 分类过滤
  priority?: Fragment["priority"]; // 优先级过滤
  status?: Fragment["status"]; // 状态过滤
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 碎片排序选项
export interface FragmentSort {
  field: "createdAt" | "updatedAt" | "title" | "priority" | "lastAccessedAt";
  order: "asc" | "desc";
}

// 分页参数
export interface Pagination {
  page: number; // 当前页码（从1开始）
  pageSize: number; // 每页条数
  total?: number; // 总条数
}

// API 响应格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 碎片列表响应
export interface FragmentListResponse {
  fragments: Fragment[];
  pagination: Pagination;
  filters: FragmentFilter;
  sort: FragmentSort;
}

