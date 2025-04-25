'use client';

import Link from 'next/link';
import PublicBookmarkList from '@/components/PublicBookmarkList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-6xl">
        <header className="py-6 mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">MyBookTab 书签导航</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">发现并收藏有价值的网站</p>
        </header>
        
        <div className="mb-12">
          <PublicBookmarkList />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-2xl font-semibold mb-4">管理您自己的书签</h2>
          <p className="mb-4">登录或注册账户后可以添加、编辑和管理您的私人书签</p>
          <div className="flex space-x-4">
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              登录
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
            >
              注册
            </Link>
          </div>
        </div>
        
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 py-4 text-center">
          <p>© {new Date().getFullYear()} MyBookTab. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
} 