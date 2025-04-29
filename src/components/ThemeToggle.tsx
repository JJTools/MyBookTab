'use client';

import { FiSun } from 'react-icons/fi';

const ThemeToggle = () => {
  return (
    <div className="ml-2 p-2 flex items-center justify-center">
      <FiSun className="h-5 w-5 text-yellow-400 animate-spin-slow" />
    </div>
  );
};

export default ThemeToggle; 