'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PerformanceDetail({ params }: { params: { id: string } }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<'first-come' | 'lottery'>('first-come');

  // 더미 데이터
  const performance = {
    id: params.id,
    title: '아이유 콘서트',
    venue: '올림픽공원 올림픽홀',
    period: '2025.01.15 - 2025.01.20',
    time: '19:00',
    age: '만 7세 이상',
    price: '150,000원 ~ 250,000원',
  };

  const dates = ['2025.01.15', '2025.01.16', '2025.01.17', '2025.01.18', '2025.01.19', '2025.01.20'];
  const rounds = ['1회차 19:00', '2회차 21:00'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Performance Info */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <svg className="w-24 h-24 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <p className="text-gray-400 text-sm">공연 포스터</p>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{performance.title}</h1>
              
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start py-2 border-b border-gray-100">
                  <span className="font-semibold w-24 text-gray-600">장소</span>
                  <span className="flex-1">{performance.venue}</span>
                </div>
                <div className="flex items-start py-2 border-b border-gray-100">
                  <span className="font-semibold w-24 text-gray-600">기간</span>
                  <span className="flex-1">{performance.period}</span>
                </div>
                <div className="flex items-start py-2 border-b border-gray-100">
                  <span className="font-semibold w-24 text-gray-600">시간</span>
                  <span className="flex-1">{performance.time}</span>
                </div>
                <div className="flex items-start py-2 border-b border-gray-100">
                  <span className="font-semibold w-24 text-gray-600">연령</span>
                  <span className="flex-1">{performance.age}</span>
                </div>
                <div className="flex items-start py-2">
                  <span className="font-semibold w-24 text-gray-600">가격</span>
                  <span className="flex-1 text-red-600 font-bold text-lg">{performance.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Date/Round Selection */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-8 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">날짜/회차 선택</h2>
              
              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">날짜 선택</h3>
                <div className="grid grid-cols-3 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedRound(null);
                      }}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        selectedDate === date
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Round Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">회차 선택</h3>
                  <div className="space-y-2">
                    {rounds.map((round) => (
                      <button
                        key={round}
                        onClick={() => setSelectedRound(round)}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          selectedRound === round
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {round}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Type Selection */}
              {selectedDate && selectedRound && (
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingType('first-come')}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                        bookingType === 'first-come'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      예매하기 (선착순)
                    </button>
                    <button
                      onClick={() => setBookingType('lottery')}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                        bookingType === 'lottery'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      응모하기 (추첨)
                    </button>
                  </div>

                  {bookingType === 'first-come' ? (
                    <Link
                      href={`/performance/${params.id}/booking/section`}
                      className="block w-full px-6 py-4 bg-red-600 text-white rounded-lg font-bold text-center hover:bg-red-700 transition-colors shadow-lg"
                    >
                      예매하기
                    </Link>
                  ) : (
                    <Link
                      href={`/performance/${params.id}/lottery/step1`}
                      className="block w-full px-6 py-4 bg-red-600 text-white rounded-lg font-bold text-center hover:bg-red-700 transition-colors shadow-lg"
                    >
                      응모하기
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
