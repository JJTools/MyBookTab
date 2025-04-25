'use client';

import { useState, useRef, useEffect } from 'react';
import { Bookmark } from '@/types';
import { FiEdit2, FiTrash2, FiExternalLink, FiSearch, FiFolder, FiChevronDown, FiX } from 'react-icons/fi';
import useConfirmDialog from './useConfirmDialog';

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
  
  // 获取所有唯一分类
  const allCategories = [...new Set(bookmarks
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
      
    const matchesCategory = !selectedCategory || bookmark.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 按分类分组
  const groupedBookmarks: Record<string, Bookmark[]> = {};
  filteredBookmarks.forEach(bookmark => {
    const category = bookmark.category || '未分类';
    if (!groupedBookmarks[category]) {
      groupedBookmarks[category] = [];
    }
    groupedBookmarks[category].push(bookmark);
  });

  // 处理删除
  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: '删除书签',
      message: `确定要删除"${title}"这个书签吗？`,
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
    return selectedCategory || '所有类别';
  };

  return (
    <div>
      {dialog}
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="搜索书签..."
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
                  所有类别
                </button>
                
                {allCategories.map((cat) => (
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
          <p className="text-textSecondary text-lg">没有找到匹配的书签</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBookmarks).map(([categoryName, items], index) => (
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
                          title="编辑"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(bookmark.id, bookmark.title)}
                          className="text-accent hover:bg-accent/10 p-1 rounded-full transition-colors"
                          title="删除"
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
                        访问链接
                      </a>
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