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
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="cartoon-input"
            placeholder="https://example.com"
            required
          />
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
            value={categoryId || (category ? 'custom' : '')}
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
            <option value="custom">自定义分类</option>
          </select>
          
          {/* 如果选择自定义分类，显示输入框 */}
          {(!categoryId && category) || (categoryId === 'custom') ? (
            <input
              id="custom-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="cartoon-input mt-3"
              placeholder="自定义分类名称"
            />
          ) : null}
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
        >
          {bookmark ? '更新' : '添加'}
        </button>
      </div>
    </form>
  );
} 