'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import BookmarkList from '@/components/BookmarkList';
import BookmarkForm from '@/components/BookmarkForm';
import { Bookmark } from '@/types';
import { FiPlus, FiLogOut, FiList, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from '@/lib/i18n';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const { t } = useTranslation();

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
      console.error(t('errors.fetchBookmarksError'), error);
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
          category_id: newBookmark.category_id === '' ? undefined : newBookmark.category_id
        }
      ]).select();

      if (error) throw error;
      
      if (data) {
        setBookmarks([...data, ...bookmarks]);
      }
      
      setIsAdding(false);
    } catch (error) {
      console.error(t('errors.addBookmarkError'), error);
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
          category_id: updatedBookmark.category_id,
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
      console.error(t('errors.updateBookmarkError'), error);
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
      console.error(t('errors.deleteBookmarkError'), error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }
  
  if (!user) {
    router.push('/login');
    return (
      <div className="flex items-center justify-center">
        <p>{t('errors.mustLogin')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-content-height">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('bookmarks.myBookmarks')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {t('bookmarks.manageYourBookmarks')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:space-x-2">
            <button
              onClick={() => user && fetchBookmarks(user.id)}
              className="cartoon-btn-secondary flex items-center text-sm py-2"
              disabled={loading}
            >
              <FiRefreshCw className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> {t('common.refresh')}
            </button>
            <Link href="/categories" className="cartoon-btn-secondary flex items-center text-sm py-2">
              <FiList className="mr-1" /> {t('categories.manageCategories')}
            </Link>
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingBookmark(null);
              }}
              className="cartoon-btn-primary flex items-center text-sm py-2"
            >
              <FiPlus className="mr-1" /> {t('bookmarks.addBookmark')}
            </button>
            <button
              onClick={handleSignOut}
              className="cartoon-btn-tertiary flex items-center text-sm py-2"
            >
              <FiLogOut className="mr-1" /> {t('common.logout')}
            </button>
          </div>
        </header>

        {isAdding && (
          <div className="mb-6 w-full">
            <h2 className="text-2xl font-semibold mb-4">{t('bookmarks.addNewBookmark')}</h2>
            <div className="w-full">
              <BookmarkForm
                onSubmit={handleAddBookmark}
                onCancel={() => setIsAdding(false)}
              />
            </div>
          </div>
        )}

        {editingBookmark && (
          <div className="mb-6 w-full">
            <h2 className="text-2xl font-semibold mb-4">{t('bookmarks.editBookmark')}</h2>
            <div className="w-full">
              <BookmarkForm
                bookmark={editingBookmark}
                onSubmit={handleUpdateBookmark}
                onCancel={() => setEditingBookmark(null)}
                isEdit={true}
              />
            </div>
          </div>
        )}

        {(!isAdding && !editingBookmark) && (
          <BookmarkList
            bookmarks={bookmarks}
            onEdit={setEditingBookmark}
            onDelete={handleDeleteBookmark}
          />
        )}

        {bookmarks.length === 0 && !isAdding && !editingBookmark && (
          <div className="text-center py-12 cartoon-card mt-8">
            <p className="text-xl text-textSecondary mb-4">
              {t('bookmarks.noBookmarksYet')}
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="cartoon-btn-primary py-2 px-4 animate-bounce-slow"
            >
              <FiPlus className="mr-1 inline" /> {t('bookmarks.addFirstBookmark')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 