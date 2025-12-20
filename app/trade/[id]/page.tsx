'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tradeApi, type Trade, type Ticket } from '@/lib/api/trade';
import { performanceApi, type PerformanceDetailRes, type PerformanceScheduleListRes } from '@/lib/api/performance';
import { mypageApi } from '@/lib/api/mypage';
import Link from 'next/link';
import Header from '@/components/Header';

export default function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tradeId = Number(id);
  
  const [trade, setTrade] = useState<Trade | null>(null);
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(null);
  const [schedule, setSchedule] = useState<PerformanceScheduleListRes | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [myTradeRequest, setMyTradeRequest] = useState<{ tradeRequestId: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  // 가격 수정 관련 상태
  const [showPriceEditModal, setShowPriceEditModal] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  
  // 삭제 관련 상태
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTradeDetail = async () => {
      setIsLoading(true);
      setError('');

      try {
        // 현재 사용자 정보 조회
        try {
          const myInfoResponse = await mypageApi.getMyInfo();
          if (myInfoResponse.data?.memberId) {
            setCurrentUserId(myInfoResponse.data.memberId);
          }
        } catch (err) {
          // 로그인하지 않은 경우 무시
          console.log('사용자 정보 조회 실패 (로그인 필요):', err);
        }

        const response = await tradeApi.getTradeDetail(tradeId);
        if (response.data) {
          setTrade(response.data);

          // 공연 정보 조회
          if (response.data.performanceId) {
            try {
              const perfResponse = await performanceApi.getPerformance(response.data.performanceId);
              if (perfResponse.data) {
                setPerformance(perfResponse.data);
              }
            } catch (err) {
              console.error('공연 정보 조회 실패:', err);
            }
          }

          // 일정 정보 조회
          if (response.data.performanceId && response.data.scheduleId) {
            try {
              const schedulesResponse = await performanceApi.getSchedules(response.data.performanceId);
              if (schedulesResponse.data) {
                const foundSchedule = schedulesResponse.data.find(
                  (s) => s.performanceScheduleId === response.data.scheduleId
                );
                if (foundSchedule) {
                  setSchedule(foundSchedule);
                }
              }
            } catch (err) {
              console.error('일정 정보 조회 실패:', err);
            }
          }

          // 내가 이미 신청했는지 확인
          if (currentUserId && response.data.type === 'EXCHANGE') {
            try {
              const myRequestsResponse = await tradeApi.getTradeRequestList({
                requesterId: currentUserId,
              });
              if (myRequestsResponse.data) {
                const myRequest = myRequestsResponse.data.find(
                  (req) => req.tradeId === response.data.tradeId
                );
                if (myRequest && myRequest.tradeRequestId) {
                  setMyTradeRequest({ tradeRequestId: myRequest.tradeRequestId });
                }
              }
            } catch (err) {
              console.error('내 신청 목록 조회 실패:', err);
            }
          }
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
  }, [tradeId, currentUserId]);


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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
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
          className="text-red-600 hover:text-red-700 font-medium mb-6 inline-block"
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
            {/* 공연 정보 */}
            {performance && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">공연 정보</h2>
                <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
                  {performance.posterUrl && (
                    <img
                      src={performance.posterUrl}
                      alt={performance.title || '공연 포스터'}
                      className="w-32 h-44 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{performance.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {performance.venue?.name && (
                        <p>
                          <span className="font-semibold text-gray-700">장소:</span>{' '}
                          {performance.venue.name}
                        </p>
                      )}
                      {performance.startDate && performance.endDate && (
                        <p>
                          <span className="font-semibold text-gray-700">공연 기간:</span>{' '}
                          {formatDateRange(performance.startDate, performance.endDate)}
                        </p>
                      )}
                      {performance.category && (
                        <p>
                          <span className="font-semibold text-gray-700">카테고리:</span>{' '}
                          {performance.category}
                        </p>
                      )}
                    </div>
                    {performance.performanceId && (
                      <Link
                        href={`/performance/${performance.performanceId}`}
                        className="inline-block mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        공연 상세 보기 →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 일정 정보 */}
            {schedule && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">일정 정보</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2 text-sm text-gray-600">
                    {schedule.roundNo && (
                      <p>
                        <span className="font-semibold text-gray-700">회차:</span> {schedule.roundNo}회
                      </p>
                    )}
                    {schedule.startAt && (
                      <p>
                        <span className="font-semibold text-gray-700">공연일시:</span>{' '}
                        {formatDateTime(schedule.startAt)}
                      </p>
                    )}
                    {schedule.bookingType && (
                      <p>
                        <span className="font-semibold text-gray-700">예매 유형:</span>{' '}
                        {schedule.bookingType === 'FIRST_COME' ? '선착순' :
                         schedule.bookingType === 'LOTTERY' ? '추첨' : '지정석'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 좌석 정보 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">좌석 정보</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {trade.section && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">구역</p>
                      <p className="font-semibold text-gray-900 text-lg">{trade.section}</p>
                    </div>
                  )}
                  {trade.row && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">열</p>
                      <p className="font-semibold text-gray-900 text-lg">{trade.row}</p>
                    </div>
                  )}
                  {trade.seatNumber && trade.type === 'EXCHANGE' && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">좌석 번호</p>
                      <p className="font-semibold text-gray-900 text-lg">{trade.seatNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">매수</p>
                    <p className="font-semibold text-gray-900 text-lg">{trade.totalCount || 0}매</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 가격 정보 (양도만) */}
            {trade.type === 'TRANSFER' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">가격 정보</h2>
                  {trade.status === 'ACTIVE' && currentUserId === trade.memberId && (
                    <button
                      onClick={() => {
                        setShowPriceEditModal(true);
                        setNewPrice(trade.price?.toString() || '');
                        setError('');
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      가격 수정
                    </button>
                  )}
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{formatPrice(trade.price)}</p>
                </div>
              </div>
            )}

            {/* 거래 상태 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">거래 상태</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">상태</p>
                    <p className="font-semibold text-gray-900">
                      {trade.status === 'ACTIVE' ? '진행중' : 
                       trade.status === 'COMPLETED' ? '완료' : '취소됨'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">등록일시</p>
                    <p className="font-semibold text-gray-900">{formatDate(trade.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex gap-3 pt-6 border-t">
              {trade.type === 'EXCHANGE' && trade.status === 'ACTIVE' && currentUserId !== trade.memberId && (
                <>
                  {myTradeRequest ? (
                    <Link
                      href={`/my-page/trade-requests/${myTradeRequest.tradeRequestId}`}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors inline-block text-center"
                    >
                      거래 상세 보기
                    </Link>
                  ) : (
                    <Link
                      href={`/trade/${tradeId}/request/step1`}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-block text-center"
                    >
                      교환 신청하기
                    </Link>
                  )}
                </>
              )}
              {trade.type === 'TRANSFER' && trade.status === 'ACTIVE' && currentUserId !== trade.memberId && (
                <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                  구매하기
                </button>
              )}
              {trade.status === 'ACTIVE' && currentUserId === trade.memberId && (
                <button
                  onClick={async () => {
                    if (!confirm('정말로 이 거래를 삭제하시겠습니까?\n대기 중인 신청이 있으면 삭제할 수 없습니다.')) {
                      return;
                    }

                    setIsDeleting(true);
                    setError('');

                    try {
                      await tradeApi.deleteTrade(tradeId);
                      alert('거래가 삭제되었습니다.');
                      router.push('/trade');
                    } catch (err: any) {
                      // API 에러 메시지 추출
                      let errorMessage = '거래 삭제에 실패했습니다.';
                      
                      if (err instanceof Error) {
                        errorMessage = err.message;
                      } else if (err && typeof err === 'object') {
                        // API 응답에서 메시지 추출 시도
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
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? '삭제 중...' : '거래 삭제'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      } catch (err: any) {
                        // API 에러 메시지 추출
                        let errorMessage = '가격 수정에 실패했습니다.';
                        
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
                        setIsUpdatingPrice(false);
                      }
                    }}
                    disabled={isUpdatingPrice}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
