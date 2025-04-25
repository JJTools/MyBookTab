'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiEdit2, FiTrash2, FiPlusCircle } from 'react-icons/fi';

interface PublicBookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  category?: string;
  is_active: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<PublicBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<PublicBookmark | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // 表单状态
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('');
  const [isActive, setIsActive] = useState(true);
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
      fetchPublicBookmarks();
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

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('');
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
  };

  const handleCancel = () => {
    resetForm();
    setEditingBookmark(null);
    setIsAdding(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-medium mb-1">管理公共书签</h1>
            <p className="text-gray-600 dark:text-gray-300">
              这些书签将在首页对所有访问者展示
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleAddNew}
              className="macos-btn-primary flex items-center"
            >
              <FiPlusCircle className="mr-1" /> 添加书签
            </button>
            <button
              onClick={handleSignOut}
              className="macos-btn-secondary"
            >
              退出
            </button>
          </div>
        </header>

        {(isAdding || editingBookmark) && (
          <div className="macos-card p-6 mb-8">
            <h2 className="text-2xl font-medium mb-4">
              {editingBookmark ? '编辑书签' : '添加新书签'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    标题 *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="macos-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-sm font-medium mb-1">
                    URL *
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="macos-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  描述
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="macos-input"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                    分类
                  </label>
                  <input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="macos-input"
                  />
                </div>
                
                <div>
                  <label htmlFor="icon" className="block text-sm font-medium mb-1">
                    图标URL
                  </label>
                  <input
                    id="icon"
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="macos-input"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded mr-2 text-macos-blue-light dark:text-macos-blue-dark focus:ring-macos-blue-light dark:focus:ring-macos-blue-dark"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  启用（公开显示）
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="macos-btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="macos-btn-primary"
                >
                  {editingBookmark ? '更新' : '添加'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="macos-card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-macos-gray-50 dark:bg-macos-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">分类</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-macos-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {bookmarks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    暂无公共书签，请添加
                  </td>
                </tr>
              ) : (
                bookmarks.map((bookmark) => (
                  <tr key={bookmark.id} className={!bookmark.is_active ? 'text-gray-400' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {bookmark.icon && (
                          <img src={bookmark.icon} alt="" className="w-5 h-5 mr-2 rounded-md" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        )}
                        <span className="font-medium">{bookmark.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-macos-blue-light dark:text-macos-blue-dark hover:opacity-80">
                        {bookmark.url.length > 40 ? `${bookmark.url.substring(0, 40)}...` : bookmark.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{bookmark.category || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${bookmark.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                        {bookmark.is_active ? '已启用' : '已禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(bookmark)}
                        className="text-macos-blue-light dark:text-macos-blue-dark hover:opacity-80 mr-3"
                        aria-label="编辑"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(bookmark.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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