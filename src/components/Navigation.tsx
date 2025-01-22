// src/components/Navigation.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Firstrade証券取引分析ツール</h1>

      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Link
            href="/"
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md text-center ${
              pathname === '/' || pathname === '/dividend'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            } transition-all duration-200`}
          >
            配当金明細
          </Link>
          <Link
            href="/gainloss"
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md text-center ${
              pathname === '/gainloss'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-500 hover:text-gray-700'
            } transition-all duration-200`}
          >
            損益計算書
          </Link>
        </nav>
      </div>
    </div>
  );
}