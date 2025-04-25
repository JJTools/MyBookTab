import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
} 