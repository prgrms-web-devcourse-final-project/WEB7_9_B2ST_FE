'use client';

import Link from 'next/link';
import { useState, use } from 'react';
import Header from '@/components/Header';

export default function LotteryStep1({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  // 더미 데이터
  const performance = {
    id: id,
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
      <Header />
      <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-2 font-medium text-purple-600">날짜/회차 선택</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-2 font-medium text-gray-500">구역 선택</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="ml-2 font-medium text-gray-500">결제 수단</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Performance Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                <p className="text-gray-400">공연 포스터</p>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{performance.title}</h1>
              
              <div className="space-y-3 text-gray-700 text-sm">
                <div className="flex items-start">
                  <span className="font-medium w-20">장소</span>
                  <span>{performance.venue}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-20">기간</span>
                  <span>{performance.period}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-20">시간</span>
                  <span>{performance.time}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-20">연령</span>
                  <span>{performance.age}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-20">가격</span>
                  <span className="text-purple-600 font-semibold">{performance.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Date/Round Selection */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
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

              {selectedDate && selectedRound && (
                <Link
                  href={`/performance/${id}/lottery/step2?scheduleId=1&date=${selectedDate}&round=${selectedRound}`}
                  className="block w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors"
                >
                  다음 단계
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

