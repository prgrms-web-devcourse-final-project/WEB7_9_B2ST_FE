'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { tradeApi, type Trade, type TradeType, type TradeStatus } from '@/lib/api/trade';
import { performanceApi, type PerformanceDetailRes } from '@/lib/api/performance';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

export default function TradePage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'exchange' | 'transfer'>('exchange');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [performanceMap, setPerformanceMap] = useState<Record<number, PerformanceDetailRes>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ticketCount, setTicketCount] = useState('');

  // API 호출
  const fetchTrades = async () => {
    setIsLoading(true);
    setError('');

    try {
      const type: TradeType = activeTab === 'exchange' ? 'EXCHANGE' : 'TRANSFER';
      const params = {
        type,
        status: 'ACTIVE' as TradeStatus,
        page,
        size: 10,
        sort: 'createdAt,desc',
      };

      const response = await tradeApi.getTradeList(params);
      
      if (response.data) {
        setTrades(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);

        // 공연 정보 가져오기 (중복 제거)
        const uniquePerformanceIds = [
          ...new Set(
            response.data.content
              .map((trade) => trade.performanceId)
              .filter((id): id is number => id !== undefined && id !== null)
          ),
        ];

        // 공연 정보 병렬 조회
        const performancePromises = uniquePerformanceIds.map(async (performanceId) => {
          try {
            const perfResponse = await performanceApi.getPerformance(performanceId);
            return { performanceId, performance: perfResponse.data };
          } catch (err) {
            console.error(`공연 ${performanceId} 정보 조회 실패:`, err);
            return { performanceId, performance: null };
          }
        });

        const performanceResults = await Promise.all(performancePromises);
        const newPerformanceMap: Record<number, PerformanceDetailRes> = {};
        performanceResults.forEach(({ performanceId, performance }) => {
          if (performance) {
            newPerformanceMap[performanceId] = performance;
          }
        });
        setPerformanceMap((prev) => ({ ...prev, ...newPerformanceMap }));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('거래 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [activeTab, page]);

  // 탭 변경 시 페이지 초기화
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  // 날짜 포맷팅
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 가격 포맷팅
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '가격 협의';
    return `${price.toLocaleString()}원`;
  };

  // 날짜 범위 포맷팅
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
    <div className="min-h-screen bg-gray-50">
      <Header activeTab="trade" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">티켓 교환/양도</h1>
          {isAuthenticated && (
            <Link
              href="/trade/register/step1"
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
            >
              티켓 등록
            </Link>
          )}
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left: Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-6">필터</h2>
              
              <div className="space-y-5">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">공연 검색</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="공연명 검색"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">구역</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="">전체</option>
                    <option value="VIP">VIP석</option>
                    <option value="R">R석</option>
                    <option value="S">S석</option>
                    <option value="A">A석</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">가격</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      placeholder="최소"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      placeholder="최대"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Ticket Count */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">매수</label>
                  <input
                    type="number"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(e.target.value)}
                    placeholder="매수"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Ticket List */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('exchange')}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors relative ${
                    activeTab === 'exchange'
                      ? 'text-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  교환 찾기
                  {activeTab === 'exchange' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors relative ${
                    activeTab === 'transfer'
                      ? 'text-red-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  양도 구매
                  {activeTab === 'transfer' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : (
              <>
                {/* Ticket Cards */}
                <div className="space-y-4 mb-6">
                  {trades.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <p className="text-gray-500">등록된 거래가 없습니다.</p>
                    </div>
                  ) : (
                    trades.map((trade) => {
                      const performance = trade.performanceId
                        ? performanceMap[trade.performanceId]
                        : null;

                      return (
                        <Link
                          key={trade.tradeId}
                          href={`/trade/${trade.tradeId}`}
                          className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="flex gap-6">
                            {/* 공연 포스터 */}
                            {performance?.posterUrl && (
                              <div className="flex-shrink-0">
                                <img
                                  src={performance.posterUrl}
                                  alt={performance.title || '공연 포스터'}
                                  className="w-24 h-32 object-cover rounded-lg"
                                />
                              </div>
                            )}

                            {/* 거래 정보 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  {performance ? (
                                    <>
                                      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                                        {performance.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 mb-2">
                                        {performance.venue?.name || '장소 정보 없음'}
                                      </p>
                                      {performance.startDate && performance.endDate && (
                                        <p className="text-xs text-gray-500 mb-2">
                                          {formatDateRange(performance.startDate, performance.endDate)}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                      거래 #{trade.tradeId}
                                    </h3>
                                  )}
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <span
                                    className={`px-4 py-2 rounded-full text-xs font-semibold ${
                                      trade.type === 'EXCHANGE'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                                  >
                                    {trade.type === 'EXCHANGE' ? '교환' : '양도'}
                                  </span>
                                </div>
                              </div>

                              {/* 좌석 정보 */}
                              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">좌석 정보</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  {trade.section && (
                                    <p className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">구역:</span>
                                      <span>{trade.section}</span>
                                    </p>
                                  )}
                                  {trade.row && (
                                    <p className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">열:</span>
                                      <span>{trade.row}</span>
                                    </p>
                                  )}
                                  {trade.seatNumber && trade.type === 'EXCHANGE' && (
                                    <p className="flex items-center gap-2">
                                      <span className="font-medium text-gray-700">좌석:</span>
                                      <span>{trade.seatNumber}</span>
                                    </p>
                                  )}
                                  <p className="flex items-center gap-2">
                                    <span className="font-medium text-gray-700">매수:</span>
                                    <span>{trade.totalCount || 0}매</span>
                                  </p>
                                </div>
                              </div>

                              {/* 가격 정보 (양도만) */}
                              {activeTab === 'transfer' && (
                                <div className="mb-3">
                                  <p className="flex items-center gap-2 text-lg">
                                    <span className="font-semibold text-gray-700">가격:</span>
                                    <span className="text-red-600 font-bold">
                                      {formatPrice(trade.price)}
                                    </span>
                                  </p>
                                </div>
                              )}

                              {/* 등록일 */}
                              <p className="text-xs text-gray-400">
                                등록일: {formatDate(trade.createdAt)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 bg-white rounded-xl shadow-sm p-4">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-sm"
                    >
                      이전
                    </button>
                    <span className="text-sm text-gray-600">
                      {page + 1} / {totalPages} (총 {totalElements}개)
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-sm"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
