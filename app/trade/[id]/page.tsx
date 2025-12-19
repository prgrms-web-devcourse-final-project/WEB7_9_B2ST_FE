'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tradeApi, type Trade, type Ticket } from '@/lib/api/trade';
import Link from 'next/link';
import Header from '@/components/Header';

export default function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tradeId = Number(id);
  
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 교환 신청 관련 상태
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null | undefined>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(false);
  
  // 가격 수정 관련 상태
  const [showPriceEditModal, setShowPriceEditModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  useEffect(() => {
    const fetchTradeDetail = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await tradeApi.getTradeDetail(tradeId);
        if (response.data) {
          setTrade(response.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('거래 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (tradeId) {
      fetchTradeDetail();
    }
  }, [tradeId]);

  const handleOpenExchangeModal = async () => {
    setShowExchangeModal(true);
    setIsFetchingTickets(true);
    setError('');

    try {
      const response = await tradeApi.getMyTickets();
      if (response.data) {
        // ISSUED 상태인 티켓만 필터링
        const availableTickets = response.data.filter(
          ticket => ticket.status === 'ISSUED'
        );
        setMyTickets(availableTickets);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('티켓 목록을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsFetchingTickets(false);
    }
  };

  const handleSubmitExchange = async () => {
    if (!selectedTicketId) {
      setError('교환할 티켓을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await tradeApi.createTradeRequest(tradeId, {
        requesterTicketId: selectedTicketId,
      });

      if (response.data) {
        alert('교환 신청이 완료되었습니다.');
        setShowExchangeModal(false);
        setSelectedTicketId(null);
        // 거래 상세 정보 다시 불러오기
        const tradeResponse = await tradeApi.getTradeDetail(tradeId);
        if (tradeResponse.data) {
          setTrade(tradeResponse.data);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('교환 신청에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return '가격 협의';
    return `${price.toLocaleString()}원`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !trade) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || '거래를 찾을 수 없습니다.'}</p>
            <Link
              href="/trade"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!trade) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/trade"
          className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block"
        >
          ← 목록으로
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">거래 상세</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              trade.type === 'EXCHANGE'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {trade.type === 'EXCHANGE' ? '교환' : '양도'}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">거래 ID</p>
                  <p className="font-medium text-gray-900">{trade.tradeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">상태</p>
                  <p className="font-medium text-gray-900">
                    {trade.status === 'ACTIVE' ? '진행중' : 
                     trade.status === 'COMPLETED' ? '완료' : '취소됨'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">공연 ID</p>
                  <p className="font-medium text-gray-900">{trade.performanceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">일정 ID</p>
                  <p className="font-medium text-gray-900">{trade.scheduleId}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">좌석 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">구역</p>
                  <p className="font-medium text-gray-900">{trade.section}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">열</p>
                  <p className="font-medium text-gray-900">{trade.row}</p>
                </div>
                {trade.seatNumber && (
                  <div>
                    <p className="text-sm text-gray-600">좌석 번호</p>
                    <p className="font-medium text-gray-900">{trade.seatNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">매수</p>
                  <p className="font-medium text-gray-900">{trade.totalCount}매</p>
                </div>
              </div>
            </div>

            {trade.type === 'TRANSFER' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">가격 정보</h2>
                  {trade.status === 'ACTIVE' && (
                    <button
                      onClick={() => {
                        setShowPriceEditModal(true);
                        setNewPrice(trade.price?.toString() || '');
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      가격 수정
                    </button>
                  )}
                </div>
                <p className="text-2xl font-bold text-purple-600">{formatPrice(trade.price)}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">등록 정보</h2>
              <p className="text-sm text-gray-600">등록일시</p>
              <p className="font-medium text-gray-900">{formatDate(trade.createdAt)}</p>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              {trade.type === 'EXCHANGE' && trade.status === 'ACTIVE' && (
                <button
                  onClick={handleOpenExchangeModal}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  교환 신청하기
                </button>
              )}
              {trade.type === 'TRANSFER' && trade.status === 'ACTIVE' && (
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  구매하기
                </button>
              )}
              {trade.status === 'ACTIVE' && (
                <button
                  onClick={async () => {
                    if (!confirm('정말로 이 거래를 삭제하시겠습니까?\n대기 중인 신청이 있으면 삭제할 수 없습니다.')) {
                      return;
                    }

                    setIsLoading(true);
                    setError('');

                    try {
                      await tradeApi.deleteTrade(tradeId);
                      alert('거래가 삭제되었습니다.');
                      router.push('/trade');
                    } catch (err) {
                      if (err instanceof Error) {
                        setError(err.message);
                      } else {
                        setError('거래 삭제에 실패했습니다.');
                      }
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  거래 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 교환 신청 모달 */}
      {showExchangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">교환 신청</h2>
                <button
                  onClick={() => {
                    setShowExchangeModal(false);
                    setSelectedTicketId(null);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">교환할 티켓을 선택해주세요</p>
                  {isFetchingTickets ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">티켓 목록을 불러오는 중...</p>
                    </div>
                  ) : myTickets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">교환 가능한 티켓이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {myTickets.map((ticket) => (
                        <button
                          key={ticket.ticketId}
                          onClick={() => setSelectedTicketId(ticket.ticketId ?? null)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                            selectedTicketId === ticket.ticketId
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">티켓 ID: {ticket.ticketId}</p>
                              <p className="text-sm text-gray-600">예약 ID: {ticket.reservationId}</p>
                            </div>
                            {selectedTicketId === ticket.ticketId && (
                              <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowExchangeModal(false);
                      setSelectedTicketId(null);
                      setError('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitExchange}
                    disabled={!selectedTicketId || isSubmitting}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '신청 중...' : '신청하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 가격 수정 모달 */}
      {showPriceEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">가격 수정</h2>
                <button
                  onClick={() => {
                    setShowPriceEditModal(false);
                    setNewPrice('');
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 가격 (원)
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="예: 50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPriceEditModal(false);
                      setNewPrice('');
                      setError('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={async () => {
                      if (!newPrice || parseInt(newPrice) <= 0) {
                        setError('올바른 가격을 입력해주세요.');
                        return;
                      }

                      setIsUpdatingPrice(true);
                      setError('');

                      try {
                        await tradeApi.updateTradePrice(tradeId, parseInt(newPrice));
                        alert('가격이 수정되었습니다.');
                        setShowPriceEditModal(false);
                        setNewPrice('');
                        
                        // 거래 상세 정보 다시 불러오기
                        const tradeResponse = await tradeApi.getTradeDetail(tradeId);
                        if (tradeResponse.data) {
                          setTrade(tradeResponse.data);
                        }
                      } catch (err) {
                        if (err instanceof Error) {
                          setError(err.message);
                        } else {
                          setError('가격 수정에 실패했습니다.');
                        }
                      } finally {
                        setIsUpdatingPrice(false);
                      }
                    }}
                    disabled={isUpdatingPrice}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPrice ? '수정 중...' : '수정하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
