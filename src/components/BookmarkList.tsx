'use client';

import { useState, useRef, useEffect } from 'react';
import { Bookmark, Category } from '@/types';
import { FiEdit2, FiTrash2, FiExternalLink, FiSearch, FiFolder, FiChevronDown, FiX } from 'react-icons/fi';
import useConfirmDialog from './useConfirmDialog';
import { getCategories } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkList({ bookmarks, onEdit, onDelete }: BookmarkListProps) {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const { confirm, dialog } = useConfirmDialog();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { t } = useTranslation();

  // 获取分类数据，包括排序信息
  useEffect(() => {
    async function fetchCategoriesData() {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error(t('errors.fetchCategoriesError'), error);
      }
    }
    
    fetchCategoriesData();
  }, [t]);
  
  // 获取所有唯一分类
  const allCategories = [...new Set(bookmarks
    .filter(bookmark => bookmark.category_id)
    .map(bookmark => bookmark.category)
    .filter(Boolean))] as string[];

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

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const searchTerm = filter.toLowerCase().trim();
    const matchesSearch = !searchTerm ||
      bookmark.title?.toLowerCase().includes(searchTerm) ||
      bookmark.description?.toLowerCase().includes(searchTerm) ||
      bookmark.url?.toLowerCase().includes(searchTerm) ||
      bookmark.category?.toLowerCase().includes(searchTerm);
      
    // 确保正确匹配分类
    const matchesCategory = !selectedCategory || 
      (bookmark.category && bookmark.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // 按分类分组
  const groupedBookmarks: Record<string, Bookmark[]> = {};
  filteredBookmarks.forEach(bookmark => {
    let category = t('bookmarks.uncategorized');
    
    // 优先使用分类ID关联的分类名
    if (bookmark.category_id && bookmark.category) {
      category = bookmark.category;
    } else if (bookmark.category) {
      category = bookmark.category;
    }
    
    if (!groupedBookmarks[category]) {
      groupedBookmarks[category] = [];
    }
    groupedBookmarks[category].push(bookmark);
  });
  
  // 创建排序的分类列表，用于有序显示分类
  const getSortedCategories = () => {
    // 创建一个映射，存储分类名称到排序值的映射
    const categorySortMap = new Map<string, number>();
    
    // 从已加载的分类中提取分类名称和排序值
    if (categoriesLoaded) {
      categories.forEach((category, index) => {
        // 使用sort_order作为排序值，如果不存在则使用索引作为后备值
        categorySortMap.set(category.name, category.sort_order !== undefined ? category.sort_order : index);
      });
    }
    
    // 对groupedBookmarks的键（分类名称）进行排序
    return Object.keys(groupedBookmarks).sort((a, b) => {
      // 未分类总是最后
      if (a === t('bookmarks.uncategorized')) return 1;
      if (b === t('bookmarks.uncategorized')) return -1;
      
      // 使用排序值进行比较，如果找不到则使用字母顺序
      const sortA = categorySortMap.get(a) ?? Number.MAX_SAFE_INTEGER;
      const sortB = categorySortMap.get(b) ?? Number.MAX_SAFE_INTEGER;
      
      return sortA - sortB;
    });
  };

  // 处理删除
  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: t('bookmarks.deleteBookmark'),
      message: t('bookmarks.confirmDeleteBookmark').replace('{title}', title),
      type: 'danger'
    });
    
    if (confirmed) {
      onDelete(id);
    }
  };
  
  // 处理分类选择
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };
  
  // 获取当前选中的分类名称
  const getCategoryDisplayName = () => {
    return selectedCategory || t('bookmarks.allCategories');
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

  return (
    <div>
      {dialog}
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder={t('bookmarks.searchBookmarks')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="cartoon-input pl-12 py-3 w-full"
          />
          {filter && (
            <button 
              onClick={() => setFilter('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textSecondary hover:text-primary transition-colors"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
        
        <div className="relative" ref={categoryDropdownRef}>
          <button 
            type="button"
            className="cartoon-input flex items-center justify-between w-full pl-12 py-3 md:w-48"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          >
            <div className="flex items-center">
              <FiFolder className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary" />
              <span className="truncate">{getCategoryDisplayName()}</span>
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
                    onClick={() => handleCategoryChange(cat)}
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

      {Object.entries(groupedBookmarks).length === 0 ? (
        <div className="text-center py-16 bg-cardBg rounded-2xl shadow-cartoon border-2 border-border animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 text-textSecondary opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01" />
            </svg>
          </div>
          <p className="text-textSecondary text-lg">{t('bookmarks.noMatchingBookmarks')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {getSortedCategories().map((categoryName, index) => {
            const items = groupedBookmarks[categoryName];
            return (
              <div key={categoryName} className="space-y-4 cartoon-category" style={{ animationDelay: `${index * 0.1}s` }}>
                <h2 className="text-xl font-semibold border-b-2 border-primary pb-1">{categoryName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="cartoon-card p-4"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-textPrimary truncate">{bookmark.title}</h3>
                        <div className="flex space-x-2 ml-2">
                          <button
                            onClick={() => onEdit(bookmark)}
                            className="text-secondary hover:bg-secondary/10 p-1 rounded-full transition-colors"
                            title={t('common.edit')}
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(bookmark.id, bookmark.title)}
                            className="text-accent hover:bg-accent/10 p-1 rounded-full transition-colors"
                            title={t('common.delete')}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        {bookmark.description && (
                          <p className="text-sm text-textSecondary mb-2 line-clamp-2">{bookmark.description}</p>
                        )}
                        <a 
                          href={bookmark.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary flex items-center hover:underline mt-2"
                        >
                          <FiExternalLink className="mr-1" size={14} />
                          {t('bookmarks.visitLink')}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 