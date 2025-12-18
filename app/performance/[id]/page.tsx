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
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                <p className="text-gray-400">공연 포스터</p>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{performance.title}</h1>
              
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <span className="font-medium w-24">장소</span>
                  <span>{performance.venue}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-24">기간</span>
                  <span>{performance.period}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-24">시간</span>
                  <span>{performance.time}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-24">연령</span>
                  <span>{performance.age}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-24">가격</span>
                  <span className="text-purple-600 font-semibold">{performance.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Date/Round Selection */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">날짜/회차 선택</h2>
              
              {/* Date Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">날짜 선택</h3>
                <div className="grid grid-cols-3 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedRound(null);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDate === date
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  <h3 className="text-sm font-medium text-gray-700 mb-3">회차 선택</h3>
                  <div className="space-y-2">
                    {rounds.map((round) => (
                      <button
                        key={round}
                        onClick={() => setSelectedRound(round)}
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedRound === round
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingType('first-come')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                        bookingType === 'first-come'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      예매하기 (선착순)
                    </button>
                    <button
                      onClick={() => setBookingType('lottery')}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                        bookingType === 'lottery'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      응모하기 (추첨)
                    </button>
                  </div>

                  {bookingType === 'first-come' ? (
                    <Link
                      href={`/performance/${params.id}/booking/section`}
                      className="block w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors"
                    >
                      예매하기
                    </Link>
                  ) : (
                    <Link
                      href={`/performance/${params.id}/lottery/step1`}
                      className="block w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors"
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

