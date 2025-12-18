'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tradeApi, type Trade } from '@/lib/api/trade';
import Link from 'next/link';

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = Number(params.id);
  
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTradeDetail = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await tradeApi.getTradeDetail(tradeId);
        if (response.data) {
          setTrade(response.data);
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
  }, [tradeId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '가격 협의';
    return `${price.toLocaleString()}원`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '거래를 찾을 수 없습니다.'}</p>
          <Link
            href="/trade"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/trade"
          className="text-purple-600 hover:text-purple-700 font-medium mb-6 inline-block"
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

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">거래 ID</p>
                  <p className="font-medium text-gray-900">{trade.tradeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">상태</p>
                  <p className="font-medium text-gray-900">
                    {trade.status === 'ACTIVE' ? '진행중' : 
                     trade.status === 'COMPLETED' ? '완료' : '취소됨'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">공연 ID</p>
                  <p className="font-medium text-gray-900">{trade.performanceId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">일정 ID</p>
                  <p className="font-medium text-gray-900">{trade.scheduleId}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">좌석 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">구역</p>
                  <p className="font-medium text-gray-900">{trade.section}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">열</p>
                  <p className="font-medium text-gray-900">{trade.row}</p>
                </div>
                {trade.seatNumber && (
                  <div>
                    <p className="text-sm text-gray-600">좌석 번호</p>
                    <p className="font-medium text-gray-900">{trade.seatNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">매수</p>
                  <p className="font-medium text-gray-900">{trade.totalCount}매</p>
                </div>
              </div>
            </div>

            {trade.type === 'TRANSFER' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h2>
                <p className="text-2xl font-bold text-purple-600">{formatPrice(trade.price)}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">등록 정보</h2>
              <p className="text-sm text-gray-600">등록일시</p>
              <p className="font-medium text-gray-900">{formatDate(trade.createdAt)}</p>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              {trade.type === 'EXCHANGE' && (
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  교환 신청하기
                </button>
              )}
              {trade.type === 'TRANSFER' && (
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  구매하기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

