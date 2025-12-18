'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TradeRegisterStep1() {
  const [tradeType, setTradeType] = useState<'exchange' | 'transfer'>('exchange');
  const [selectedPerformance, setSelectedPerformance] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // 더미 공연 목록
  const performances = [
    '아이유 콘서트',
    '레미제라블',
    'BTS 콘서트',
    '오페라의 유령',
    '베토벤 교향곡',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-2 font-medium text-purple-600">기본 정보</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-2 font-medium text-gray-500">좌석 정보</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">티켓 등록</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Trade Type */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">교환/양도 유형 선택</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setTradeType('exchange')}
                  className={`w-full p-6 rounded-lg border-2 text-left transition-colors ${
                    tradeType === 'exchange'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">교환</h3>
                      <p className="text-sm text-gray-600">다른 좌석과 교환하고 싶을 때</p>
                    </div>
                    {tradeType === 'exchange' && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setTradeType('transfer')}
                  className={`w-full p-6 rounded-lg border-2 text-left transition-colors ${
                    tradeType === 'transfer'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">양도</h3>
                      <p className="text-sm text-gray-600">티켓을 판매하고 싶을 때</p>
                    </div>
                    {tradeType === 'transfer' && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Right: Performance Selection */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">공연 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">공연 검색</label>
                  <input
                    type="text"
                    value={selectedPerformance}
                    onChange={(e) => setSelectedPerformance(e.target.value)}
                    placeholder="공연명을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {selectedPerformance && (
                    <div className="mt-2 border border-gray-200 rounded-lg">
                      {performances
                        .filter(p => p.includes(selectedPerformance))
                        .map((perf) => (
                          <button
                            key={perf}
                            onClick={() => setSelectedPerformance(perf)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50"
                          >
                            {perf}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {selectedPerformance && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">선택된 공연</p>
                    <p className="font-medium text-gray-900">{selectedPerformance}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜 선택</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {selectedPerformance && selectedDate && (
            <div className="mt-8 flex justify-end">
              <Link
                href={`/trade/register/step2?type=${tradeType}&performance=${selectedPerformance}&date=${selectedDate}`}
                className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                다음 단계
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

