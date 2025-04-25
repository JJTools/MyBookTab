'use client';

import Link from 'next/link';
import { FiMail, FiCheckCircle } from 'react-icons/fi';

export default function VerifyEmail() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background page-transition">
      <div className="w-full max-w-md p-8 space-y-8 bg-cardBg rounded-2xl shadow-cartoon border-2 border-border cartoon-form">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center animate-float mb-6">
            <FiMail className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-textPrimary">验证您的邮箱</h1>
          <p className="mt-4 text-textSecondary">
            我们已向您的邮箱发送了验证链接。<br />
            请查收并点击链接完成注册。
          </p>
          
          <div className="mt-8 w-full max-w-sm p-4 bg-green-100 rounded-xl border-2 border-green-200 flex items-center animate-pulse-subtle">
            <FiCheckCircle className="text-green-600 mr-3 flex-shrink-0" size={24} />
            <p className="text-green-800 text-sm">
              验证邮件可能需要几分钟时间送达，请耐心等待
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <Link href="/login" className="cartoon-btn-secondary w-full flex justify-center items-center py-3">
            返回登录页面
          </Link>
          
          <div className="text-center">
            <p className="text-sm text-textSecondary">
              没有收到邮件？
              <button className="text-secondary font-bold hover:underline transition-colors ml-1">
                重新发送
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 