'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, use } from 'react';
import Header from '@/components/Header';

export default function BookingSeats({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'vip';
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // 좌석 배치 (예시: 10행 x 15열)
  const rows = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)); // A-J
  const cols = Array.from({ length: 15 }, (_, i) => i + 1);

  // 판매 완료된 좌석 (더미 데이터)
  const soldSeats = ['A-5', 'A-6', 'B-10', 'C-3', 'D-7', 'E-12'];

  const toggleSeat = (seatId: string) => {
    if (soldSeats.includes(seatId)) return; // 판매 완료 좌석은 선택 불가
    
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const getSeatColor = (seatId: string) => {
    if (soldSeats.includes(seatId)) return 'bg-gray-400 cursor-not-allowed';
    if (selectedSeats.includes(seatId)) return 'bg-purple-600 text-white';
    return 'bg-white border-gray-300 hover:border-purple-500';
  };

  const totalPrice = selectedSeats.length * (section === 'vip' ? 250000 : section === 'r' ? 200000 : section === 's' ? 180000 : 150000);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">좌석 선택</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Seat Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <div className="text-center bg-gray-800 text-white py-4 rounded-lg font-bold mb-4">
                STAGE
              </div>
              
              {/* Seat Legend */}
              <div className="flex justify-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
                  <span>선택 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 rounded"></div>
                  <span>선택됨</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  <span>판매 완료</span>
                </div>
              </div>

              {/* Seat Grid */}
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="w-8 text-center font-medium text-gray-700">{row}</span>
                    <div className="flex gap-1 flex-1">
                      {cols.map((col) => {
                        const seatId = `${row}-${col}`;
                        return (
                          <button
                            key={seatId}
                            onClick={() => toggleSeat(seatId)}
                            className={`w-8 h-8 rounded border-2 text-xs font-medium transition-colors ${getSeatColor(seatId)}`}
                            disabled={soldSeats.includes(seatId)}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Selected Seats Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">선택된 좌석</h2>
            
            {selectedSeats.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {selectedSeats.map((seat) => (
                    <div key={seat} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{seat}</span>
                      <span className="text-purple-600 font-semibold">
                        {section === 'vip' ? '250,000원' : section === 'r' ? '200,000원' : section === 's' ? '180,000원' : '150,000원'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">총 결제금액</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </div>

                  <Link
                    href={`/performance/${id}/booking/payment?seats=${selectedSeats.join(',')}&section=${section}`}
                    className="block w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors"
                  >
                    결제하기
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>좌석을 선택해주세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

