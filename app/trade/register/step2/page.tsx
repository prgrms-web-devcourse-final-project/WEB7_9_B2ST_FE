'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { tradeApi, type Ticket, type CreateTradeRequest } from '@/lib/api/trade';
import Header from '@/components/Header';

function TradeRegisterStep2Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tradeType = searchParams.get('type') || 'exchange';
  const performance = searchParams.get('performance') || '';
  const date = searchParams.get('date') || '';
  
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTickets, setIsFetchingTickets] = useState(true);
  const [error, setError] = useState('');

  // 내 티켓 목록 가져오기
  useEffect(() => {
    const fetchMyTickets = async () => {
      setIsFetchingTickets(true);
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

    fetchMyTickets();
  }, []);

  const handleTicketToggle = (ticketId: number | undefined) => {
    if (!ticketId) return;
    
    if (tradeType === 'exchange') {
      // 교환은 1개만 선택 가능
      setSelectedTicketIds([ticketId]);
    } else {
      // 양도는 여러 개 선택 가능
      setSelectedTicketIds(prev =>
        prev.includes(ticketId)
          ? prev.filter(id => id !== ticketId)
          : [...prev, ticketId]
      );
    }
  };

  const handleSubmit = async () => {
    if (selectedTicketIds.length === 0) {
      setError('티켓을 선택해주세요.');
      return;
    }

    if (tradeType === 'transfer' && !price) {
      setError('가격을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let request: CreateTradeRequest;

      if (tradeType === 'exchange') {
        // 교환: 1개 티켓만
        request = {
          ticketIds: [selectedTicketIds[0]],
          type: 'EXCHANGE',
        };
      } else {
        // 양도: 여러 티켓 가능
        request = {
          ticketIds: selectedTicketIds,
          type: 'TRANSFER',
          price: parseInt(price),
        };
      }

      const response = await tradeApi.createTrade(request);
      
      if (response.data) {
        router.push('/trade');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('거래 등록에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
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
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="ml-2 font-medium text-gray-500">기본 정보</span>
            </div>
            <div className="w-16 h-1 bg-purple-600"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-2 font-medium text-purple-600">티켓 선택</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">티켓 선택</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Selected Performance Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">공연</p>
              <p className="font-medium text-gray-900">{performance}</p>
              <p className="text-sm text-gray-600 mt-2">날짜: {date}</p>
              <p className="text-sm text-gray-600">
                유형: {tradeType === 'exchange' ? '교환' : '양도'}
              </p>
            </div>

            {/* Ticket Selection */}
            {isFetchingTickets ? (
              <div className="text-center py-12">
                <p className="text-gray-500">티켓 목록을 불러오는 중...</p>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">등록 가능한 티켓이 없습니다.</p>
                <Link
                  href="/my-page"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  마이페이지에서 확인하기
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {tradeType === 'exchange' ? '교환할 티켓 선택 (1개)' : '양도할 티켓 선택 (여러 개 가능)'}
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {myTickets.map((ticket) => (
                      <button
                        key={ticket.ticketId}
                        onClick={() => handleTicketToggle(ticket.ticketId)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                          ticket.ticketId !== undefined && selectedTicketIds.includes(ticket.ticketId)
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">티켓 ID: {ticket.ticketId}</p>
                            <p className="text-sm text-gray-600">예약 ID: {ticket.reservationId}</p>
                          </div>
                          {ticket.ticketId !== undefined && selectedTicketIds.includes(ticket.ticketId) && (
                            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    선택된 티켓: {selectedTicketIds.length}개
                  </p>
                </div>

                {/* Price Input (양도만) */}
                {tradeType === 'transfer' && selectedTicketIds.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가격 (원)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="예: 50000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Link
                    href="/trade/register/step1"
                    className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
                  >
                    이전 단계
                  </Link>
                  {selectedTicketIds.length > 0 && (tradeType === 'exchange' || price) && (
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '등록 중...' : '등록하기'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function TradeRegisterStep2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        </div>
      </div>
    }>
      <TradeRegisterStep2Content />
    </Suspense>
  );
}
