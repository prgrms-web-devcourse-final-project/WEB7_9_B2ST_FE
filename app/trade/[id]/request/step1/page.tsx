'use client';

import Link from 'next/link';
import { useState, useEffect, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { tradeApi, type Trade, type Ticket } from '@/lib/api/trade';
import { performanceApi, type PerformanceDetailRes } from '@/lib/api/performance';

function TradeRequestStep1Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tradeId = Number(id);

  const [trade, setTrade] = useState<Trade | null>(null);
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(null);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

        // 내 티켓 목록 조회
        const ticketsResponse = await tradeApi.getMyTickets();
        if (ticketsResponse.data) {
          // 같은 공연의 ISSUED 상태 티켓만 필터링
          const filteredTickets = ticketsResponse.data.filter(
            (ticket) =>
              ticket.performanceId === tradeResponse.data.performanceId &&
              ticket.status === 'ISSUED'
          );
          setMyTickets(filteredTickets);
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

    if (tradeId) {
      fetchData();
    }
  }, [tradeId]);

  const handleNext = () => {
    if (!selectedTicketId) {
      setError('교환할 티켓을 선택해주세요.');
      return;
    }
    router.push(`/trade/${tradeId}/request/step2?ticketId=${selectedTicketId}`);
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
              href={`/trade/${tradeId}`}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              돌아가기
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
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <span className="ml-2 font-semibold text-red-600">티켓 선택</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-semibold text-gray-500">확정</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">교환 신청</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* 교환 대상 정보 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">교환 대상</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                {performance && performance.posterUrl && (
                  <div className="flex gap-4 mb-4">
                    <img
                      src={performance.posterUrl}
                      alt={performance.title || '공연 포스터'}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{performance.title}</h3>
                      {performance.venue?.name && (
                        <p className="text-sm text-gray-600 mb-1">장소: {performance.venue.name}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {trade.section && (
                      <div>
                        <span className="font-semibold text-gray-700">구역:</span>{' '}
                        <span className="text-gray-900">{trade.section}</span>
                      </div>
                    )}
                    {trade.row && (
                      <div>
                        <span className="font-semibold text-gray-700">열:</span>{' '}
                        <span className="text-gray-900">{trade.row}</span>
                      </div>
                    )}
                    {trade.seatNumber && (
                      <div>
                        <span className="font-semibold text-gray-700">좌석:</span>{' '}
                        <span className="text-gray-900">{trade.seatNumber}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-gray-700">매수:</span>{' '}
                      <span className="text-gray-900">{trade.totalCount || 0}매</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 내 티켓 선택 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                교환할 내 티켓 선택 ({performance?.title || '같은 공연'})
              </h2>
              {myTickets.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    교환 가능한 티켓이 없습니다.
                    <br />
                    같은 공연의 발급된 티켓이 필요합니다.
                  </p>
                  <Link
                    href={`/trade/${tradeId}`}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    돌아가기
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTickets.map((ticket) => (
                    <button
                      key={ticket.ticketId}
                      onClick={() => setSelectedTicketId(ticket.ticketId ?? null)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                        selectedTicketId === ticket.ticketId
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {ticket.sectionName && ticket.rowLabel && ticket.seatNumber ? (
                            <>
                              <p className="font-semibold text-gray-900 mb-1">
                                {ticket.sectionName}구역 {ticket.rowLabel}열 {ticket.seatNumber}번
                              </p>
                              {ticket.reservationId && (
                                <p className="text-xs text-gray-500">예약번호: {ticket.reservationId}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-gray-900">티켓 ID: {ticket.ticketId}</p>
                              {ticket.reservationId && (
                                <p className="text-sm text-gray-600">예약 ID: {ticket.reservationId}</p>
                              )}
                            </>
                          )}
                        </div>
                        {selectedTicketId === ticket.ticketId && (
                          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center ml-4">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-6 border-t">
              <Link
                href={`/trade/${tradeId}`}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
              >
                취소
              </Link>
              <button
                onClick={handleNext}
                disabled={!selectedTicketId || myTickets.length === 0}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음 단계
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradeRequestStep1({ params }: { params: Promise<{ id: string }> }) {
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
      <TradeRequestStep1Content params={params} />
    </Suspense>
  );
}

