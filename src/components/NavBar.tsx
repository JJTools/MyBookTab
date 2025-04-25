'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiChevronDown, FiBookmark, FiList, FiLogOut, FiUser, FiSmile } from 'react-icons/fi';

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setUser(data.session.user);
        } else {
          setUser(null);
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
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
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

  // 当用户点击页面其他区域时关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu') && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="cartoon-nav">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center animate-pop">
              <FiSmile className="w-8 h-8 text-primary mr-2" />
              <span className="text-xl font-bold text-textPrimary">MyBookTab</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {loading ? (
              <div className="w-10 h-10 animate-pulse bg-border rounded-full"></div>
            ) : user ? (
              <div className="relative user-menu">
                <button
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 text-textPrimary hover:text-primary focus:outline-none transition-colors"
                >
                  <div className="cartoon-avatar w-10 h-10 bg-primary flex items-center justify-center text-white">
                    <FiUser size={20} />
                  </div>
                  <span className="hidden md:block font-bold animate-fade-in">{user.email?.split('@')[0]}</span>
                  <FiChevronDown className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 cartoon-card cartoon-dropdown z-10 overflow-hidden">
                    <div className="py-2">
                      <Link
                        href="/bookmarks"
                        className="flex items-center px-5 py-3 text-textPrimary hover:bg-primary/10 transition-colors"
                        onClick={closeMenu}
                      >
                        <FiBookmark className="mr-3 text-primary" size={18} /> 
                        <span className="font-medium">我的书签</span>
                      </Link>
                      <Link
                        href="/categories"
                        className="flex items-center px-5 py-3 text-textPrimary hover:bg-primary/10 transition-colors"
                        onClick={closeMenu}
                      >
                        <FiList className="mr-3 text-secondary" size={18} /> 
                        <span className="font-medium">管理分类</span>
                      </Link>
                      <button
                        onClick={() => {
                          closeMenu();
                          handleSignOut();
                        }}
                        className="flex items-center w-full text-left px-5 py-3 text-textPrimary hover:bg-primary/10 transition-colors"
                      >
                        <FiLogOut className="mr-3 text-accent" size={18} /> 
                        <span className="font-medium">退出登录</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="cartoon-btn-secondary px-5 py-2"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="cartoon-btn-primary px-5 py-2"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 