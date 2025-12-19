'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  activeTab?: 'ticket' | 'trade';
  onTabChange?: (tab: 'ticket' | 'trade') => void;
  showCategoryTabs?: boolean;
  activeCategory?: string;
  categories?: string[];
  onCategoryChange?: (category: string) => void;
}

export default function Header({
  activeTab,
  onTabChange,
  showCategoryTabs = false,
  activeCategory,
  categories = [],
  onCategoryChange,
}: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="text-3xl font-bold text-gray-900 tracking-tight">
            TT
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="공연, 아티스트 검색"
                className="w-full px-5 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* User Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/my-page"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm"
              >
                내 예약
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
            >
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      {(activeTab !== undefined || showCategoryTabs) && (
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1">
              {activeTab !== undefined && (
                <>
                  <button
                    onClick={() => onTabChange?.('ticket')}
                    className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                      activeTab === 'ticket'
                        ? 'text-red-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    티켓
                    {activeTab === 'ticket' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
                    )}
                  </button>
                  <Link
                    href="/trade"
                    className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                      activeTab === 'trade'
                        ? 'text-red-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    양도/교환
                    {activeTab === 'trade' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs (티켓 탭일 때만) */}
      {showCategoryTabs && activeTab === 'ticket' && categories.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange?.(category)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeCategory === category
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

