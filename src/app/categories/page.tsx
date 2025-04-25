'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('分类名称不能为空');
      return;
    }

    try {
      await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      fetchCategories();
      setError(null);
    } catch (error) {
      console.error('添加分类失败', error);
      setError('添加分类失败，请重试');
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

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('确定要删除此分类吗？')) {
      return;
    }
    
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error('删除分类失败', error);
      setError('删除分类失败，请重试');
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">分类管理</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            管理您的书签分类
          </p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">添加新分类</h2>
          
          <div className="flex">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="分类名称"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
            >
              <FiPlus className="mr-1" /> 添加
            </button>
          </div>
        </div>

        {editingCategory && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">编辑分类</h2>
            
            <div className="flex mb-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="分类名称"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                取消
              </button>
              <button
                onClick={handleUpdateCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                更新
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">我的分类</h2>
          </div>
          
          {categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              您还没有创建任何分类
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((category) => (
                <li key={category.id} className="p-4 flex justify-between items-center">
                  <span className="text-lg">{category.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="编辑"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 