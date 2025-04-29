'use client';

import PublicBookmarkList from '@/components/PublicBookmarkList';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const { t, locale } = useTranslation();
  
  return (
    <div className="flex flex-col items-center p-4 md:p-8 page-transition min-content-height">
      <div className="w-full max-w-6xl">
        <div className="mb-8">
          <PublicBookmarkList />
        </div>
        
        <footer className="w-full border-t-4 border-primary py-6 text-center text-textSecondary animate-fade-in">
          <p className="text-lg">© {new Date().getFullYear()} MyBookTab. All rights reserved.</p>
          <p className="mt-2 text-sm">
            {locale === 'zh' 
              ? '🚀 用更可爱的方式整理你的网络世界 🌈'
              : '🚀 Organize your online world in a more adorable way 🌈'}
          </p>
          <div className="mt-4 flex justify-center space-x-3 flex-wrap">
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full animate-bounce-slow">
              {locale === 'zh' ? '书签管理' : 'Bookmark Management'}
            </span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
              {locale === 'zh' ? '分类整理' : 'Category Organization'}
            </span>
            <span className="px-3 py-1 bg-tertiary/10 text-tertiary text-sm rounded-full animate-bounce-slow" style={{ animationDelay: '1s' }}>
              {locale === 'zh' ? '高效访问' : 'Efficient Access'}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
} 