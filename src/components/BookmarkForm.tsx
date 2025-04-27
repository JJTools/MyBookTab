'use client';

import { useState, useEffect, useRef } from 'react';
import { Bookmark, Category } from '@/types';
import { getCategories } from '@/lib/api';
import { FiChevronDown, FiX, FiPlus, FiFolder } from 'react-icons/fi';

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
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    
    // 强制同步分类数据
    const syncCategories = async () => {
      await fetchCategories();
    };
    
    syncCategories();
  }, []);

  useEffect(() => {
    // 如果有分类且未选择分类，选择第一个分类作为默认值
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
      setCategory(categories[0].name);
    }
  }, [categories, categoryId]);

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

  // 点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        setFetchingWebInfo(false);
        return;
      }
      
      // 调用API获取网站信息
      try {
        const response = await fetch('/api/fetch-web-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: formattedUrl }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '获取网站信息失败');
        }
        
        const data = await response.json();
        
        // 只在字段为空时设置值
        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();
        const trimmedIcon = icon.trim();
        
        // 设置标题, 仅当尚未填写时
        if (!trimmedTitle && data.title) {
          setTitle(data.title);
        }
        
        // 设置描述, 仅当尚未填写时
        if (!trimmedDescription && data.description) {
          setDescription(data.description);
        }
        
        // 设置图标URL, 仅当尚未填写时
        if (!trimmedIcon && data.icon) {
          setIcon(data.icon);
        }
        
        setFetchingWebInfo(false);
      } catch (error) {
        console.error('API调用错误:', error);
        
        // 若API调用失败，退回到本地解析方法
        const urlObj = new URL(formattedUrl);
        const domain = urlObj.hostname.replace('www.', '');
        
        // 只在字段为空时设置值
        const trimmedTitle = title.trim();
        const trimmedIcon = icon.trim();
        
        // 设置简单的标题，仅当尚未填写时
        if (!trimmedTitle) {
          setTitle(domain.charAt(0).toUpperCase() + domain.slice(1));
        }
        
        // 设置默认图标路径，仅当尚未填写时
        if (!trimmedIcon) {
          setIcon(`${urlObj.protocol}//${urlObj.hostname}/favicon.ico`);
        }
        
        setFetchingWebInfo(false);
      }
    } catch (error) {
      console.error('获取网站信息错误:', error);
      setError('无法获取网站信息，请手动填写');
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
      let formattedUrl = url;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
        setUrl(formattedUrl);
      }
      
      new URL(formattedUrl.trim());
      
      const bookmarkData = {
        ...(bookmark ? { id: bookmark.id } : {}),
        title: title.trim(),
        url: formattedUrl.trim(),
        description: description.trim() || null,
        category: category.trim(), // 始终保存分类名称
        category_id: categoryId,  // 同时保存分类ID
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
  const handleCategoryChange = (categoryItem: Category | null) => {
    if (!categoryItem) {
      setCategoryId(null);
      setCategory('');
    } else {
      setCategoryId(categoryItem.id);
      setCategory(categoryItem.name);
    }
    setIsCategoryDropdownOpen(false);
  };
  
  // 获取当前选中的分类显示名称
  const getSelectedCategoryName = () => {
    if (categoryId) {
      const selectedCategory = categories.find(c => c.id === categoryId);
      return selectedCategory ? selectedCategory.name : categories.length > 0 ? categories[0].name : '无分类';
    }
    return categories.length > 0 ? categories[0].name : '无分类';
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
          <label htmlFor="title" className="block text-base font-bold mb-2 text-primary dark:text-primary-400">
            标题 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="cartoon-input placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="网站名称"
            required
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-base font-bold mb-2 text-primary dark:text-primary-400">
            URL *
          </label>
          <div className="flex gap-2">
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="cartoon-input flex-1 placeholder-gray-500 dark:placeholder-gray-400"
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
        <label htmlFor="description" className="block text-base font-bold mb-2 text-primary dark:text-primary-400">
          描述
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="cartoon-input placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="网站简要描述"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label htmlFor="category" className="block text-base font-bold mb-2 text-primary dark:text-primary-400">
            分类
          </label>
          <div className="relative" ref={categoryDropdownRef}>
            <button 
              type="button"
              className="cartoon-input flex items-center justify-between w-full placeholder-gray-500 dark:placeholder-gray-400"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              disabled={loadingCategories || categories.length === 0}
            >
              <div className="flex items-center">
                <FiFolder className="mr-2 text-secondary" />
                <span>{loadingCategories ? '加载中...' : getSelectedCategoryName()}</span>
              </div>
              <FiChevronDown className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="origin-top-left absolute left-0 mt-2 w-full rounded-xl shadow-cartoon bg-cardBg border-2 border-border z-50 dropdown-animation">
                <div className="py-1 max-h-48 overflow-y-auto">
                  {categories.length === 0 && (
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(null)}
                      className="w-full flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors"
                    >
                      <FiX className="mr-3 h-5 w-5 text-textSecondary" />
                      无分类
                    </button>
                  )}
                  
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full flex items-center px-4 py-2 text-sm hover:bg-background transition-colors ${
                        categoryId === cat.id ? 'text-primary font-medium' : 'text-textPrimary'
                      }`}
                    >
                      <FiFolder className="mr-3 h-5 w-5 text-secondary" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {!hasCategories && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              请先添加分类才能保存书签
            </p>
          )}
        </div>

        <div>
          <label htmlFor="icon" className="block text-base font-bold mb-2 text-primary dark:text-primary-400">
            图标URL
          </label>
          <input
            id="icon"
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="cartoon-input placeholder-gray-500 dark:placeholder-gray-400"
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