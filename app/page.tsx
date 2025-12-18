'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'ticket' | 'trade'>('ticket');
  const [activeCategory, setActiveCategory] = useState<string>('전체');

  const categories = ['전체', '콘서트', '뮤지컬', '클래식'];
  
  // 더미 공연 데이터
  const performances = [
    { id: 1, title: '아이유 콘서트', category: '콘서트', poster: '/api/placeholder/300/400' },
    { id: 2, title: '레미제라블', category: '뮤지컬', poster: '/api/placeholder/300/400' },
    { id: 3, title: '베토벤 교향곡', category: '클래식', poster: '/api/placeholder/300/400' },
    { id: 4, title: 'BTS 콘서트', category: '콘서트', poster: '/api/placeholder/300/400' },
    { id: 5, title: '오페라의 유령', category: '뮤지컬', poster: '/api/placeholder/300/400' },
    { id: 6, title: '모차르트 피아노', category: '클래식', poster: '/api/placeholder/300/400' },
  ];

  const filteredPerformances = activeCategory === '전체' 
    ? performances 
    : performances.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-900">
              TT
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="공연 검색..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Login Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/my-page"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  마이페이지
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('ticket')}
                className={`py-4 px-2 border-b-2 font-medium ${
                  activeTab === 'ticket'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                티켓
              </button>
              <Link
                href="/trade"
                className={`py-4 px-2 border-b-2 font-medium ${
                  activeTab === 'trade'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                양도/교환
              </Link>
            </div>
          </div>
        </div>

        {/* Category Tabs (티켓 탭일 때만) */}
        {activeTab === 'ticket' && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`py-3 px-2 font-medium ${
                      activeCategory === category
                        ? 'text-purple-600 border-b-2 border-purple-600'
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

      {/* Hero Banner */}
      {activeTab === 'ticket' && (
        <section className="relative bg-gradient-to-r from-purple-600 to-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Left Arrow */}
              <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Banner Content */}
              <div className="text-center">
                <div className="w-full h-64 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-white text-xl">공연 포스터 배너</p>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">아이유 콘서트</h2>
                <p className="text-white/90">2025.01.15 - 2025.01.20</p>
              </div>

              {/* Right Arrow */}
              <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Performance Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredPerformances.map((performance) => (
            <Link
              key={performance.id}
              href={`/performance/${performance.id}`}
              className="group cursor-pointer"
            >
              <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden mb-2 group-hover:shadow-lg transition-shadow">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  포스터
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-600">
                {performance.title}
              </h3>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
