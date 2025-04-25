'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiChevronDown, FiBookmark, FiList, FiLogOut, FiUser, FiSmile, FiSettings } from 'react-icons/fi';

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
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
        console.error('检查用户状态错误:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
    
    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
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
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('退出登录错误:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 关闭菜单
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 如果在登录或注册页面，不显示导航栏
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/verify-email'
  ) {
    return null;
  }

  return (
    <nav className="bg-cardBg border-b-2 border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center"
              onClick={closeMenu}
            >
              <FiBookmark className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-textPrimary">MyBookTab</span>
            </Link>
          </div>
          
          {!loading && user ? (
            <div className="flex items-center">
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={toggleMenu}
                    className="flex items-center cartoon-btn-flat px-4 py-2"
                  >
                    <span className="mr-2">
                      <FiUser className="h-5 w-5 text-primary" />
                    </span>
                    <span className="text-textPrimary font-medium mr-1">
                      {displayName || user.email?.split('@')[0]}
                    </span>
                    <FiChevronDown className={`h-4 w-4 text-textSecondary transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-cartoon bg-cardBg border-2 border-border">
                    <div className="py-1">
                      <Link
                        href="/bookmarks"
                        className="flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors"
                        onClick={closeMenu}
                      >
                        <FiBookmark className="mr-3 h-5 w-5 text-secondary" />
                        我的书签
                      </Link>
                      <Link
                        href="/categories"
                        className="flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors"
                        onClick={closeMenu}
                      >
                        <FiList className="mr-3 h-5 w-5 text-tertiary" />
                        管理分类
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-textPrimary hover:bg-background transition-colors"
                        onClick={closeMenu}
                      >
                        <FiSettings className="mr-3 h-5 w-5 text-primary" />
                        个人设置
                      </Link>
                      <button
                        onClick={() => {
                          closeMenu();
                          handleSignOut();
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-background transition-colors"
                      >
                        <FiLogOut className="mr-3 h-5 w-5" />
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="cartoon-btn-outline flex items-center py-2"
              >
                <FiUser className="mr-2" />
                登录
              </Link>
              <Link
                href="/register"
                className="cartoon-btn-primary flex items-center py-2"
              >
                <FiSmile className="mr-2" />
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 