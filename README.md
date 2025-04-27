# MyBookTab - 网页书签导航站

MyBookTab是一个简洁高效的网页书签管理系统，使用Next.js和Supabase构建，并部署在Vercel上。用户可以登录后添加、编辑和删除自己的书签，将常用网站集中管理。首页展示管理员配置的公共书签。

## 功能特点

- 🔐 用户认证系统
- 📚 书签管理（添加、编辑、删除）
- 📋 分类管理系统，支持创建和管理自定义分类
- 🏷️ 书签分类功能，可使用预定义分类或自定义分类
- 🌟 首页展示公共书签
- 🔍 搜索和筛选功能
- 📱 响应式设计，适配各种设备
- 🌙 深色模式支持
- 📊 分类排序功能，支持自定义分类显示顺序

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

**重要提示**：请严格按照下面的执行顺序创建表和策略，以避免依赖关系错误。

**第一步：创建基础表**

首先执行以下SQL创建管理员表（这是其他表的RLS策略依赖的表）：

```sql
-- 创建管理员用户表 (必须先创建此表，因为其他表的RLS策略会引用它)
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**第二步：创建分类表**

执行以下SQL创建分类表及其安全策略：

```sql
-- 创建分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT NULL
);

-- 分类表默认权限
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己创建的分类
CREATE POLICY "用户可以查看自己的分类" ON categories
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以添加自己的分类
CREATE POLICY "用户可以添加自己的分类" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的分类
CREATE POLICY "用户可以更新自己的分类" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的分类
CREATE POLICY "用户可以删除自己的分类" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- 超级管理员可以管理所有分类
CREATE POLICY "超级管理员可以管理所有分类" ON categories
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
```

**第三步：创建书签表**

执行以下SQL创建用户书签表：

```sql
-- 创建书签表
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
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

**第四步：创建公共书签表**

最后执行以下SQL创建公共书签表：

```sql
-- 创建公共书签表（首页展示）
CREATE TABLE public_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 公共书签表默认对所有用户可读
ALTER TABLE public_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "所有用户可以查看公共书签" ON public_bookmarks
  FOR SELECT USING (is_active = true);

-- 仅超级管理员可以管理公共书签
CREATE POLICY "只有超级管理员可以管理公共书签" ON public_bookmarks
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
```

**如果是已有系统需要升级**

如果您已经部署了旧版本，需要升级添加分类排序功能，请执行以下SQL：

```sql
-- 为categories表添加sort_order字段
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT NULL;

-- 如果需要，可以初始化现有分类的排序
-- 按名称字母顺序设置初始排序
WITH ranked_categories AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY name) - 1 as new_order
  FROM categories
)
UPDATE categories c
SET sort_order = r.new_order
FROM ranked_categories r
WHERE c.id = r.id;
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

## 管理公共书签

要添加首页展示的公共书签，需要将某个用户设置为管理员：

### 创建管理员用户

1. 首先，需要注册并登录一个用户账号
2. 找到该用户的UUID:
   - 在Supabase控制台中，导航到"Authentication" > "Users"
   - 找到你想设置为管理员的用户，复制其ID(UUID)
   
3. 在Supabase控制台的SQL编辑器中执行以下命令:
   ```sql
   INSERT INTO admin_users (user_id) VALUES ('粘贴用户的UUID在这里');
   ```
   
4. 确认管理员设置成功:
   ```sql
   SELECT * FROM admin_users;
   ```
   应该能看到你添加的用户ID

5. 管理员设置成功后，该用户可以访问`/admin`路径管理公共书签

### 使用管理员界面

1. 管理员登录后访问: `你的网站域名/admin`
2. 在管理界面可以添加、编辑、删除公共书签
3. 添加的公共书签将在首页展示给所有访问者

## 分类管理

1. 用户可以通过点击"管理分类"按钮访问分类管理页面
2. 在分类管理页面可以添加、编辑、删除自己的分类
3. 添加书签时，可以选择使用已创建的分类或使用自定义分类
4. 在书签列表中可以按分类筛选书签

### 分类排序功能

1. 在分类管理页面，点击右上角的"排序分类"按钮进入排序模式
2. 在排序模式下，可以通过上下箭头按钮调整分类的显示顺序
3. 排序完成后，点击"保存排序"按钮保存顺序设置
4. 分类会按照设定的顺序在书签页面中显示

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