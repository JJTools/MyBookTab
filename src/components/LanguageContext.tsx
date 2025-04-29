'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/lib/i18n';

// 语言上下文类型
export type LanguageContextType = {
  locale: string;
  t: (key: string) => string;
  changeLanguage: (locale: string) => void;
};

// 创建上下文
const LanguageContext = createContext<LanguageContextType | null>(null);

// 语言提供者组件
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('zh');
  
  // 在客户端挂载时获取当前语言
  useEffect(() => {
    // 从localStorage中获取语言设置
    const savedLocale = localStorage.getItem('language');
    if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
      setLocale(savedLocale);
    } else {
      // 从浏览器获取默认语言
      const browserLocale = navigator.language.startsWith('zh') ? 'zh' : 'en';
      setLocale(browserLocale);
      localStorage.setItem('language', browserLocale);
    }
  }, []);
  
  // 翻译函数
  const t = (key: string) => {
    // 支持点符号访问，例如 t('common.save')
    const keys = key.split('.');
    let translation: any = translations[locale as keyof typeof translations];
    
    for (const k of keys) {
      if (translation[k] === undefined) {
        // 如果找不到翻译，返回键名
        return key;
      }
      translation = translation[k];
    }
    
    return translation;
  };

  // 改变语言函数
  const changeLanguage = (newLocale: string) => {
    if (newLocale === 'zh' || newLocale === 'en') {
      setLocale(newLocale);
      localStorage.setItem('language', newLocale);
    }
  };
  
  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 获取翻译的钩子函数
export function useTranslation() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  
  return context;
} 