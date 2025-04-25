# MyBookTab - 网页书签导航站

MyBookTab是一个简洁高效的网页书签管理系统，使用Next.js和Supabase构建，并部署在Vercel上。用户可以登录后添加、编辑和删除自己的书签，将常用网站集中管理。

## 功能特点

- 🔐 用户认证系统
- 📚 书签管理（添加、编辑、删除）
- 🔍 搜索和筛选功能
- 📱 响应式设计，适配各种设备
- 🌙 深色模式支持

## 技术栈

- **前端框架**: Next.js
- **样式**: TailwindCSS
- **数据库**: Supabase
- **部署**: Vercel

## 部署指南

### 环境准备

1. 创建[Supabase](https://supabase.com/)账户并创建新项目
2. 创建[Vercel](https://vercel.com/)账户

### Supabase数据库设置

1. 在Supabase控制台中创建以下表:

```sql
-- 创建书签表
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 设置RLS策略
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看自己的书签" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的书签" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的书签" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的书签" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

2. 在Supabase中设置认证:
   - 启用电子邮件验证

### 部署到Vercel

1. 在Vercel仪表板中点击"New Project"
2. 导入该Git仓库
3. 添加环境变量:
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
   NEXT_PUBLIC_SITE_NAME=MyBookTab
   ```
4. 点击"Deploy"

项目将自动部署到Vercel，每次推送代码更改时都会自动更新。

## 本地开发

1. 克隆仓库
2. 安装依赖:
   ```
   npm install
   ```
3. 创建`.env.local`文件并添加Supabase配置
4. 启动开发服务器:
   ```
   npm run dev
   ```

## 许可

MIT 