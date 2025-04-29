'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FiUser, FiLock, FiSave, FiArrowLeft, FiGlobe } from 'react-icons/fi';
import { useTranslation } from '@/lib/i18n';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { t, locale, changeLanguage } = useTranslation();

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        setUser(session.user);
        
        // 获取用户元数据中的昵称
        const metadata = session.user.user_metadata;
        if (metadata && metadata.display_name) {
          setDisplayName(metadata.display_name);
        }
      } catch (error) {
        console.error(t('errors.fetchUserError'), error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [router, t]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      let updateSuccess = false;
      
      // 更新昵称
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      if (updateError) {
        throw updateError;
      }
      
      updateSuccess = true;
      
      // 如果提供了密码，则更新密码
      if (password) {
        if (password.length < 6) {
          setError(t('profile.passwordMinLength'));
          setUpdateLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setError(t('profile.passwordMismatch'));
          setUpdateLoading(false);
          return;
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (passwordError) {
          throw passwordError;
        }
        
        // 清空密码字段
        setPassword('');
        setConfirmPassword('');
      }
      
      if (updateSuccess) {
        setMessage(t('profile.profileUpdated'));
      }
    } catch (error: any) {
      setError(error.message || t('profile.updateFailed'));
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 md:p-8 page-transition">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push('/bookmarks')}
          className="mb-6 flex items-center text-textSecondary hover:text-primary transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          {t('common.bookmarks')}
        </button>
        
        <div className="bg-cardBg rounded-2xl shadow-cartoon border-2 border-border p-8 cartoon-form">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-float">
              <FiUser className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-textPrimary mt-4">{t('common.profile')}</h1>
            <p className="text-textSecondary">{user?.email}</p>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-xl border-2 border-red-200 mb-6 animate-fade-in">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-100 text-green-700 p-4 rounded-xl border-2 border-green-200 mb-6 animate-fade-in">
              {message}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="displayName" className="block text-sm font-bold text-textPrimary">
                {t('profile.username')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">
                  <FiUser size={18} />
                </div>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="cartoon-input pl-10"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="language" className="block text-sm font-bold text-textPrimary">
                {t('profile.language')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">
                  <FiGlobe size={18} />
                </div>
                <select
                  id="language"
                  value={locale}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="cartoon-input pl-10 w-full"
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-textPrimary mb-4">{t('profile.changePassword')}</h2>
              <p className="text-sm text-textSecondary mb-4">
                {t('profile.leaveBlankPassword')}
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-bold text-textPrimary">
                    {t('profile.newPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">
                      <FiLock size={18} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="cartoon-input pl-10"
                      placeholder={t('profile.passwordPlaceholder')}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-textPrimary">
                    {t('profile.confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">
                      <FiLock size={18} />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="cartoon-input pl-10"
                      placeholder={t('profile.confirmPasswordPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={updateLoading}
                className="cartoon-btn-primary w-full flex justify-center items-center py-3"
              >
                {updateLoading ? 
                  (t('profile.saving')) : 
                  (
                    <>
                      {t('common.save')}
                      <FiSave className="ml-2" />
                    </>
                  )
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 