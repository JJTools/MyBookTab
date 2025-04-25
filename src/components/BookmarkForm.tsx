'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Category } from '@/types';
import { getCategories } from '@/lib/api';

interface BookmarkFormProps {
  bookmark?: Bookmark;
  onSubmit: (bookmark: any) => void;
  onCancel: () => void;
}

export default function BookmarkForm({ bookmark, onSubmit, onCancel }: BookmarkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [icon, setIcon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title || '');
      setUrl(bookmark.url || '');
      setDescription(bookmark.description || '');
      setCategory(bookmark.category || '');
      setCategoryId(bookmark.category_id || null);
      setIcon(bookmark.icon || '');
    }
  }, [bookmark]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
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
        setUrl(`https://${url}`);
      }
      new URL(url.trim());
      
      const bookmarkData = {
        ...(bookmark ? { id: bookmark.id } : {}),
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || null,
        category: categoryId ? null : category.trim() || null, // 如果有categoryId则不使用自定义分类
        category_id: categoryId,
        icon: icon.trim() || null,
      };
      
      onSubmit(bookmarkData);
      
      if (!bookmark) {
        // 新增书签后清空表单
        setTitle('');
        setUrl('');
        setDescription('');
        setCategory('');
        setCategoryId(null);
        setIcon('');
      }
      
    } catch (err) {
      setError('请输入有效的URL');
    }
  };

  // 处理分类选择变化
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setCategoryId(null);
      // 保留之前的自定义分类
    } else if (value === '') {
      setCategoryId(null);
      setCategory('');
    } else {
      setCategoryId(value);
      // 找到选中的分类名称
      const selectedCategory = categories.find(c => c.id === value);
      if (selectedCategory) {
        setCategory(selectedCategory.name);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            标题 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            placeholder="网站名称"
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            placeholder="https://example.com"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          描述
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
          placeholder="网站简要描述"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            分类
          </label>
          <select
            id="category-select"
            value={categoryId || (category ? 'custom' : '')}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            disabled={loadingCategories}
          >
            <option value="">无分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value="custom">自定义分类</option>
          </select>
          
          {/* 如果选择自定义分类，显示输入框 */}
          {(!categoryId && category) || (categoryId === 'custom') ? (
            <input
              id="custom-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 mt-2"
              placeholder="自定义分类名称"
            />
          ) : null}
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
            placeholder="图标链接地址"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {bookmark ? '更新' : '添加'}
        </button>
      </div>
    </form>
  );
} 