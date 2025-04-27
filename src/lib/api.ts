import { supabase } from './supabase';
import { Category } from '@/types';

// 获取用户的所有分类
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
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
  try {
    console.log('正在调用删除分类API, id:', id);
    
    if (!id) {
      throw new Error('分类ID不能为空');
    }
    
    // 添加多次尝试逻辑
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    let lastError: any = null;
    
    while (attempts < maxAttempts && !success) {
      attempts++;
      console.log(`尝试删除分类 (${attempts}/${maxAttempts})...`);
      
      try {
        // 执行删除操作
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error(`尝试 ${attempts}: 删除分类失败:`, error);
          lastError = error;
          // 等待一小段时间再重试
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else {
          success = true;
          console.log(`成功删除分类 (尝试 ${attempts}/${maxAttempts})`);
        }
      } catch (err) {
        console.error(`尝试 ${attempts}: 删除分类出错:`, err);
        lastError = err;
        // 等待一小段时间再重试
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (!success) {
      throw new Error(`多次尝试后仍无法删除分类: ${lastError?.message || '未知错误'}`);
    }
    
    console.log('删除分类API调用成功, id:', id);
  } catch (error: any) {
    console.error('删除分类操作失败:', error);
    throw new Error(`删除分类失败: ${error?.message || '未知错误'}`);
  }
}

// 更新分类排序顺序
export async function updateCategoryOrder(categoryOrders: {id: string, sort_order: number}[]): Promise<void> {
  try {
    for (const item of categoryOrders) {
      const { error } = await supabase
        .from('categories')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
        
      if (error) {
        console.error(`更新分类 ${item.id} 的排序失败:`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error('批量更新分类排序失败:', error);
    throw error;
  }
} 