'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';
import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

// 导出静态元数据，用于首次加载
export const metadata: Metadata = {
  title: 'MyBookTab - 网页书签导航',
  description: '一个简单易用的网页书签导航站',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useTranslation();
  const [lang, setLang] = useState('zh');
  
  useEffect(() => {
    // 监听语言变化，更新html的lang属性
    setLang(locale);
    
    // 更新页面标题
    document.title = locale === 'zh' 
      ? 'MyBookTab - 网页书签导航' 
      : 'MyBookTab - Web Bookmark Navigator';
  }, [locale]);
  
  return (
    <html lang={lang}>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
} 