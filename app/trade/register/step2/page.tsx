'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TradeRegisterStep2() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tradeType = searchParams.get('type') || 'exchange';
  const performance = searchParams.get('performance') || '';
  const date = searchParams.get('date') || '';
  
  const [selectedSection, setSelectedSection] = useState('');
  const [seatNumber, setSeatNumber] = useState('');

  const sections = ['VIP석', 'R석', 'S석', 'A석'];

  const handleSubmit = () => {
    // 등록 처리 로직 (API 호출 부분은 나중에)
    router.push('/trade');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="ml-2 font-medium text-gray-500">기본 정보</span>
            </div>
            <div className="w-16 h-1 bg-purple-600"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-2 font-medium text-purple-600">좌석 정보</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">좌석 정보</h1>

          <div className="space-y-6">
            {/* Selected Performance Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">공연</p>
              <p className="font-medium text-gray-900">{performance}</p>
              <p className="text-sm text-gray-600 mt-2">날짜: {date}</p>
            </div>

            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">구역 선택</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">구역을 선택하세요</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Seat Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">좌석 번호</label>
              <input
                type="text"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="예: A-10, B-5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="mt-1 text-sm text-gray-500">행-열 형식으로 입력하세요 (예: A-10)</p>
            </div>

            {/* Preview */}
            {selectedSection && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">공개 정보 미리보기</h3>
                <p className="text-sm text-gray-600">
                  {tradeType === 'exchange' ? (
                    <>다른 사용자에게는 <strong>구역만</strong> 공개됩니다.</>
                  ) : (
                    <>다른 사용자에게는 <strong>구역과 열</strong>만 공개됩니다.</>
                  )}
                </p>
                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm">
                    <span className="font-medium">구역:</span> {selectedSection}
                  </p>
                  {tradeType === 'transfer' && seatNumber && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">열:</span> {seatNumber.split('-')[0]}열
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link
                href="/trade/register/step1"
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
              >
                이전 단계
              </Link>
              {selectedSection && seatNumber && (
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  등록하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

