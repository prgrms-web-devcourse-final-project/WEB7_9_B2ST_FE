'use client';

import { useState, useEffect } from 'react';
import { lotteryApi, type LotteryEntry } from '@/lib/api/lottery';

export default function MyLotteryPage() {
  const [entries, setEntries] = useState<LotteryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await lotteryApi.getMyLotteryEntries();
        if (response.data) {
          setEntries(response.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('응모 내역을 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      APPLIED: { label: '응모완료', className: 'bg-blue-100 text-blue-800' },
      WIN: { label: '당첨', className: 'bg-green-100 text-green-800' },
      LOSE: { label: '낙첨', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: '취소됨', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">내 추첨 응모</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-400">응모 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.lotteryEntryId} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>공연일시: {formatDate(entry.startAt)}</p>
                      <p>회차: {entry.roundNo}회차</p>
                      <p>등급: {entry.gradeType}</p>
                      <p>매수: {entry.quantity}매</p>
                    </div>
                  </div>
                  {getStatusBadge(entry.status)}
                </div>

                {entry.status === 'WIN' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 당첨되었습니다! 결제를 진행해주세요.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

