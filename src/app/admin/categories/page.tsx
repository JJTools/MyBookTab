'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FiEdit2, FiTrash2, FiPlusCircle, FiArrowLeft } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // 表单状态
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      // 获取当前用户
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      // 检查用户是否是管理员
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single();
      
      if (error || !data) {
        router.push('/');
        return;
      }
      
      setIsAdmin(true);
      fetchCategories();
    } catch (error) {
      console.error('检查管理员状态错误:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmark_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('获取分类错误:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 验证
    if (!name.trim()) {
      setError('分类名称不能为空');
      return;
    }
    
    try {
      const categoryData = {
        name: name.trim()
      };
      
      if (editingCategory) {
        // 更新分类
        const { error } = await supabase
          .from('bookmark_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
          
        if (error) throw error;
      } else {
        // 添加新分类
        const { error } = await supabase
          .from('bookmark_categories')
          .insert([categoryData]);
          
        if (error) throw error;
      }
      
      // 重新获取数据
      fetchCategories();
      
      // 重置表单
      resetForm();
      setEditingCategory(null);
      setIsAdding(false);
    } catch (error) {
      console.error('保存分类错误:', error);
      setError('保存失败，请重试');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个分类吗？关联的书签将保留但不再属于任何分类。')) {
      return;
    }
    
    try {
      // 首先更新所有使用此分类的书签
      await supabase
        .from('public_bookmarks')
        .update({ category: null })
        .eq('category_id', id);
        
      // 然后删除分类
      const { error } = await supabase
        .from('bookmark_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // 重新获取数据
      fetchCategories();
    } catch (error) {
      console.error('删除分类错误:', error);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setEditingCategory(null);
    setIsAdding(true);
  };

  const handleCancel = () => {
    resetForm();
    setEditingCategory(null);
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-macos-gray-500 dark:text-macos-gray-400">加载中...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-red-600 dark:text-red-500">无权访问此页面</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-macos-gray-500 hover:text-macos-gray-700 dark:text-macos-gray-400 dark:hover:text-macos-gray-300">
                <FiArrowLeft size={18} />
              </Link>
              <h1 className="text-3xl font-medium">管理分类</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              添加和管理书签分类
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleAddNew}
              className="cartoon-btn-primary flex items-center"
            >
              <FiPlusCircle className="mr-1" /> 添加分类
            </button>
          </div>
        </header>

        {(isAdding || editingCategory) && (
          <div className="cartoon-card p-6 mb-8">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {editingCategory ? '编辑分类' : '添加新分类'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="分类名称"
                  className="cartoon-input"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cartoon-btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="cartoon-btn-primary"
                >
                  {editingCategory ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="cartoon-card overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary/5">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-textPrimary tracking-wider">分类名称</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-textPrimary tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-textSecondary">
                    暂无分类，请添加
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-textPrimary">{category.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="text-secondary hover:bg-secondary/10 p-2 rounded-full inline-flex transition-colors mr-3"
                        aria-label="编辑"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="text-accent hover:bg-accent/10 p-2 rounded-full inline-flex transition-colors"
                        aria-label="删除"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 