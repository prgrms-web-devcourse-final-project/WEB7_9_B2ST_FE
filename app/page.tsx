'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { performanceApi, type PerformanceListRes } from '@/lib/api/performance';
import Header from '@/components/Header';

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'ticket' | 'trade'>('ticket');
  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [performances, setPerformances] = useState<PerformanceListRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['전체', '콘서트', '뮤지컬', '클래식', '연극', '전시/행사'];

  // 공연 목록 조회
  useEffect(() => {
    const fetchPerformances = async () => {
      if (activeTab !== 'ticket') return;

      setIsLoading(true);
      setError('');

      try {
        const response = await performanceApi.getPerformances({
          page: 0,
          size: 20,
          sort: ['createdAt,desc'],
        });

        if (response.data?.content) {
          setPerformances(response.data.content);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('공연 목록을 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformances();
  }, [activeTab]);

  const filteredPerformances = activeCategory === '전체' 
    ? performances 
    : performances.filter(p => p.category === activeCategory);

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return '';
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showCategoryTabs={activeTab === 'ticket'}
        activeCategory={activeCategory}
        categories={categories}
        onCategoryChange={setActiveCategory}
      />

      {/* Hero Banner */}
      {activeTab === 'ticket' && performances.length > 0 && (
        <section className="relative bg-gradient-to-br from-pink-50 via-white to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Content */}
                <div className="p-12 flex flex-col justify-center">
                  {performances[0].startDate && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-red-600">
                        {new Date(performances[0].startDate).getFullYear()}
                      </span>
                    </div>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {performances[0].title}
                  </h1>
                  {performances[0].category && (
                    <p className="text-xl text-gray-600 mb-2">{performances[0].category}</p>
                  )}
                  <div className="space-y-2 text-gray-500 mb-6">
                    {performances[0].venueName && (
                      <p className="text-sm">{performances[0].venueName}</p>
                    )}
                    {(performances[0].startDate || performances[0].endDate) && (
                      <p className="text-sm">
                        {formatDateRange(performances[0].startDate, performances[0].endDate)}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/performance/${performances[0].performanceId}`}
                    className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    예매하기
                  </Link>
                </div>
                
                {/* Right: Image */}
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center min-h-[400px] relative overflow-hidden">
                  {performances[0].posterUrl ? (
                    <img
                      src={performances[0].posterUrl}
                      alt={performances[0].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-16 h-16 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">공연 포스터</p>
                    </div>
                  )}
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">공연 목록을 불러오는 중...</div>
          </div>
        ) : filteredPerformances.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">표시할 공연이 없습니다.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredPerformances.map((performance) => (
              <Link
                key={performance.performanceId}
                href={`/performance/${performance.performanceId}`}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {performance.posterUrl ? (
                      <img
                        src={performance.posterUrl}
                        alt={performance.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}
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
                    <p className="text-xs text-gray-500 mb-1">{performance.venueName}</p>
                    <p className="text-xs text-gray-400">
                      {formatDateRange(performance.startDate, performance.endDate)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
