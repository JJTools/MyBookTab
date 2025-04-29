'use client';

import { FiBookmark } from 'react-icons/fi';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export const Logo = () => {
  const { t } = useTranslation();
  
  return (
    <Link href="/" className="flex-shrink-0 flex items-center">
      <FiBookmark className="h-8 w-8 text-primary animate-swing" />
      <span className="ml-2 text-xl font-bold text-textPrimary">MyBookTab</span>
    </Link>
  );
}; 