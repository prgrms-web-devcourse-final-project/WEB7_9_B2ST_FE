'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { performanceApi, type PerformanceListRes } from '@/lib/api/performance';

export default function TradeRegisterStep1() {
  const router = useRouter();
  const [tradeType, setTradeType] = useState<'EXCHANGE' | 'TRANSFER'>('EXCHANGE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PerformanceListRes[]>([]);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceListRes | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 검색어 변경 시 debounce 검색
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await performanceApi.searchPerformances(searchQuery.trim(), {
          page: 0,
          size: 10,
          sort: ['createdAt,desc'],
        });

        if (response.data?.content) {
          setSearchResults(response.data.content);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleNext = () => {
    if (!selectedPerformance) return;
    router.push(
      `/trade/register/step2?type=${tradeType}&performanceId=${selectedPerformance.performanceId}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="ml-2 font-medium text-green-600">공연 선택</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium text-gray-500">내 티켓 선택</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 font-medium text-gray-500">최종 확인</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">티켓 등록</h1>

            <div className="space-y-8">
              {/* Trade Type Selection */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">교환/양도 유형 선택</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTradeType('EXCHANGE')}
                    className={`p-6 rounded-lg border-2 text-left transition-colors ${
                      tradeType === 'EXCHANGE'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">교환</h3>
                        <p className="text-sm text-gray-600">다른 좌석과 교환하고 싶을 때</p>
                      </div>
                      {tradeType === 'EXCHANGE' && (
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setTradeType('TRANSFER')}
                    className={`p-6 rounded-lg border-2 text-left transition-colors ${
                      tradeType === 'TRANSFER'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">양도</h3>
                        <p className="text-sm text-gray-600">티켓을 판매하고 싶을 때</p>
                      </div>
                      {tradeType === 'TRANSFER' && (
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Performance Search */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">공연 검색</h2>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="공연명, 아티스트명 등을 입력하세요"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      {searchResults.map((performance) => (
                        <button
                          key={performance.performanceId}
                          onClick={() => {
                            setSelectedPerformance(performance);
                            setSearchQuery(performance.title || '');
                            setSearchResults([]);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            {performance.posterUrl && (
                              <img
                                src={performance.posterUrl}
                                alt={performance.title}
                                className="w-16 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {performance.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-1">
                                {performance.venueName || '장소 정보 없음'}
                              </p>
                              {performance.startDate && performance.endDate && (
                                <p className="text-xs text-gray-500">
                                  {formatDateRange(performance.startDate, performance.endDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Performance */}
              {selectedPerformance && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">선택한 공연</h3>
                  <div className="flex items-start gap-3">
                    {selectedPerformance.posterUrl && (
                      <img
                        src={selectedPerformance.posterUrl}
                        alt={selectedPerformance.title}
                        className="w-20 h-28 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{selectedPerformance.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {selectedPerformance.venueName || '장소 정보 없음'}
                      </p>
                      {selectedPerformance.startDate && selectedPerformance.endDate && (
                        <p className="text-xs text-gray-500">
                          {formatDateRange(selectedPerformance.startDate, selectedPerformance.endDate)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Link
                  href="/trade"
                  className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
                >
                  이전
                </Link>
                <button
                  onClick={handleNext}
                  disabled={!selectedPerformance}
                  className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
