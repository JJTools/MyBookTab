'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/bookmarks');
      router.refresh();
    } catch (error: any) {
      setError(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background page-transition">
      <div className="w-full max-w-md p-8 space-y-8 bg-cardBg rounded-2xl shadow-cartoon border-2 border-border cartoon-form">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-float">
              <FiUser className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-textPrimary">登录</h1>
          <p className="mt-2 text-textSecondary">登录您的MyBookTab账户</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl border-2 border-red-200 animate-fade-in">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-bold text-textPrimary">
              电子邮箱
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">
                <FiMail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="cartoon-input pl-10"
                placeholder="请输入邮箱地址"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-bold text-textPrimary">
              密码
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">
                <FiLock size={18} />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="cartoon-input pl-10"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="cartoon-btn-primary w-full flex justify-center items-center py-3"
            >
              {loading ? '登录中...' : (
                <>
                  登录
                  <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-textSecondary mb-3">
            还没有账户？{' '}
            <Link href="/register" className="text-primary font-bold hover:underline transition-colors">
              注册新账户
            </Link>
          </p>
          <Link 
            href="/" 
            className="text-primary font-bold hover:underline transition-colors inline-flex items-center"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
} 