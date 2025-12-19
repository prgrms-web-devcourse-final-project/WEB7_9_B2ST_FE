'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ProfileTab from './ProfileTab';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'profile' | 'trades' | 'lottery'>('reservations');
  const [periodFilter, setPeriodFilter] = useState('1month');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'bookingDate' | 'viewingDate'>('bookingDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 더미 예매 데이터
  const reservations = [
    {
      id: 1,
      bookingNumber: 'BK20250115001',
      performance: '아이유 콘서트',
      viewingDate: '2025.01.15 19:00',
      bookingDate: '2025.01.10',
      ticketCount: 2,
      status: '예매완료',
      seats: ['A-10', 'A-11'],
      venue: '올림픽공원 올림픽홀',
      paymentMethod: 'card',
    },
    {
      id: 2,
      bookingNumber: 'BK20250120001',
      performance: '레미제라블',
      viewingDate: '2025.01.20 19:00',
      bookingDate: '2025.01.12',
      ticketCount: 1,
      status: '입금대기',
      seats: ['B-5'],
      venue: '세종문화회관',
      paymentMethod: 'bank',
      bankAccount: '국민은행 123-456-789012',
      accountHolder: 'TT 티켓',
      depositDeadline: '2025.01.13 23:59',
    },
  ];

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

            {/* Reservation Cards */}
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{reservation.performance}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>예매번호: {reservation.bookingNumber}</p>
                        <p>관람일시: {reservation.viewingDate}</p>
                        <p>예매일: {reservation.bookingDate}</p>
                        <p>매수: {reservation.ticketCount}매</p>
                        <p>장소: {reservation.venue}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reservation.status === '예매완료' ? 'bg-green-100 text-green-800' :
                        reservation.status === '입금대기' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>

                  {/* Seat Info */}
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                    <div className="space-y-2">
                      {reservation.seats.map((seat, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{seat}</span>
                          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                            취소
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  {reservation.paymentMethod === 'bank' && reservation.status === '입금대기' && (
                    <div className="border-t pt-4 bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">입금 정보</h4>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>입금계좌: {reservation.bankAccount}</p>
                        <p>예금주명: {reservation.accountHolder}</p>
                        <p>입금기한: {reservation.depositDeadline}</p>
                        <p className="text-yellow-700 font-medium">입금상태: 대기중</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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

