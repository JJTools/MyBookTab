import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// 中文翻译
const zh = {
  common: {
    bookmarks: '书签',
    categories: '分类',
    profile: '个人资料',
    login: '登录',
    register: '注册',
    logout: '退出登录',
    search: '搜索',
    add: '添加',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    noCategory: '无分类',
    locale: 'zh',
  },
  bookmarks: {
    addBookmark: '添加书签',
    editBookmark: '编辑书签',
    url: '网址',
    title: '标题',
    description: '描述',
    category: '分类',
    noBookmarks: '暂无书签',
  },
  categories: {
    addCategory: '添加分类',
    editCategory: '编辑分类',
    name: '名称',
    noCategories: '暂无分类',
  },
  profile: {
    changePassword: '修改密码',
    email: '邮箱',
    username: '用户名',
    language: '语言',
    theme: '主题',
  },
  auth: {
    emailPlaceholder: '请输入邮箱',
    passwordPlaceholder: '请输入密码',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    logoutSuccess: '已成功退出登录',
  },
};

// 英文翻译
const en = {
  common: {
    bookmarks: 'Bookmarks',
    categories: 'Categories',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noCategory: 'No Category',
    locale: 'en',
  },
  bookmarks: {
    addBookmark: 'Add Bookmark',
    editBookmark: 'Edit Bookmark',
    url: 'URL',
    title: 'Title',
    description: 'Description',
    category: 'Category',
    noBookmarks: 'No bookmarks',
  },
  categories: {
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    name: 'Name',
    noCategories: 'No categories',
  },
  profile: {
    changePassword: 'Change Password',
    email: 'Email',
    username: 'Username',
    language: 'Language',
    theme: 'Theme',
  },
  auth: {
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    logoutSuccess: 'Logged out successfully',
  },
};

// 翻译映射
const translations = {
  zh,
  en,
};

// 获取翻译的钩子函数
export function useTranslation() {
  const router = useRouter();
  const params = useParams();
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

  const changeLanguage = (newLocale: string) => {
    if (newLocale === 'zh' || newLocale === 'en') {
      setLocale(newLocale);
      localStorage.setItem('language', newLocale);
      // 刷新页面以应用新语言
      window.location.reload();
    }
  };

  return {
    t,
    locale,
    changeLanguage
  };
}

// 直接导出翻译内容
export const i18n = {
  translations,
}; 