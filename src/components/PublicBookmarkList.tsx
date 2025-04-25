'use client';

import { useState, useEffect } from 'react';
import { FiExternalLink, FiSearch, FiFilter } from 'react-icons/fi';
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
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-textSecondary">加载书签中...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            placeholder="搜索书签..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="cartoon-input pl-12 py-3"
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary">
            <FiFilter size={18} />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="cartoon-input appearance-none pl-12 pr-10 bg-no-repeat bg-right-center"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23${
                '7A8DA0'.replace('#', '')
              }'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundSize: '1.5rem',
              backgroundPosition: 'right 0.75rem center'
            }}
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
        <div className="text-center py-16 bg-cardBg rounded-2xl shadow-cartoon border-2 border-border animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 text-textSecondary opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 16h.01" />
            </svg>
          </div>
          <p className="text-textSecondary text-lg">没有找到书签</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedBookmarks).map(([categoryName, items], categoryIndex) => (
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
                          访问链接
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