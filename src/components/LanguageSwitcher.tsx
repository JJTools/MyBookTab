'use client';

import { useState, useRef, useEffect } from 'react';
import { FiGlobe, FiCheck, FiChevronDown } from 'react-icons/fi';
import { useTranslation } from '@/lib/i18n';

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale, changeLanguage, t } = useTranslation();

  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' }
  ];

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 处理语言切换
  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // 获取当前语言显示名称
  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === locale);
    return currentLang ? currentLang.name : languages[0].name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cartoon-btn-flat px-3 py-2 rounded-xl text-textPrimary hover:bg-background transition-all duration-300 mr-2 min-w-[90px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <FiGlobe className="h-5 w-5 text-primary animate-pulse-slow mr-1" />
          <span className="text-sm">{getCurrentLanguageName()}</span>
        </div>
        <FiChevronDown 
          className={`h-4 w-4 ml-1 text-textSecondary transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-cardBg border-2 border-border rounded-xl shadow-cartoon z-50 dropdown-animation">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full text-left flex items-center justify-between px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors rounded-lg mx-1 my-1"
              >
                <span>{lang.name}</span>
                {locale === lang.code && (
                  <FiCheck className="h-4 w-4 text-primary animate-bounce-mini" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes dropIn {
          0% {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          70% {
            transform: translateY(2px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes bounce-mini {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .dropdown-animation {
          animation: dropIn 0.3s ease-out forwards;
          transform-origin: top center;
        }
        
        .animate-bounce-mini {
          animation: bounce-mini 1s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
        
        .shadow-cartoon {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 2px 2px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}; 