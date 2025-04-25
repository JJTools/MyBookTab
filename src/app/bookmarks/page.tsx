'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BookmarkList from '@/components/BookmarkList';
import BookmarkForm from '@/components/BookmarkForm';
import { Bookmark } from '@/types';
import { FiPlus, FiLogOut, FiList } from 'react-icons/fi';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.push('/login');
        return;
      }
      
      setUser(data.session.user);
      fetchBookmarks(data.session.user.id);
    };
    
    checkUser();
  }, [router]);

  const fetchBookmarks = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookmark = async (newBookmark: Omit<Bookmark, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.from('bookmarks').insert([
        {
          ...newBookmark,
          user_id: user.id,
        }
      ]).select();

      if (error) throw error;
      
      if (data) {
        setBookmarks([...data, ...bookmarks]);
      }
      
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const handleUpdateBookmark = async (updatedBookmark: Bookmark) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({
          title: updatedBookmark.title,
          url: updatedBookmark.url,
          description: updatedBookmark.description,
          icon: updatedBookmark.icon,
          category: updatedBookmark.category,
        })
        .eq('id', updatedBookmark.id);

      if (error) throw error;

      setBookmarks(
        bookmarks.map((bookmark) =>
          bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
        )
      );
      
      setEditingBookmark(null);
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">我的书签</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              管理您收藏的网页书签
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Link href="/categories" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors flex items-center">
              <FiList className="mr-1" /> 管理分类
            </Link>
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingBookmark(null);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
            >
              <FiPlus className="mr-1" /> 添加书签
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors flex items-center"
            >
              <FiLogOut className="mr-1" /> 退出登录
            </button>
          </div>
        </header>

        {isAdding && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">添加新书签</h2>
            <BookmarkForm
              onSubmit={handleAddBookmark}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        )}

        {editingBookmark && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">编辑书签</h2>
            <BookmarkForm
              bookmark={editingBookmark}
              onSubmit={handleUpdateBookmark}
              onCancel={() => setEditingBookmark(null)}
            />
          </div>
        )}

        <BookmarkList
          bookmarks={bookmarks}
          onEdit={setEditingBookmark}
          onDelete={handleDeleteBookmark}
        />

        {bookmarks.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              您还没有添加任何书签
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              添加第一个书签
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 