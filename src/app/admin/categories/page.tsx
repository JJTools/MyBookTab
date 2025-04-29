'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiEdit2, FiTrash2, FiPlusCircle, FiArrowLeft } from 'react-icons/fi';
import { useTranslation } from '@/lib/i18n';

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
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('public_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (profile?.is_admin) {
          setIsAdmin(true);
          fetchCategories();
        } else {
          setIsAdmin(false);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error(t('errors.checkAdminError'), error);
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
      console.error(t('errors.fetchCategoriesError'), error);
    }
  };

  const resetForm = () => {
    setName('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('categories.categoryNameRequired'));
      return;
    }
    
    try {
      const categoryData = {
        name: name.trim(),
      };
      
      if (editingCategory) {
        // 更新现有分类
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
      console.error(t('errors.saveCategoryError'), error);
      setError(t('errors.saveFailedRetry'));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('categories.deleteConfirmWithoutBookmarks'))) {
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
      console.error(t('errors.deleteCategoryError'), error);
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
        <p className="text-xl text-macos-gray-500 dark:text-macos-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-red-600 dark:text-red-500">{t('common.noAccessToPage')}</p>
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
              <h1 className="text-3xl font-medium">{t('categories.manageCategories')}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {t('categories.addAndManageBookmarkCategories')}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleAddNew}
              className="cartoon-btn-primary flex items-center"
            >
              <FiPlusCircle className="mr-1" /> {t('categories.addCategory')}
            </button>
          </div>
        </header>

        {(isAdding || editingCategory) && (
          <div className="cartoon-card p-6 mb-8">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {editingCategory ? t('categories.editCategory') : t('categories.addNewCategory')}
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
                  placeholder={t('categories.categoryName')}
                  className="cartoon-input"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cartoon-btn-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="cartoon-btn-primary"
                >
                  {editingCategory ? t('common.update') : t('common.add')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="cartoon-card overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary/5">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-textPrimary tracking-wider">{t('categories.categoryName')}</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-textPrimary tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-textSecondary">
                    {t('categories.noCategoriesToAdd')}
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
                        aria-label={t('common.edit')}
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="text-accent hover:bg-accent/10 p-2 rounded-full inline-flex transition-colors"
                        aria-label={t('common.delete')}
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