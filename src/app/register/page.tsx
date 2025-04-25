'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FiMail, FiLock, FiUserPlus, FiArrowRight, FiCheck } from 'react-icons/fi';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 验证表单
    if (!validateEmail(email)) {
      setError('请输入有效的电子邮件地址');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不匹配');
      setLoading(false);
      return;
    }

    try {
      // 创建用户
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 注册成功，重定向
      router.push('/verify-email');
    } catch (error: any) {
      setError(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background page-transition">
      <div className="w-full max-w-md p-8 space-y-8 bg-cardBg rounded-2xl shadow-cartoon border-2 border-border cartoon-form">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center animate-float">
              <FiUserPlus className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-textPrimary">注册</h1>
          <p className="mt-2 text-textSecondary">创建您的MyBookTab账户</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl border-2 border-red-200 animate-fade-in">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
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
                placeholder="至少6个字符"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-textPrimary">
              确认密码
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">
                <FiCheck size={18} />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="cartoon-input pl-10"
                placeholder="再次输入密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="cartoon-btn-secondary w-full flex justify-center items-center py-3"
            >
              {loading ? '注册中...' : (
                <>
                  创建账户
                  <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-textSecondary">
            已有账户？{' '}
            <Link href="/login" className="text-secondary font-bold hover:underline transition-colors">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 