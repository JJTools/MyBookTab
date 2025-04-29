'use client';

import { useState, useEffect, useRef } from 'react';
import { Bookmark, Category } from '@/types';
import { FiPlus, FiCheck, FiChevronDown, FiFolder, FiTag, FiLink, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { getCategories, getWebsiteInfo } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

interface BookmarkFormProps {
  bookmark?: Bookmark;
  onSubmit: (bookmark: Bookmark) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function BookmarkForm({ bookmark, onSubmit, onCancel, isEdit = false }: BookmarkFormProps) {
  const [title, setTitle] = useState(bookmark?.title || '');
  const [url, setUrl] = useState(bookmark?.url || '');
  const [description, setDescription] = useState(bookmark?.description || '');
  const [category, setCategory] = useState(bookmark?.category || '');
  const [categoryId, setCategoryId] = useState(bookmark?.category_id || '');
  const [icon, setIcon] = useState(bookmark?.icon || '');
  
  const [titleError, setTitleError] = useState('');
  const [urlError, setUrlError] = useState('');
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingWebsite, setFetchingWebsite] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // 获取分类
  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
        setCategoriesLoaded(true);
        
        // 如果没有选择分类，但存在默认分类，则选择第一个分类
        if (!categoryId && !category && fetchedCategories.length > 0) {
          setCategoryId(fetchedCategories[0].id);
          setCategory(fetchedCategories[0].name);
        }
      } catch (error) {
        console.error(t('errors.fetchCategoriesError'), error);
      } finally {
        setLoadingCategories(false);
      }
    }
    
    fetchCategories();
  }, [categoryId, category, t]);
  
  // 点击外部关闭下拉菜单
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

  // 根据网址获取网站信息
  const fetchInfo = async () => {
    if (!url) {
      setUrlError(t('forms.errors.urlRequired'));
      return;
    }
    
    let validUrl = url;
    
    // 如果URL没有协议，添加https://
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
      setUrl(validUrl);
    }
    
    // 检查URL是否有效
    try {
      new URL(validUrl);
    } catch (e) {
      setUrlError(t('forms.errors.invalidUrl'));
      return;
    }
    
    setFetchingWebsite(true);
    setFetchError('');
    
    try {
      const info = await getWebsiteInfo(validUrl);
      if (info) {
        setTitle(info.title || title);
        setDescription(info.description || description);
        setIcon(info.icon || icon);
      }
    } catch (error) {
      console.error(t('errors.fetchWebsiteInfoError'), error);
      setFetchError(t('errors.fetchWebsiteInfoFailed'));
    } finally {
      setFetchingWebsite(false);
    }
  };

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 重置错误状态
    setTitleError('');
    setUrlError('');
    
    // 验证表单
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError(t('forms.errors.titleRequired'));
      isValid = false;
    }
    
    if (!url.trim()) {
      setUrlError(t('forms.errors.urlRequired'));
      isValid = false;
    } else {
      // 检查URL是否有效
      try {
        new URL(url.includes('://') ? url : `https://${url}`);
      } catch (e) {
        setUrlError(t('forms.errors.invalidUrl'));
        isValid = false;
      }
    }
    
    if (!isValid) return;
    
    // 确保URL有协议
    let validUrl = url;
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }
    
    setIsLoading(true);
    
    // 构建书签对象
    const bookmarkData = {
      id: bookmark?.id || '',
      title: title.trim(),
      url: validUrl,
      description: description.trim(),
      category: category,
      category_id: categoryId,
      icon: icon || '',
      created_at: bookmark?.created_at || new Date().toISOString(),
      user_id: bookmark?.user_id || '',
    };
    
    // 提交数据
    onSubmit(bookmarkData);
    
    // 如果不是编辑模式，清空表单
    if (!isEdit) {
      setTitle('');
      setUrl('');
      setDescription('');
      setIcon('');
    }
    
    setIsLoading(false);
  };
  
  // 处理分类选择
  const handleCategorySelect = (selectedCategory: Category) => {
    setCategory(selectedCategory.name);
    setCategoryId(selectedCategory.id);
    setIsCategoryDropdownOpen(false);
  };
  
  // 清除表单
  const clearForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('');
    setCategoryId('');
    setIcon('');
    setTitleError('');
    setUrlError('');
    setFetchError('');
    onCancel();
  };
  
  // 在分类下拉菜单中显示的分类
  const getSortedCategories = () => {
    return [...categories].sort((a, b) => {
      // 使用sort_order字段进行排序
      const sortA = a.sort_order ?? Number.MAX_SAFE_INTEGER;
      const sortB = b.sort_order ?? Number.MAX_SAFE_INTEGER;
      
      return sortA - sortB;
    });
  };

  return (
    <div className="cartoon-card p-6 w-full shadow-cartoon border-2 border-border bg-cardBg rounded-2xl animate-bounce-in">
      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <button 
          type="button" 
          onClick={clearForm}
          className="absolute top-0 right-0 text-textSecondary hover:text-accent p-2 transition-transform hover:rotate-12 hover:scale-110"
          aria-label={t('common.close')}
        >
          <FiX size={20} />
        </button>
        
        {/* 书签URL */}
        <div className="form-group">
          <label htmlFor="url" className="form-label text-sm mb-1 flex items-center">
            <FiLink className="mr-1 text-primary" size={16} />
            {t('forms.fields.url')}
          </label>
          <div className="relative">
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError('');
              }}
              placeholder={t('forms.placeholders.enterUrl')}
              className={`cartoon-input pl-4 pr-24 py-2 text-sm ${urlError ? 'border-accent' : ''}`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={fetchInfo}
              disabled={fetchingWebsite || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cartoon-button-sm py-1 px-2 text-xs"
            >
              {fetchingWebsite ? t('common.loading') : t('bookmarks.fetchInfo')}
            </button>
          </div>
          {urlError && (
            <div className="form-error text-xs mt-1 flex items-center text-accent">
              <FiAlertCircle size={12} className="mr-1" />
              {urlError}
            </div>
          )}
          {fetchError && (
            <div className="form-error text-xs mt-1 flex items-center text-accent">
              <FiAlertCircle size={12} className="mr-1" />
              {fetchError}
            </div>
          )}
        </div>
        
        {/* 书签标题 */}
        <div className="form-group">
          <label htmlFor="title" className="form-label text-sm mb-1 flex items-center">
            <FiTag className="mr-1 text-secondary" size={16} />
            {t('forms.fields.title')}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            placeholder={t('forms.placeholders.enterTitle')}
            className={`cartoon-input py-2 text-sm ${titleError ? 'border-accent' : ''}`}
            disabled={isLoading}
          />
          {titleError && (
            <div className="form-error text-xs mt-1 flex items-center text-accent">
              <FiAlertCircle size={12} className="mr-1" />
              {titleError}
            </div>
          )}
        </div>
        
        {/* 书签描述 */}
        <div className="form-group">
          <label htmlFor="description" className="form-label text-sm mb-1 flex items-center">
            <FiTag className="mr-1 text-tertiary" size={16} />
            {t('forms.fields.description')}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('forms.placeholders.enterDescription')}
            className="cartoon-input py-2 text-sm min-h-[60px]"
            disabled={isLoading}
          />
        </div>
        
        {/* 书签分类 */}
        <div className="form-group">
          <label className="form-label text-sm mb-1 flex items-center">
            <FiFolder className="mr-1 text-primary" size={16} />
            {t('forms.fields.category')}
          </label>
          
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              className="cartoon-input flex items-center justify-between w-full py-2 text-sm"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              disabled={loadingCategories || isLoading}
            >
              <span>
                {loadingCategories 
                  ? t('common.loading') 
                  : category || t('bookmarks.selectCategory')}
              </span>
              <FiChevronDown className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryDropdownOpen && categoriesLoaded && (
              <div className="origin-top-right absolute right-0 mt-1 w-full rounded-xl shadow-cartoon bg-cardBg border-2 border-border z-50 dropdown-animation">
                <div className="py-1 max-h-40 overflow-y-auto">
                  {categories.length > 0 ? (
                    getSortedCategories().map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className={`w-full flex items-center px-4 py-1.5 text-xs hover:bg-background transition-colors ${
                          categoryId === cat.id ? 'text-primary font-medium' : 'text-textPrimary'
                        }`}
                      >
                        <FiFolder className="mr-2 h-4 w-4 text-secondary" />
                        {cat.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-textSecondary">
                      {t('bookmarks.noCategoriesYet')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {categories.length === 0 && categoriesLoaded && !loadingCategories && (
            <div className="mt-1 text-xs text-textSecondary">
              {t('bookmarks.addCategoriesFirst')}
            </div>
          )}
        </div>
        
        {/* 提交按钮 */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="cartoon-btn-secondary text-sm py-1.5 px-3 transition-transform hover:scale-105 hover:-rotate-1 active:scale-95"
            disabled={isLoading}
          >
            <FiXCircle size={14} className="mr-1" />
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="cartoon-btn-primary text-sm py-1.5 px-3 transition-transform hover:scale-105 hover:rotate-1 active:scale-95 animate-pulse-slow"
            disabled={isLoading || fetchingWebsite}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('common.saving')}
              </span>
            ) : (
              <span className="flex items-center">
                {isEdit ? <FiCheck size={14} className="mr-1" /> : <FiPlus size={14} className="mr-1 animate-bounce" />}
                {isEdit ? t('common.save') : t('common.add')}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 