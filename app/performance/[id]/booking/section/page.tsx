'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function BookingSection({ params }: { params: { id: string } }) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    { id: 'vip', name: 'VIP석', price: '250,000원' },
    { id: 'r', name: 'R석', price: '200,000원' },
    { id: 's', name: 'S석', price: '180,000원' },
    { id: 'a', name: 'A석', price: '150,000원' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">구역 선택</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Stage Layout */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">무대 배치도</h2>
            <div className="relative bg-gray-100 rounded-lg p-8 min-h-[500px]">
              {/* Stage */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-8 py-4 rounded-lg text-center font-bold">
                STAGE
              </div>

              {/* Sections */}
              <div className="grid grid-cols-2 gap-4 mt-32">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedSection === section.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{section.name}</h3>
                      <p className="text-purple-600 font-semibold">{section.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Selected Section Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">선택된 구역</h2>
            
            {selectedSection ? (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {sections.find(s => s.id === selectedSection)?.name}
                  </h3>
                  <p className="text-purple-600 font-semibold">
                    {sections.find(s => s.id === selectedSection)?.price}
                  </p>
                </div>

                <Link
                  href={`/performance/${params.id}/booking/seats?section=${selectedSection}`}
                  className="block w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors"
                >
                  좌석 선택하기
                </Link>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>좌측에서 구역을 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

