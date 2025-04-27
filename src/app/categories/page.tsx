'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiX, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import useConfirmDialog from '@/components/useConfirmDialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  useEffect(() => {
    checkUser();
  }, [router]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      router.push('/login');
      return;
    }
    
    setUser(data.session.user);
    fetchCategories();
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败', error);
      setError('获取分类失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError('分类名称不能为空');
      return;
    }

    setIsLoading(true);
    try {
      await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      fetchCategories();
      setError(null);
    } catch (error) {
      console.error('添加分类失败', error);
      setError('添加分类失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editName.trim()) {
      setError('分类名称不能为空');
      return;
    }

    try {
      await updateCategory(editingCategory.id, { name: editName.trim() });
      setEditingCategory(null);
      fetchCategories();
      setError(null);
    } catch (error) {
      console.error('更新分类失败', error);
      setError('更新分类失败，请重试');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      // 第一步：确认是否要删除
      const confirmed = await confirm({
        title: '删除分类',
        message: `您确定要删除"${name}"分类吗？`,
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
      });
      
      if (!confirmed) return;
      
      // 第二步：确认删除选项
      const deleteWithBookmarks = await confirm({
        title: '删除选项',
        message: `请选择删除方式：是否同时删除"${name}"分类下的所有书签？`,
        type: 'danger',
        confirmText: '是，删除所有相关书签',
        cancelText: '否，仅删除分类'
      });
      
      // 开始执行删除操作
      setIsLoading(true);
      setError(null);
      
      try {
        // 处理书签关联
        if (deleteWithBookmarks) {
          // 先获取分类下的所有书签
          const { data: bookmarks, error: fetchError } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('category_id', id);
            
          if (fetchError) {
            console.error('获取书签失败:', fetchError);
            throw new Error(`获取书签失败: ${fetchError.message}`);
          }
          
          if (bookmarks && bookmarks.length > 0) {
            // 删除分类下的所有书签
            const { error: deleteError } = await supabase
              .from('bookmarks')
              .delete()
              .eq('category_id', id);
              
            if (deleteError) {
              console.error('删除书签失败:', deleteError);
              throw new Error(`删除书签失败: ${deleteError.message}`);
            }
          }
        } else {
          // 仅更新书签，移除分类关联
          const { error: updateError } = await supabase
            .from('bookmarks')
            .update({ category_id: null, category: null })
            .eq('category_id', id);
            
          if (updateError) {
            console.error('更新书签失败:', updateError);
            throw new Error(`更新书签失败: ${updateError.message}`);
          }
        }
        
        // 最后删除分类
        await deleteCategory(id);
        
        // 成功后刷新分类列表
        await fetchCategories();
      } catch (error: any) {
        console.error('删除分类或操作书签失败:', error);
        setError(`操作失败: ${error?.message || '未知错误'}`);
      } finally {
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('删除分类流程错误:', error);
      setError(`删除分类失败: ${error?.message || '未知错误'}`);
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">加载中...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {dialog}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-textPrimary">分类管理</h1>
        <Link href="/bookmarks" className="cartoon-btn-secondary flex items-center">
          <FiArrowLeft className="mr-1" /> 返回书签
        </Link>
      </div>

      {/* 添加新分类 */}
      <div className="cartoon-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">添加新分类</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div className="flex">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="输入分类名称"
              className="cartoon-input w-full"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="cartoon-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '添加中...' : '添加分类'}
            </button>
          </div>
        </form>
      </div>

      {/* 我的分类列表 */}
      <div className="cartoon-card p-6">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">我的分类</h2>
        
        {categories.length === 0 ? (
          <p className="text-textSecondary py-4">您还没有添加任何分类</p>
        ) : (
          <ul className="space-y-3 mt-2">
            {categories.map((category) => (
              <li 
                key={category.id} 
                className="flex justify-between items-center p-3 hover:bg-primary/5 rounded-lg transition-colors"
              >
                {editingCategory && editingCategory.id === category.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="cartoon-input flex-1"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateCategory}
                      className="cartoon-btn-primary p-3"
                      title="保存"
                    >
                      <FiCheck size={18} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="cartoon-btn-secondary p-3"
                      title="取消"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between w-full items-center">
                    <span className="text-lg font-medium text-textPrimary">{category.name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="text-secondary hover:bg-secondary/10 p-2 rounded-full inline-flex transition-colors"
                        aria-label="编辑"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="text-accent hover:bg-accent/10 p-2 rounded-full inline-flex transition-colors"
                        aria-label="删除"
                        disabled={isLoading}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 