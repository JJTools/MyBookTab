'use client';

import { useState, useEffect, useRef } from 'react';
import { FiExternalLink, FiSearch, FiFilter, FiChevronDown, FiFolder, FiX, FiRefreshCw } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { getCategories } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

interface PublicBookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  category?: string;
  category_id?: string;
}

export default function PublicBookmarkList() {
  const [bookmarks, setBookmarks] = useState<PublicBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { t } = useTranslation();

  // 只在初始加载时获取数据
  useEffect(() => {
    fetchPublicBookmarks();
    fetchCategoriesData();
  }, []);

  // 获取分类数据
  const fetchCategoriesData = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      setCategoriesLoaded(true);
    } catch (error) {
      console.error(t('errors.fetchCategoriesError'), error);
    }
  };

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

  const fetchPublicBookmarks = async () => {
    try {
      setLoading(true);
      // 从public_bookmarks表获取数据
      const { data, error } = await supabase
        .from('public_bookmarks')
        .select('*')
        .order('category');

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error(t('errors.fetchBookmarksError'), error);
    } finally {
      setLoading(false);
    }
  };

  // 提取所有类别
  const allCategories = [...new Set(bookmarks
    .filter(b => b.category_id)
    .map(b => b.category)
    .filter(Boolean))] as string[];

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesFilter = !filter || 
      bookmark.title.toLowerCase().includes(filter.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(filter.toLowerCase()) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(filter.toLowerCase()));
      
    // 确保正确匹配分类
    const matchesCategory = !selectedCategory || 
      (bookmark.category && bookmark.category === selectedCategory);
    
    return matchesFilter && matchesCategory;
  });

  // 按分类分组并创建排序函数
  const getGroupedAndSortedBookmarks = () => {
    // 按类别分组
    const grouped: Record<string, PublicBookmark[]> = {};
    filteredBookmarks.forEach(bookmark => {
      let groupKey = t('bookmarks.uncategorized');
      
      // 优先使用分类ID关联的分类名
      if (bookmark.category_id && bookmark.category) {
        groupKey = bookmark.category;
      } else if (bookmark.category) {
        groupKey = bookmark.category;
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(bookmark);
    });
    
    // 创建一个映射，存储分类名称到排序值的映射
    const categorySortMap = new Map<string, number>();
    
    // 从已加载的分类中提取分类名称和排序值
    if (categoriesLoaded) {
      categories.forEach((category, index) => {
        // 使用sort_order作为排序值，如果不存在则使用索引作为后备值
        categorySortMap.set(category.name, category.sort_order !== undefined ? category.sort_order : index);
      });
    }
    
    // 对分组键（分类名称）进行排序
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      // 未分类总是最后
      if (a === t('bookmarks.uncategorized')) return 1;
      if (b === t('bookmarks.uncategorized')) return -1;
      
      // 使用排序值进行比较，如果找不到则使用字母顺序
      const sortA = categorySortMap.get(a) ?? Number.MAX_SAFE_INTEGER;
      const sortB = categorySortMap.get(b) ?? Number.MAX_SAFE_INTEGER;
      
      return sortA - sortB;
    });
    
    // 返回排序后的分类和对应的书签
    return sortedKeys.map(key => ({
      category: key,
      bookmarks: grouped[key]
    }));
  };

  // 根据分类在categories中的排序顺序对下拉菜单中的分类进行排序
  const getSortedCategoryOptions = () => {
    if (!categoriesLoaded) return allCategories;
    
    return [...allCategories].sort((a, b) => {
      // 查找两个分类在categories中的对象
      const categoryA = categories.find(c => c.name === a);
      const categoryB = categories.find(c => c.name === b);
      
      // 获取排序值，如果不存在则使用较大的值
      const sortA = categoryA?.sort_order ?? Number.MAX_SAFE_INTEGER;
      const sortB = categoryB?.sort_order ?? Number.MAX_SAFE_INTEGER;
      
      return sortA - sortB;
    });
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const getCategoryDisplayName = () => {
    return selectedCategory || t('bookmarks.allCategories');
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-textSecondary">{t('common.loading')}</p>
      </div>
    );
  }

  const groupedAndSortedBookmarks = getGroupedAndSortedBookmarks();

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder={t('bookmarks.searchBookmarks')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="cartoon-input pl-12 py-3"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchPublicBookmarks();
              fetchCategoriesData();
            }}
            className="cartoon-btn-secondary flex items-center whitespace-nowrap"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> {t('common.refresh')}
          </button>
          
          <div className="relative" ref={categoryDropdownRef}>
            <button 
              type="button"
              className="cartoon-input flex items-center justify-between w-full pl-12 py-3"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <div className="flex items-center">
                <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary" />
                <span>{getCategoryDisplayName()}</span>
              </div>
              <FiChevronDown className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-full rounded-xl shadow-cartoon bg-cardBg border-2 border-border z-50 dropdown-animation">
                <div className="py-1 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full flex items-center px-4 py-2 text-sm hover:bg-background transition-colors ${
                      selectedCategory === null ? 'text-primary font-medium' : 'text-textPrimary'
                    }`}
                  >
                    <FiX className="mr-3 h-5 w-5 text-textSecondary" />
                    {t('bookmarks.allCategories')}
                  </button>
                  
                  {getSortedCategoryOptions().map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => cat ? handleCategoryChange(cat) : handleCategoryChange(null)}
                      className={`w-full flex items-center px-4 py-2 text-sm hover:bg-background transition-colors ${
                        selectedCategory === cat ? 'text-primary font-medium' : 'text-textPrimary'
                      }`}
                    >
                      <FiFolder className="mr-3 h-5 w-5 text-secondary" />
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {groupedAndSortedBookmarks.length === 0 ? (
        <div className="text-center py-16 bg-cardBg rounded-2xl shadow-cartoon border-2 border-border animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 text-textSecondary opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01" />
            </svg>
          </div>
          <p className="text-textSecondary text-lg">{t('bookmarks.noBookmarks')}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedAndSortedBookmarks.map(({ category: categoryName, bookmarks: items }, categoryIndex) => (
            <div key={categoryName} className="space-y-4 cartoon-category" style={{ animationDelay: `${categoryIndex * 0.1}s` }}>
              <h2 className="text-2xl font-bold text-textPrimary border-b-4 border-primary pb-2 mb-4">{categoryName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((bookmark, index) => (
                  <div
                    key={bookmark.id}
                    className="cartoon-card hover:rotate-1 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-textPrimary truncate">{bookmark.title}</h3>
                      </div>

                      {bookmark.description && (
                        <p className="text-textSecondary mb-4 line-clamp-2">
                          {bookmark.description}
                        </p>
                      )}

                      <div className="mt-4 flex justify-between items-center">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cartoon-btn-primary text-sm flex items-center gap-1"
                        >
                          <FiExternalLink size={16} />
                          {t('bookmarks.visitLink')}
                        </a>
                        {bookmark.category && (
                          <span className="text-sm bg-secondary/20 text-secondary px-3 py-1 rounded-full font-medium">
                            {bookmark.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 