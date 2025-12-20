'use client';

import Link from 'next/link';
import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { tradeApi, type Trade, type Ticket } from '@/lib/api/trade';
import { performanceApi, type PerformanceDetailRes } from '@/lib/api/performance';

function TradeRequestStep2Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tradeId = Number(id);
  const ticketId = Number(searchParams.get('ticketId'));

  const [trade, setTrade] = useState<Trade | null>(null);
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(null);
  const [myTicket, setMyTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // 거래 정보 조회
        const tradeResponse = await tradeApi.getTradeDetail(tradeId);
        if (!tradeResponse.data) {
          setError('거래 정보를 찾을 수 없습니다.');
          return;
        }

        setTrade(tradeResponse.data);

        // 공연 정보 조회
        if (tradeResponse.data.performanceId) {
          try {
            const perfResponse = await performanceApi.getPerformance(tradeResponse.data.performanceId);
            if (perfResponse.data) {
              setPerformance(perfResponse.data);
            }
          } catch (err) {
            console.error('공연 정보 조회 실패:', err);
          }
        }

        // 선택한 티켓 정보 조회
        if (ticketId) {
          const ticketsResponse = await tradeApi.getMyTickets();
          if (ticketsResponse.data) {
            const foundTicket = ticketsResponse.data.find(
              (t) => t.ticketId === ticketId && t.performanceId === tradeResponse.data.performanceId
            );
            if (foundTicket) {
              setMyTicket(foundTicket);
            } else {
              setError('선택한 티켓을 찾을 수 없습니다.');
            }
          }
        } else {
          setError('티켓 ID가 필요합니다.');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (tradeId && ticketId) {
      fetchData();
    } else {
      setError('필수 정보가 누락되었습니다.');
      setIsLoading(false);
    }
  }, [tradeId, ticketId]);

  const handleSubmit = async () => {
    if (!ticketId) {
      setError('티켓을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await tradeApi.createTradeRequest(tradeId, {
        requesterTicketId: ticketId,
      });

      if (response.data) {
        alert('교환 신청이 완료되었습니다.');
        router.push(`/trade/${tradeId}`);
      }
    } catch (err: any) {
      // API 에러 메시지 추출
      let errorMessage = '교환 신청에 실패했습니다.';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage = String(err.message);
        } else if ('response' in err && err.response) {
          const response = err.response as any;
          if (response.data && response.data.message) {
            errorMessage = response.data.message;
          } else if (response.message) {
            errorMessage = response.message;
          }
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href={`/trade/${tradeId}/request/step1`}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!trade || !myTicket) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
                  1
                </div>
                <span className="ml-2 font-semibold text-gray-500">티켓 선택</span>
              </div>
              <div className="w-16 h-0.5 bg-red-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-semibold text-red-600">확정</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">교환 신청 확정</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* 교환 정보 요약 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">교환 정보</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* 교환 대상 (받을 티켓) */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">받을 티켓</h3>
                  {performance && performance.posterUrl && (
                    <img
                      src={performance.posterUrl}
                      alt={performance.title || '공연 포스터'}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-2 text-sm">
                    {performance && (
                      <p className="font-semibold text-gray-900">{performance.title}</p>
                    )}
                    {performance?.venue?.name && (
                      <p className="text-gray-600">장소: {performance.venue.name}</p>
                    )}
                    <div className="bg-white rounded-lg p-3 mt-3">
                      <div className="space-y-1">
                        {trade.section && (
                          <p>
                            <span className="font-semibold text-gray-700">구역:</span>{' '}
                            <span className="text-gray-900">{trade.section}</span>
                          </p>
                        )}
                        {trade.row && (
                          <p>
                            <span className="font-semibold text-gray-700">열:</span>{' '}
                            <span className="text-gray-900">{trade.row}</span>
                          </p>
                        )}
                        {trade.seatNumber && (
                          <p>
                            <span className="font-semibold text-gray-700">좌석:</span>{' '}
                            <span className="text-gray-900">{trade.seatNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 내 티켓 (줄 티켓) */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">줄 티켓</h3>
                  {performance && performance.posterUrl && (
                    <img
                      src={performance.posterUrl}
                      alt={performance.title || '공연 포스터'}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-2 text-sm">
                    {performance && (
                      <p className="font-semibold text-gray-900">{performance.title}</p>
                    )}
                    {performance?.venue?.name && (
                      <p className="text-gray-600">장소: {performance.venue.name}</p>
                    )}
                    <div className="bg-white rounded-lg p-3 mt-3">
                      <div className="space-y-1">
                        {myTicket.sectionName && (
                          <p>
                            <span className="font-semibold text-gray-700">구역:</span>{' '}
                            <span className="text-gray-900">{myTicket.sectionName}</span>
                          </p>
                        )}
                        {myTicket.rowLabel && (
                          <p>
                            <span className="font-semibold text-gray-700">열:</span>{' '}
                            <span className="text-gray-900">{myTicket.rowLabel}</span>
                          </p>
                        )}
                        {myTicket.seatNumber && (
                          <p>
                            <span className="font-semibold text-gray-700">좌석:</span>{' '}
                            <span className="text-gray-900">{myTicket.seatNumber}번</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 안내 사항 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-red-800">
                교환 신청을 확정하면 상대방이 수락할 때까지 대기 상태가 됩니다.
                <br />
                상대방이 수락하면 교환이 완료됩니다.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-6 border-t">
              <Link
                href={`/trade/${tradeId}/request/step1`}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
              >
                이전 단계
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '신청 중...' : '교환 신청 확정'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradeRequestStep2({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <TradeRequestStep2Content params={params} />
    </Suspense>
  );
}

