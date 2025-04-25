'use client';

import { useState, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface PublicBookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  category?: string;
}

export default function PublicBookmarkList() {
  const [bookmarks, setBookmarks] = useState<PublicBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicBookmarks();
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
      console.error('获取公共书签错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 提取所有类别
  const categories = [...new Set(bookmarks.map(b => b.category).filter(Boolean))];

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesFilter = !filter || 
      bookmark.title.toLowerCase().includes(filter.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(filter.toLowerCase()) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(filter.toLowerCase()));
      
    const matchesCategory = !selectedCategory || bookmark.category === selectedCategory;
    
    return matchesFilter && matchesCategory;
  });

  // 按类别分组显示书签
  const groupedBookmarks = filteredBookmarks.reduce<Record<string, PublicBookmark[]>>((acc, bookmark) => {
    const groupKey = bookmark.category || '未分类';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(bookmark);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-8">加载书签中...</div>;
  }

  return (
    <div className="w-full">
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
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
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
          <p className="text-gray-500 dark:text-gray-400">没有找到书签</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBookmarks).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">{categoryName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start">
                      {bookmark.icon && (
                        <img 
                          src={bookmark.icon} 
                          alt="" 
                          className="w-6 h-6 mr-2 rounded"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      )}
                      <h3 className="font-medium truncate flex-1">{bookmark.title}</h3>
                    </div>

                    {bookmark.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}

                    <div className="mt-4 flex justify-end">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <FiExternalLink size={16} />
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