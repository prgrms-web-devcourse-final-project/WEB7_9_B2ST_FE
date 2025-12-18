'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'ticket' | 'trade'>('ticket');
  const [activeCategory, setActiveCategory] = useState<string>('전체');

  const categories = ['전체', '콘서트', '뮤지컬', '클래식', '연극', '전시/행사'];
  
  // 더미 공연 데이터
  const performances = [
    { id: 1, title: '아이유 콘서트', category: '콘서트', venue: '올림픽공원 올림픽홀', date: '2025.01.15 ~ 2025.01.20' },
    { id: 2, title: '레미제라블', category: '뮤지컬', venue: '샤롯데씨어터', date: '2025.01.10 ~ 2025.03.15' },
    { id: 3, title: '베토벤 교향곡', category: '클래식', venue: '예술의전당', date: '2025.02.01 ~ 2025.02.28' },
    { id: 4, title: 'BTS 콘서트', category: '콘서트', venue: '잠실종합운동장', date: '2025.03.01 ~ 2025.03.05' },
    { id: 5, title: '오페라의 유령', category: '뮤지컬', venue: '블루스퀘어', date: '2025.02.15 ~ 2025.04.30' },
    { id: 6, title: '모차르트 피아노', category: '클래식', venue: '세종문화회관', date: '2025.02.20 ~ 2025.03.10' },
    { id: 7, title: '햄릿', category: '연극', venue: '대학로 아트원씨어터', date: '2025.01.20 ~ 2025.03.20' },
    { id: 8, title: '반 고흐 전시', category: '전시/행사', venue: '국립중앙박물관', date: '2025.01.01 ~ 2025.04.30' },
  ];

  const filteredPerformances = activeCategory === '전체' 
    ? performances 
    : performances.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('ticket')}
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
            </div>
          </div>
        </div>

        {/* Category Tabs (티켓 탭일 때만) */}
        {activeTab === 'ticket' && (
          <div className="bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-1 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
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

      {/* Hero Banner */}
      {activeTab === 'ticket' && (
        <section className="relative bg-gradient-to-br from-pink-50 via-white to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Content */}
                <div className="p-12 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-red-600">2025</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    아이유 콘서트
                  </h1>
                  <p className="text-xl text-gray-600 mb-2">HEREH WORLD TOUR</p>
                  <div className="space-y-2 text-gray-500 mb-6">
                    <p className="text-sm">명화라이브홀</p>
                    <p className="text-sm">2025.01.15 - 2025.01.20</p>
                  </div>
                  <Link
                    href="/performance/1"
                    className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    예매하기
                  </Link>
                </div>
                
                {/* Right: Image Placeholder */}
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-16 h-16 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">공연 포스터</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Performance Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">인기 공연</h2>
          <p className="text-gray-600 text-sm">지금 가장 HOT한 공연을 만나보세요</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredPerformances.map((performance) => (
            <Link
              key={performance.id}
              href={`/performance/${performance.id}`}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  {performance.category === '뮤지컬' && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      단독판매
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {performance.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-1">{performance.venue}</p>
                  <p className="text-xs text-gray-400">{performance.date}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
