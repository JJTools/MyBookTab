import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';
import { LanguageProvider } from '@/components/LanguageProvider';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

// 重新添加静态元数据
export const metadata: Metadata = {
  title: 'MyBookTab - 网页书签导航',
  description: '一个简单易用的网页书签导航站',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={inter.className}>
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
} 