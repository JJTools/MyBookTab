'use client';

import { useTranslation } from '@/lib/i18n';
import { useEffect } from 'react';

export function LanguageProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { locale } = useTranslation();
  
  useEffect(() => {
    // 更新html的lang属性
    document.documentElement.lang = locale;
    
    // 更新页面标题
    document.title = locale === 'zh' 
      ? 'MyBookTab - 网页书签导航' 
      : 'MyBookTab - Web Bookmark Navigator';
  }, [locale]);
  
  return <>{children}</>;
} 