'use client';

import Link from 'next/link';
import PublicBookmarkList from '@/components/PublicBookmarkList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <header className="py-8 mb-10 text-center">
          <h1 className="text-4xl font-medium mb-3">MyBookTab 书签导航</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">发现并收藏有价值的网站</p>
        </header>
        
        <div className="mb-14">
          <PublicBookmarkList />
        </div>
        
        <div className="macos-card p-6 mb-12">
          <h2 className="text-2xl font-medium mb-4">管理您自己的书签</h2>
          <p className="mb-5 text-gray-600 dark:text-gray-300">登录或注册账户后可以添加、编辑和管理您的私人书签</p>
          <div className="flex space-x-4">
            <Link 
              href="/login" 
              className="macos-btn-primary"
            >
              登录
            </Link>
            <Link 
              href="/register" 
              className="macos-btn-secondary"
            >
              注册
            </Link>
          </div>
        </div>
        
        <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} MyBookTab. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
} 