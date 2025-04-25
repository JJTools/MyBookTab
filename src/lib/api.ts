import { supabase } from './supabase';
import { Category } from '@/types';

// 获取用户的所有分类
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('获取分类失败:', error);
    throw error;
  }

  return data || [];
}

// 创建新分类
export async function createCategory(category: { name: string }): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('创建分类失败:', error);
    throw error;
  }

  return data;
}

// 更新分类
export async function updateCategory(id: string, category: { name: string }): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id);

  if (error) {
    console.error('更新分类失败:', error);
    throw error;
  }
}

// 删除分类
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('删除分类失败:', error);
    throw error;
  }
} 