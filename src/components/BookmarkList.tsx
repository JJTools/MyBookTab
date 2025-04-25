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

  // 提取所有类别
  const categories = [...new Set(bookmarks.map(b => b.category).filter(Boolean))];

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesFilter = bookmark.title.toLowerCase().includes(filter.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(filter.toLowerCase()) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(filter.toLowerCase()));
      
    const matchesCategory = !category || bookmark.category === category;
    
    return matchesFilter && matchesCategory;
  });

  // 按类别分组显示书签
  const groupedBookmarks = filteredBookmarks.reduce<Record<string, Bookmark[]>>((acc, bookmark) => {
    const groupKey = bookmark.category || '未分类';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(bookmark);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索书签..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>

        <div>
          <select
            value={category || ''}
            onChange={(e) => setCategory(e.target.value || null)}
            className="w-full md:w-auto px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          >
            <option value="">所有类别</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{bookmark.title}</h3>
                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => onEdit(bookmark)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
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
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {bookmark.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <FiExternalLink size={16} />
                        访问链接
                      </a>
                      {bookmark.category && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
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