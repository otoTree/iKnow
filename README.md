# iKnow - 智能知识碎片管理系统

这是一个基于 Next.js 构建的智能知识碎片管理系统，帮助用户收集、整理和管理知识碎片，构建个人的第二大脑。

## 主要功能

- **知识碎片管理**：创建、编辑、删除和搜索知识碎片
- **智能分类**：AI 自动分类和手动分类管理
- **标签系统**：灵活的标签管理和过滤
- **优先级管理**：设置碎片的重要程度
- **状态跟踪**：跟踪碎片的处理状态
- **第二大脑**：构建知识网络和关联

## 分类管理工作流程

### 自动分类
1. 在创建知识碎片时，AI 会根据内容自动建议分类
2. 系统会分析文本内容，提供最相关的分类建议
3. 用户可以接受建议或手动选择其他分类

### 手动分类管理
1. **访问分类管理**：在侧边栏点击"分类管理"进入 `/categories` 页面
2. **创建分类**：
   - 点击"创建分类"按钮
   - 输入分类名称和描述
   - 选择分类颜色（用于视觉区分）
   - 可选择父分类创建层级结构
3. **编辑分类**：点击分类卡片的编辑按钮修改信息
4. **删除分类**：点击删除按钮，系统会提示确认
5. **层级管理**：支持创建父子分类关系，便于组织管理

### 在碎片中使用分类
1. **创建碎片时**：在碎片输入界面选择合适的分类
2. **查看碎片**：在碎片卡片中可以看到分类标签（带颜色）
3. **筛选碎片**：可以按分类筛选和查找相关碎片

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
