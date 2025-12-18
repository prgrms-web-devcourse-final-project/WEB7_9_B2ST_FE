'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { tradeApi, type Trade, type TradeType, type TradeStatus } from '@/lib/api/trade';
import { useAuth } from '@/contexts/AuthContext';

export default function TradePage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'exchange' | 'transfer'>('exchange');
  const [trades, setTrades] = useState<Trade[]>([]);
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 가격 포맷팅
  const formatPrice = (price: number | null) => {
    if (price === null) return '가격 협의';
    return `${price.toLocaleString()}원`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">티켓 교환/양도</h1>
            {isAuthenticated && (
              <Link
                href="/trade/register/step1"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                티켓 등록
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left: Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">필터</h2>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">공연 검색</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="공연명 검색"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">구역</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      placeholder="최소"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      placeholder="최대"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Ticket Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">매수</label>
                  <input
                    type="number"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(e.target.value)}
                    placeholder="매수"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Ticket List */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('exchange')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'exchange'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  교환 찾기
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'transfer'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  양도 구매
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
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : (
              <>
                {/* Ticket Cards */}
                <div className="space-y-4 mb-6">
                  {trades.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <p className="text-gray-500">등록된 거래가 없습니다.</p>
                    </div>
                  ) : (
                    trades.map((trade) => (
                      <Link
                        key={trade.tradeId}
                        href={`/trade/${trade.tradeId}`}
                        className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              거래 #{trade.tradeId}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>구역: {trade.section}</p>
                              <p>열: {trade.row}</p>
                              {activeTab === 'exchange' && trade.seatNumber && (
                                <p>좌석: {trade.seatNumber}</p>
                              )}
                              {activeTab === 'transfer' && (
                                <p className="text-purple-600 font-semibold text-base">
                                  가격: {formatPrice(trade.price)}
                                </p>
                              )}
                              <p>매수: {trade.totalCount}매</p>
                              <p>등록일: {formatDate(trade.createdAt)}</p>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              trade.type === 'EXCHANGE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {trade.type === 'EXCHANGE' ? '교환' : '양도'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    <span className="text-sm text-gray-600">
                      {page + 1} / {totalPages} (총 {totalElements}개)
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
