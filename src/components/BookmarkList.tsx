'use client';

import { useState } from 'react';
import { Bookmark } from '@/types';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkList({ bookmarks, onEdit, onDelete }: BookmarkListProps) {
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // 提取所有分类（包括自定义和关联分类）
  const allCategories = bookmarks.reduce<{id: string | null, name: string}[]>((acc, bookmark) => {
    // 添加关联分类
    if (bookmark.category_id && !acc.some(c => c.id === bookmark.category_id)) {
      acc.push({
        id: bookmark.category_id,
        name: bookmark.category || '未命名分类'
      });
    }
    
    // 添加自定义分类（没有category_id但有category的情况）
    if (!bookmark.category_id && bookmark.category && !acc.some(c => c.name === bookmark.category)) {
      acc.push({
        id: null,
        name: bookmark.category
      });
    }
    
    return acc;
  }, []);
  
  // 排序分类（按名称）
  allCategories.sort((a, b) => a.name.localeCompare(b.name));

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesFilter = !filter || 
      bookmark.title.toLowerCase().includes(filter.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(filter.toLowerCase()) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(filter.toLowerCase()));
      
    // 匹配分类ID或自定义分类名称
    const matchesCategory = 
      !categoryId && !category || 
      (categoryId && bookmark.category_id === categoryId) ||
      (!categoryId && category && bookmark.category === category);
    
    return matchesFilter && matchesCategory;
  });

  // 按分类分组显示书签
  const groupedBookmarks = filteredBookmarks.reduce<Record<string, Bookmark[]>>((acc, bookmark) => {
    // 使用分类名称作为键，如果没有分类则用"未分类"
    const categoryName = bookmark.category || '未分类';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(bookmark);
    return acc;
  }, {});

  // 处理分类选择变化
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      // 清除选择
      setCategoryId(null);
      setCategory(null);
    } else {
      // 检查是否是带ID的分类或自定义分类
      const selectedCategory = allCategories.find(c => 
        (c.id && c.id === value) || (!c.id && c.name === value)
      );
      
      if (selectedCategory) {
        if (selectedCategory.id) {
          setCategoryId(selectedCategory.id);
          setCategory(null);
        } else {
          setCategoryId(null);
          setCategory(selectedCategory.name);
        }
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索书签..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="cartoon-input"
          />
        </div>

        <div>
          <select
            value={categoryId || category || ''}
            onChange={handleCategoryChange}
            className="cartoon-input"
          >
            <option value="">所有类别</option>
            {allCategories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.id || cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {Object.entries(groupedBookmarks).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">没有找到匹配的书签</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBookmarks).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-4">
              <h2 className="text-xl font-semibold">{categoryName}</h2>
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
                          onClick={() => {
                            if (window.confirm('确定要删除这个书签吗？')) {
                              onDelete(bookmark.id);
                            }
                          }}
                          className="text-accent hover:bg-accent/10 p-1 rounded-full transition-colors"
                          title="删除"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {bookmark.description && (
                      <p className="text-sm text-textSecondary mt-2 line-clamp-2">
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
                        访问链接
                      </a>
                      {bookmark.category && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                          {bookmark.category}
                        </span>
                      )}
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