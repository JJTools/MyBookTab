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
  const [fetchingWebInfo, setFetchingWebInfo] = useState(false);

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

  const fetchWebsiteInfo = async () => {
    if (!url) return;
    
    try {
      setFetchingWebInfo(true);
      setError(null);
      
      // 确保URL格式正确
      let formattedUrl = url;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      // 验证URL
      try {
        new URL(formattedUrl);
      } catch (err) {
        setError('请输入有效的URL');
        return;
      }
      
      // 创建一个代理请求来获取网站信息
      const response = await fetch(`/api/fetch-website-info?url=${encodeURIComponent(formattedUrl)}`);
      
      if (!response.ok) {
        throw new Error('获取网站信息失败');
      }
      
      const data = await response.json();
      
      if (data.title) {
        setTitle(data.title);
      }
      
      if (data.description) {
        setDescription(data.description);
      }
      
      if (data.icon) {
        setIcon(data.icon);
      }
      
    } catch (error) {
      console.error('获取网站信息错误:', error);
      setError('无法获取网站信息，请手动填写');
    } finally {
      setFetchingWebInfo(false);
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
    if (value === '') {
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

  // 是否有分类可选
  const hasCategories = categories.length > 0;

  return (
    <form onSubmit={handleSubmit} className="cartoon-card p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl border-2 border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="title" className="block text-base font-bold mb-2 text-gray-800 dark:text-white">
            标题 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="cartoon-input"
            placeholder="网站名称"
            required
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-base font-bold mb-2 text-gray-800 dark:text-white">
            URL *
          </label>
          <div className="flex gap-2">
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="cartoon-input flex-1"
              placeholder="https://example.com"
              required
            />
            <button 
              type="button" 
              onClick={fetchWebsiteInfo}
              disabled={!url || fetchingWebInfo}
              className="cartoon-btn-primary whitespace-nowrap"
            >
              {fetchingWebInfo ? '获取中...' : '获取信息'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="description" className="block text-base font-bold mb-2 text-gray-800 dark:text-white">
          描述
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="cartoon-input"
          placeholder="网站简要描述"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label htmlFor="category" className="block text-base font-bold mb-2 text-gray-800 dark:text-white">
            分类
          </label>
          <select
            id="category-select"
            value={categoryId || ''}
            onChange={handleCategoryChange}
            className="cartoon-input"
            disabled={loadingCategories}
          >
            <option value="">无分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          
          {!hasCategories && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              请先添加分类才能保存书签
            </p>
          )}
        </div>

        <div>
          <label htmlFor="icon" className="block text-base font-bold mb-2 text-gray-800 dark:text-white">
            图标URL
          </label>
          <input
            id="icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="cartoon-input"
            placeholder="图标链接地址"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="cartoon-btn-secondary"
        >
          取消
        </button>
        <button
          type="submit"
          className="cartoon-btn-primary"
          disabled={!hasCategories}
        >
          {bookmark ? '更新' : '添加'}
        </button>
      </div>
    </form>
  );
} 