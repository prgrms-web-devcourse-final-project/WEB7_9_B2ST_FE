'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Header from '@/components/Header';
import { tradeApi, type Ticket, type CreateTradeRequest } from '@/lib/api/trade';
import { performanceApi, type PerformanceDetailRes } from '@/lib/api/performance';

function TradeRegisterStep3Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tradeType = (searchParams.get('type') || 'EXCHANGE') as 'EXCHANGE' | 'TRANSFER';
  const performanceIdParam = searchParams.get('performanceId');
  const ticketIdsParam = searchParams.get('ticketIds');
  const priceParam = searchParams.get('price');

  const performanceId = performanceIdParam ? Number(performanceIdParam) : null;
  const ticketIds = ticketIdsParam
    ? ticketIdsParam.split(',').map((id) => Number(id))
    : [];

  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [price, setPrice] = useState(priceParam || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  // 공연 정보 및 선택한 티켓 정보 조회
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        // 공연 정보 조회
        if (performanceId) {
          const performanceResponse = await performanceApi.getPerformance(performanceId);
          if (performanceResponse.data) {
            setPerformance(performanceResponse.data);
          }
        }

        // 선택한 티켓 정보 조회
        if (ticketIds.length > 0) {
          const ticketsResponse = await tradeApi.getMyTickets();
          if (ticketsResponse.data) {
            const filtered = ticketsResponse.data.filter(
              (ticket) => ticket.ticketId !== undefined && ticketIds.includes(ticket.ticketId)
            );
            setSelectedTickets(filtered);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [performanceId, ticketIds.join(',')]);

  const handleSubmit = async () => {
    if (selectedTickets.length === 0) {
      setError('티켓을 선택해주세요.');
      return;
    }

    if (tradeType === 'TRANSFER' && !price) {
      setError('가격을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let request: CreateTradeRequest;

      if (tradeType === 'EXCHANGE') {
        // 교환: ticketIds 배열 사용 (1개만)
        request = {
          ticketIds: ticketIds,
          type: 'EXCHANGE',
        };
      } else {
        // 양도: ticketIds 배열과 price 사용
        request = {
          ticketIds: ticketIds,
          type: 'TRANSFER',
          price: parseInt(price),
        };
      }

      const response = await tradeApi.createTrade(request);

      if (response.data) {
        alert('거래가 등록되었습니다.');
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

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

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
                  ✓
                </div>
                <span className="ml-2 font-medium text-green-600">공연 선택</span>
              </div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 font-medium text-green-600">내 티켓 선택</span>
              </div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 font-medium text-green-600">최종 확인</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">최종 확인</h1>
              <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded">
                {tradeType === 'EXCHANGE' ? '교환' : '양도'}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Performance Info */}
              {performance && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-700">공연</h3>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-1">{performance.title}</h4>
                    <p className="text-sm text-gray-600">{performance.venue?.name || '장소 정보 없음'}</p>
                  </div>
                </div>
              )}

              {/* Selected Tickets */}
              {selectedTickets.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-2">선택한 티켓</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                    {selectedTickets.map((ticket) => (
                      <div key={ticket.ticketId} className="text-sm text-gray-700">
                        • {ticket.sectionName || '구역 정보 없음'}구역 {ticket.rowLabel || ''}열{' '}
                        {ticket.seatNumber || ''}번
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Input (양도만) */}
              {tradeType === 'TRANSFER' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="예: 50000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {/* Guidance */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  {tradeType === 'EXCHANGE'
                    ? '안내: 교환 등록 후 다른 사용자들이 교환을 제안할 수 있습니다. 실제 교환은 1:1 대화를 통해 진행됩니다.'
                    : '안내: 양도 등록 후 다른 사용자들이 구매할 수 있습니다. 실제 거래는 1:1 대화를 통해 진행됩니다.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link
                  href={`/trade/register/step2?type=${tradeType}&performanceId=${performanceId}`}
                  className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
                >
                  이전
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || (tradeType === 'TRANSFER' && !price)}
                  className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '등록 중...' : '등록하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradeRegisterStep3() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-400">로딩 중...</div>
            </div>
          </div>
        </div>
      }
    >
      <TradeRegisterStep3Content />
    </Suspense>
  );
}

