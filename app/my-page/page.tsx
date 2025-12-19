'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProfileTab from './ProfileTab';
import { reservationApi, type ReservationDetailRes } from '@/lib/api/reservation';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'profile' | 'trades' | 'lottery'>('reservations');
  const [periodFilter, setPeriodFilter] = useState('1month');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'bookingDate' | 'viewingDate'>('bookingDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [reservations, setReservations] = useState<ReservationDetailRes[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState('');

  // 예매내역 조회
  useEffect(() => {
    if (activeTab === 'reservations') {
      const fetchReservations = async () => {
        setIsLoadingReservations(true);
        setReservationsError('');

        try {
          const response = await reservationApi.getMyReservations();
          if (response.data) {
            setReservations(response.data);
          }
        } catch (err) {
          if (err instanceof Error) {
            setReservationsError(err.message);
          } else {
            setReservationsError('예매내역을 불러오는데 실패했습니다.');
          }
        } finally {
          setIsLoadingReservations(false);
        }
      };

      fetchReservations();
    }
  }, [activeTab]);

  // 필터링 및 정렬
  const filteredAndSortedReservations = (() => {
    let filtered = [...reservations];

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => {
        const status = r.status?.toUpperCase();
        switch (statusFilter) {
          case 'reserved':
            return status === 'PENDING' || status === 'HOLD';
          case 'booked':
            return status === 'CONFIRMED' || status === 'COMPLETED';
          case 'cancelPending':
            return status === 'CANCELLING';
          case 'cancelled':
            return status === 'CANCELLED';
          default:
            return true;
        }
      });
    }

    // 기간 필터 (클라이언트 사이드에서 처리)
    if (periodFilter !== 'all') {
      const now = new Date();
      const periodDate = new Date();
      switch (periodFilter) {
        case '1month':
          periodDate.setMonth(now.getMonth() - 1);
          break;
        case '3month':
          periodDate.setMonth(now.getMonth() - 3);
          break;
        case '6month':
          periodDate.setMonth(now.getMonth() - 6);
          break;
      }
      if (periodFilter !== 'all') {
        filtered = filtered.filter((r) => {
          const date = r.performance?.startDate ? new Date(r.performance.startDate) : null;
          return date && date >= periodDate;
        });
      }
    }

    // 정렬
    filtered.sort((a, b) => {
      let aDate: Date | null = null;
      let bDate: Date | null = null;

      if (sortBy === 'bookingDate') {
        // 예매일은 API에 없으므로 startDate 사용
        aDate = a.performance?.startDate ? new Date(a.performance.startDate) : null;
        bDate = b.performance?.startDate ? new Date(b.performance.startDate) : null;
      } else {
        // 관람일
        aDate = a.performance?.startAt ? new Date(a.performance.startAt) : null;
        bDate = b.performance?.startAt ? new Date(b.performance.startAt) : null;
      }

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      const comparison = aDate.getTime() - bDate.getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  })();

  // 상태 한글 변환
  const getStatusLabel = (status?: string) => {
    if (!status) return '알 수 없음';
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
      case 'HOLD':
        return '예약 대기';
      case 'CONFIRMED':
      case 'COMPLETED':
        return '예매완료';
      case 'CANCELLING':
        return '취소 대기';
      case 'CANCELLED':
        return '취소완료';
      default:
        return status;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLING':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 날짜 포맷팅
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">마이페이지</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'reservations'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              예매내역
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'trades'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              나의 교환/양도
            </button>
            <button
              onClick={() => setActiveTab('lottery')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'lottery'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              추첨 응모
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              회원정보
            </button>
          </div>
        </div>

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="1month">1개월</option>
                    <option value="3month">3개월</option>
                    <option value="6month">6개월</option>
                    <option value="all">전체</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">전체</option>
                    <option value="reserved">예약</option>
                    <option value="booked">예매완료</option>
                    <option value="cancelPending">취소대기</option>
                    <option value="cancelled">취소완료</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'bookingDate' | 'viewingDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="bookingDate">예매일</option>
                    <option value="viewingDate">관람일</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="desc">내림차순</option>
                    <option value="asc">오름차순</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {reservationsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {reservationsError}
              </div>
            )}

            {/* 로딩 상태 */}
            {isLoadingReservations && (
              <div className="text-center py-12 text-gray-400">예매내역을 불러오는 중...</div>
            )}

            {/* 예매내역이 없는 경우 */}
            {!isLoadingReservations && !reservationsError && filteredAndSortedReservations.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-400">예매내역이 없습니다.</p>
              </div>
            )}

            {/* Reservation Cards */}
            {!isLoadingReservations && !reservationsError && filteredAndSortedReservations.length > 0 && (
              <div className="space-y-4">
                {filteredAndSortedReservations.map((reservation) => (
                  <div key={reservation.reservationId} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {reservation.performance?.title || '공연 정보 없음'}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>예매번호: {reservation.reservationId}</p>
                          {reservation.performance?.startAt && (
                            <p>관람일시: {formatDateTime(reservation.performance.startAt)}</p>
                          )}
                          {reservation.performance?.startDate && (
                            <p>공연 기간: {formatDate(reservation.performance.startDate)}</p>
                          )}
                          {reservation.performance?.category && (
                            <p>카테고리: {reservation.performance.category}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </div>
                    </div>

                    {/* 좌석 정보 */}
                    {reservation.seat && (
                      <div className="border-t pt-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">
                            {reservation.seat.sectionName}구역 {reservation.seat.rowLabel}열 {reservation.seat.seatNumber}번
                          </span>
                          {(reservation.status === 'PENDING' || reservation.status === 'HOLD') && (
                            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                              취소
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 공연 상세 링크 */}
                    {reservation.performance?.performanceId && (
                      <div className="border-t pt-4">
                        <Link
                          href={`/performance/${reservation.performance.performanceId}`}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          공연 상세 보기 →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Link
              href="/my-page/trades"
              className="text-xl font-bold text-gray-900 mb-4 block hover:text-purple-600"
            >
              나의 교환/양도 →
            </Link>
            <div className="text-center py-12 text-gray-400">
              <p>등록된 교환/양도 내역이 없습니다.</p>
            </div>
          </div>
        )}

        {/* Lottery Tab */}
        {activeTab === 'lottery' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Link
              href="/my-page/lottery"
              className="text-xl font-bold text-gray-900 mb-4 block hover:text-purple-600"
            >
              내 추첨 응모 →
            </Link>
            <div className="text-center py-12 text-gray-400">
              <p>응모 내역이 없습니다.</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileTab />
        )}
      </div>
    </div>
  );
}

