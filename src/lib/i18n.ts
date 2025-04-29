import { useTranslation } from '@/components/LanguageContext';

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
    newPassword: '新密码',
    confirmPassword: '确认新密码',
    passwordMinLength: '密码至少需要6个字符',
    passwordMismatch: '两次输入的密码不匹配',
    profileUpdated: '个人资料更新成功！',
    updateFailed: '更新失败，请重试',
    leaveBlankPassword: '如果不需要修改密码，请留空',
    passwordPlaceholder: '至少6个字符',
    confirmPasswordPlaceholder: '再次输入新密码',
    saving: '保存中...',
  },
  auth: {
    emailPlaceholder: '请输入邮箱',
    passwordPlaceholder: '请输入密码',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    logoutSuccess: '已成功退出登录',
  },
  errors: {
    userStatusError: '检查用户状态错误:',
    signOutError: '退出登录错误:',
    fetchUserError: '获取用户数据错误:',
  }
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
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    passwordMinLength: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    profileUpdated: 'Profile updated successfully!',
    updateFailed: 'Update failed, please try again',
    leaveBlankPassword: 'Leave blank if you don\'t want to change your password',
    passwordPlaceholder: 'At least 6 characters',
    confirmPasswordPlaceholder: 'Re-enter new password',
    saving: 'Saving...',
  },
  auth: {
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    logoutSuccess: 'Logged out successfully',
  },
  errors: {
    userStatusError: 'Error checking user status:',
    signOutError: 'Error signing out:',
    fetchUserError: 'Error fetching user data:',
  }
};

// 翻译映射
export const translations = {
  zh,
  en,
};

// 重新导出 useTranslation
export { useTranslation }; 