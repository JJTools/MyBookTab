'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiEdit2, FiTrash2, FiPlusCircle, FiList, FiBookmark, FiHome } from 'react-icons/fi';
import Link from 'next/link';

interface PublicBookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  category?: string;
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<PublicBookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<PublicBookmark | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // 书签表单状态
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [icon, setIcon] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 分类管理
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

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
      fetchPublicBookmarks();
      fetchCategories();
    } catch (error) {
      console.error('检查管理员状态错误:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('public_bookmarks')
        .select('*')
        .order('category, title');

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('获取公共书签错误:', error);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('获取分类错误:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('');
    setSelectedCategoryId('');
    setIcon('');
    setIsActive(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 验证
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }
    
    if (!url.trim()) {
      setError('URL不能为空');
      return;
    }
    
    try {
      // 确保URL格式正确
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        const newUrl = `https://${url}`;
        setUrl(newUrl);
      }
      
      const bookmarkData = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        category_id: selectedCategoryId || null, 
        icon: icon.trim() || null,
        is_active: isActive
      };
      
      if (editingBookmark) {
        // 更新书签
        const { error } = await supabase
          .from('public_bookmarks')
          .update(bookmarkData)
          .eq('id', editingBookmark.id);
          
        if (error) throw error;
      } else {
        // 添加新书签
        const { error } = await supabase
          .from('public_bookmarks')
          .insert([bookmarkData]);
          
        if (error) throw error;
      }
      
      // 重新获取数据
      fetchPublicBookmarks();
      
      // 重置表单
      resetForm();
      setEditingBookmark(null);
      setIsAdding(false);
    } catch (error) {
      console.error('保存书签错误:', error);
      setError('保存失败，请重试');
    }
  };

  const handleEdit = (bookmark: PublicBookmark) => {
    setEditingBookmark(bookmark);
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setDescription(bookmark.description || '');
    setCategory(bookmark.category || '');
    setIcon(bookmark.icon || '');
    setIsActive(bookmark.is_active);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个公共书签吗？')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('public_bookmarks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // 重新获取数据
      fetchPublicBookmarks();
    } catch (error) {
      console.error('删除书签错误:', error);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setEditingBookmark(null);
    setIsAdding(true);
    setShowCategoryForm(false);
  };

  const handleCancel = () => {
    resetForm();
    setEditingBookmark(null);
    setIsAdding(false);
  };
  
  // 分类管理功能
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError(null);
    
    if (!newCategoryName.trim()) {
      setCategoryFormError('分类名称不能为空');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }]);
        
      if (error) throw error;
      
      fetchCategories();
      setNewCategoryName('');
      setCategoryFormError(null);
    } catch (error) {
      console.error('添加分类错误:', error);
      setCategoryFormError('添加分类失败，请重试');
    }
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      setCategoryFormError('分类名称不能为空');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: newCategoryName.trim() })
        .eq('id', editingCategory.id);
        
      if (error) throw error;
      
      fetchCategories();
      setEditingCategory(null);
      setNewCategoryName('');
      setCategoryFormError(null);
    } catch (error) {
      console.error('更新分类错误:', error);
      setCategoryFormError('更新分类失败，请重试');
    }
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setShowCategoryForm(true);
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('确定要删除此分类吗？相关书签的分类将会被清空')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      fetchCategories();
      fetchPublicBookmarks(); // 刷新书签数据，因为可能有书签关联了被删除的分类
    } catch (error) {
      console.error('删除分类错误:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-red-600">无权访问此页面</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-1">管理公共书签</h1>
            <p className="text-textSecondary">
              这些书签将在首页对所有访问者展示
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="cartoon-btn-outline flex items-center">
              <FiHome className="mr-1" /> 首页
            </Link>
            <button
              onClick={() => {
                setShowCategoryForm(!showCategoryForm);
                setIsAdding(false);
                setEditingCategory(null);
                setNewCategoryName('');
              }}
              className="cartoon-btn-secondary flex items-center"
            >
              <FiList className="mr-1" /> {showCategoryForm ? '关闭分类管理' : '管理分类'}
            </button>
            <button
              onClick={handleAddNew}
              className="cartoon-btn-primary flex items-center"
            >
              <FiPlusCircle className="mr-1" /> 添加书签
            </button>
            <button
              onClick={handleSignOut}
              className="cartoon-btn-outline"
            >
              退出
            </button>
          </div>
        </header>

        {showCategoryForm && (
          <div className="cartoon-card p-6 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {editingCategory ? '编辑分类' : '添加分类'}
            </h2>
            
            {categoryFormError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl border-2 border-red-200">
                {categoryFormError}
              </div>
            )}
            
            <form onSubmit={editingCategory ? undefined : handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-bold text-textPrimary mb-1">
                  分类名称
                </label>
                <input
                  id="categoryName"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="cartoon-input w-full"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCategoryName('');
                    }}
                    className="cartoon-btn-secondary"
                  >
                    取消
                  </button>
                )}
                <button
                  type={editingCategory ? 'button' : 'submit'}
                  onClick={editingCategory ? handleUpdateCategory : undefined}
                  className="cartoon-btn-primary"
                >
                  {editingCategory ? '更新' : '添加'}
                </button>
              </div>
            </form>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold text-textPrimary mb-4">所有分类</h3>
              {categories.length === 0 ? (
                <p className="text-textSecondary py-2">暂无分类</p>
              ) : (
                <ul className="space-y-2">
                  {categories.map(category => (
                    <li 
                      key={category.id}
                      className="flex justify-between items-center p-3 bg-cardBg rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium text-textPrimary">{category.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-secondary hover:bg-secondary/10 p-2 rounded-full transition-colors"
                          aria-label="编辑"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-accent hover:bg-accent/10 p-2 rounded-full transition-colors"
                          aria-label="删除"
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
        )}

        {(isAdding || editingBookmark) && (
          <div className="cartoon-card p-6 mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">
              {editingBookmark ? '编辑书签' : '添加新书签'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl border-2 border-red-200">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-bold text-textPrimary mb-1">
                    标题 *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="cartoon-input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-sm font-bold text-textPrimary mb-1">
                    URL *
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="cartoon-input w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-textPrimary mb-1">
                  描述
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="cartoon-input w-full"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-bold text-textPrimary mb-1">
                    分类
                  </label>
                  <select
                    id="categorySelect"
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      const selected = categories.find(c => c.id === e.target.value);
                      if (selected) {
                        setCategory(selected.name);
                      } else {
                        setCategory('');
                      }
                    }}
                    className="cartoon-input w-full"
                  >
                    <option value="">选择分类或输入自定义分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="customCategory" className="block text-sm font-bold text-textPrimary mb-1">
                    自定义分类
                  </label>
                  <input
                    id="customCategory"
                    type="text"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSelectedCategoryId('');
                    }}
                    className="cartoon-input w-full"
                    placeholder="如不在列表中，请输入"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="icon" className="block text-sm font-bold text-textPrimary mb-1">
                  图标URL
                </label>
                <input
                  id="icon"
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="cartoon-input w-full"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2 cartoon-checkbox"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-textPrimary">
                  启用（公开显示）
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
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
                  {editingBookmark ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="cartoon-card overflow-hidden p-0">
          <div className="p-4 bg-primary/10">
            <h2 className="text-2xl font-bold text-textPrimary">所有公共书签</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-primary/5 border-b-2 border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-textPrimary">标题</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-textPrimary">URL</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-textPrimary">分类</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-textPrimary">状态</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-textPrimary">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookmarks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-textSecondary">
                      暂无公共书签，请添加
                    </td>
                  </tr>
                ) : (
                  bookmarks.map((bookmark) => (
                    <tr key={bookmark.id} className={!bookmark.is_active ? 'text-textSecondary opacity-60' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {bookmark.icon && (
                            <img src={bookmark.icon} alt="" className="w-5 h-5 mr-2 rounded-md" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          )}
                          <span className="font-medium text-textPrimary">{bookmark.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {bookmark.url.length > 40 ? `${bookmark.url.substring(0, 40)}...` : bookmark.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-textPrimary">{bookmark.category || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${bookmark.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {bookmark.is_active ? '已启用' : '已禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(bookmark)}
                          className="text-secondary hover:bg-secondary/10 p-2 rounded-full transition-colors"
                          aria-label="编辑"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(bookmark.id)}
                          className="text-accent hover:bg-accent/10 p-2 rounded-full transition-colors ml-1"
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
    </div>
  );
} 