'use client';

import { useTranslation } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, changeLanguage } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('zh')}
        className={`px-2 py-1 text-sm rounded ${
          locale === 'zh' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 text-sm rounded ${
          locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        English
      </button>
    </div>
  );
} 