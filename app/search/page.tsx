'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { performanceApi, type PerformanceListRes } from '@/lib/api/performance';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [performances, setPerformances] = useState<PerformanceListRes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 검색 실행
  useEffect(() => {
    const searchPerformances = async () => {
      if (!query.trim()) {
        setPerformances([]);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await performanceApi.searchPerformances(query, {
          page,
          size: 20,
          sort: ['createdAt,desc'],
        });

        if (response.data) {
          setPerformances(response.data.content || []);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('검색 중 오류가 발생했습니다.');
        }
        setPerformances([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchPerformances();
  }, [query, page]);

  // 날짜 포맷팅
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const end = new Date(endDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return `${start} ~ ${end}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 검색 결과 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            검색 결과
          </h1>
          {query && (
            <p className="text-gray-600">
              &quot;<span className="font-semibold text-red-600">{query}</span>&quot;에 대한 검색 결과{' '}
              {totalElements > 0 && (
                <span className="text-gray-500">({totalElements.toLocaleString()}개)</span>
              )}
            </p>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">검색 중...</div>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!isLoading && !error && query && performances.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-2">검색 결과가 없습니다</p>
            <p className="text-gray-400 text-sm">다른 키워드로 검색해보세요</p>
          </div>
        )}

        {/* 검색어 없음 */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="w-16 h-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg mb-2">검색어를 입력해주세요</p>
            <p className="text-gray-400 text-sm">상단 검색창에서 공연이나 아티스트를 검색하세요</p>
          </div>
        )}

        {/* 검색 결과 그리드 */}
        {!isLoading && !error && performances.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {performances.map((performance) => (
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
                          alt={performance.title || 'Performance Poster'}
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

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        </main>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

