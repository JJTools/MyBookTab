import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-6">MyBookTab 书签导航</h1>
        <p className="text-xl mb-10">保存和管理您的网页书签</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 w-full">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">功能特点</h2>
            <ul className="space-y-2">
              <li>• 集中管理所有网页书签</li>
              <li>• 分类整理，快速查找</li>
              <li>• 美观简洁的界面</li>
              <li>• 云端存储，随时访问</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">开始使用</h2>
            <p className="mb-4">登录后即可开始管理您的书签</p>
            <div className="flex space-x-4">
              <Link 
                href="/bookmarks" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                浏览书签
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
              >
                登录
              </Link>
            </div>
          </div>
        </div>
        
        <footer className="w-full border-t border-gray-200 dark:border-gray-700 py-4 text-center">
          <p>© {new Date().getFullYear()} MyBookTab. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
} 