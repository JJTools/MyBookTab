'use client';

import { useState } from 'react';
import { Bookmark } from '@/types';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import useConfirmDialog from './useConfirmDialog';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export default function BookmarkList({ bookmarks, onEdit, onDelete }: BookmarkListProps) {
  const [filter, setFilter] = useState('');
  const { confirm, dialog } = useConfirmDialog();

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const searchTerm = filter.toLowerCase().trim();
    return (
      bookmark.title?.toLowerCase().includes(searchTerm) ||
      bookmark.description?.toLowerCase().includes(searchTerm) ||
      bookmark.url?.toLowerCase().includes(searchTerm) ||
      bookmark.category?.toLowerCase().includes(searchTerm)
    );
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

  return (
    <div>
      {dialog}
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索书签..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="cartoon-input pl-4 pr-10 py-3 w-full"
          />
          <button 
            onClick={() => setFilter('')}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-textSecondary opacity-60 hover:opacity-100 transition-opacity ${!filter ? 'hidden' : ''}`}
          >
            清除
          </button>
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