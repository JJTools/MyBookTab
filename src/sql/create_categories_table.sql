-- 创建分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
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