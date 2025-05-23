'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiChevronDown, FiBookmark, FiList, FiLogOut, FiUser, FiSmile, FiSettings, FiGlobe, FiMenu, FiX } from 'react-icons/fi';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { User, Session, AuthError } from '@supabase/supabase-js';

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const authListenerRef = useRef<any>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // 防止重复初始化
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setUser(data.session.user);
          // 获取用户昵称
          const metadata = data.session.user.user_metadata;
          if (metadata && metadata.display_name) {
            setDisplayName(metadata.display_name);
          }
        } else {
          setUser(null);
          setDisplayName(null);
        }
      } catch (error) {
        console.error(t('errors.userStatusError'), error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // 监听认证状态变化
    const { data } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          // 获取用户昵称
          const metadata = session.user.user_metadata;
          if (metadata && metadata.display_name) {
            setDisplayName(metadata.display_name);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setDisplayName(null);
        }
      }
    );
    
    authListenerRef.current = data;
    
    return () => {
      if (authListenerRef.current && authListenerRef.current.subscription) {
        authListenerRef.current.subscription.unsubscribe();
      }
    };
  }, []); // 移除不必要的依赖项

  useEffect(() => {
    // 页面变化时关闭菜单
    closeMenu();
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error(t('errors.signOutError'), error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 关闭菜单
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 添加点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      const dropdownMenu = document.querySelector('.user-dropdown-menu');
      const userButton = document.querySelector('.user-menu-button');
      
      if (
        isMenuOpen && 
        dropdownMenu && 
        userButton && 
        !dropdownMenu.contains(targetElement) && 
        !userButton.contains(targetElement)
      ) {
        closeMenu();
      }

      // 移动菜单点击外部关闭
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(targetElement) &&
        !(targetElement.closest('.mobile-menu-button'))
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isMobileMenuOpen]);

  // 如果在登录或注册页面，不显示导航栏
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/verify-email'
  ) {
    return null;
  }

  return (
    <nav className="bg-cardBg border-b-2 border-border shadow-sm sticky top-0 z-40 navbar-animation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center"
              onClick={closeMenu}
            >
              <FiBookmark className="h-8 w-8 text-primary animate-swing" />
              <span className="ml-2 text-xl font-bold text-textPrimary">MyBookTab</span>
            </Link>
          </div>
          
          {/* 桌面导航 */}
          {!loading && (
            <div className="hidden md:flex items-center">
              <LanguageSwitcher />
              
              {user ? (
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={toggleMenu}
                      className="flex items-center cartoon-btn-flat px-4 py-2 user-menu-button"
                    >
                      <span className="mr-2">
                        <FiUser className="h-5 w-5 text-primary animate-swing" />
                      </span>
                      <span className="text-textPrimary font-medium mr-1">
                        {displayName || user.email?.split('@')[0]}
                      </span>
                      <FiChevronDown className={`h-4 w-4 text-textSecondary transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  
                  {isMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-cartoon bg-cardBg border-2 border-border z-50 dropdown-animation user-dropdown-menu">
                      <div className="py-1">
                        <Link
                          href="/bookmarks"
                          className="flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors"
                          onClick={closeMenu}
                        >
                          <FiBookmark className="mr-3 h-5 w-5 text-secondary" />
                          {t('common.bookmarks')}
                        </Link>
                        <Link
                          href="/categories"
                          className="flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors"
                          onClick={closeMenu}
                        >
                          <FiList className="mr-3 h-5 w-5 text-tertiary" />
                          {t('common.categories')}
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors"
                          onClick={closeMenu}
                        >
                          <FiSettings className="mr-3 h-5 w-5 text-primary" />
                          {t('common.profile')}
                        </Link>
                        <button
                          onClick={() => {
                            closeMenu();
                            handleSignOut();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-background transition-colors"
                        >
                          <FiLogOut className="mr-3 h-5 w-5" />
                          {t('common.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="cartoon-btn-outline flex items-center py-2 animate-scale-in hover:rotate-1"
                  >
                    <FiUser className="mr-2" />
                    {t('common.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="cartoon-btn-primary flex items-center py-2 animate-scale-in hover:rotate-1"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <FiSmile className="mr-2" />
                    {t('common.register')}
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* 移动端汉堡菜单按钮 */}
          <div className="flex md:hidden items-center">
            <button 
              className="mobile-menu-button cartoon-btn-flat p-2 rounded-full"
              onClick={toggleMobileMenu}
              aria-label="菜单"
            >
              {isMobileMenuOpen ? 
                <FiX className="h-6 w-6 text-primary" /> : 
                <FiMenu className="h-6 w-6 text-primary" />
              }
            </button>
          </div>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef} 
          className="md:hidden bg-cardBg border-t border-border animate-fadeInDown"
        >
          <div className="pt-2 pb-4 space-y-1 px-4">
            <div className="flex justify-center mb-3">
              <LanguageSwitcher />
            </div>
            
            {!loading && user ? (
              <>
                <div className="flex items-center mb-3 px-4 py-2 rounded-xl bg-background">
                  <FiUser className="h-5 w-5 text-primary mr-2" />
                  <span className="text-textPrimary font-medium">
                    {displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                
                <Link
                  href="/bookmarks"
                  className="block px-4 py-2 rounded-xl text-textPrimary hover:bg-background transition-colors flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiBookmark className="mr-3 h-5 w-5 text-secondary" />
                  {t('common.bookmarks')}
                </Link>
                <Link
                  href="/categories"
                  className="block px-4 py-2 rounded-xl text-textPrimary hover:bg-background transition-colors flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiList className="mr-3 h-5 w-5 text-tertiary" />
                  {t('common.categories')}
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 rounded-xl text-textPrimary hover:bg-background transition-colors flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiSettings className="mr-3 h-5 w-5 text-primary" />
                  {t('common.profile')}
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center px-4 py-2 rounded-xl text-red-600 hover:bg-background transition-colors"
                >
                  <FiLogOut className="mr-3 h-5 w-5" />
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="cartoon-btn-outline flex items-center justify-center py-2 animate-scale-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiUser className="mr-2" />
                  {t('common.login')}
                </Link>
                <Link
                  href="/register"
                  className="cartoon-btn-primary flex items-center justify-center py-2 animate-scale-in"
                  style={{ animationDelay: '0.1s' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiSmile className="mr-2" />
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 