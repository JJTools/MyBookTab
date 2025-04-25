'use client';

import PublicBookmarkList from '@/components/PublicBookmarkList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 page-transition">
      <div className="w-full max-w-6xl">
        <div className="mb-8">
          <PublicBookmarkList />
        </div>
        
        <footer className="w-full border-t-4 border-primary py-8 text-center text-textSecondary animate-fade-in">
          <p className="text-lg">© {new Date().getFullYear()} MyBookTab. All rights reserved.</p>
          <p className="mt-2 text-sm">🚀 用更可爱的方式整理你的网络世界 🌈</p>
          <div className="mt-4 flex justify-center space-x-3">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full animate-bounce-slow">
              书签管理
            </span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
              分类整理
            </span>
            <span className="px-3 py-1 bg-tertiary/10 text-tertiary text-sm rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}>
              高效访问
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
} 