'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, use } from 'react';
import { lotteryApi } from '@/lib/api/lottery';
import Header from '@/components/Header';

export default function LotteryStep3({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const performanceId = Number(id);
  const scheduleId = parseInt(searchParams.get('scheduleId') || '0');
  const grade = searchParams.get('grade') || '';
  const quantity = parseInt(searchParams.get('quantity') || '1');
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'kakao'>('card');
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!scheduleId || !grade) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await lotteryApi.createLotteryEntry(performanceId, {
        scheduleId,
        grade,
        quantity,
      });

      if (response.data) {
        setIsComplete(true);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('응모 등록에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">응모 완료</h2>
            <p className="text-gray-600 mb-4">추첨 결과는 발표일자에 알려드립니다.</p>
            <p className="text-sm text-gray-500 mb-6">당첨 시에만 결제가 진행됩니다.</p>
            <button
              onClick={() => router.push('/my-page')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              마이페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="ml-2 font-medium text-gray-500">날짜/회차 선택</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <span className="ml-2 font-medium text-gray-500">구역 선택</span>
            </div>
            <div className="w-16 h-1 bg-purple-600"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="ml-2 font-medium text-purple-600">결제 수단</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong> 추첨 방식 예매입니다. 당첨 시에만 결제가 진행되며, 결제 수단은 당첨 후 결제 시 사용됩니다.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">결제 수단 선택</h2>
          
          <div className="space-y-3 mb-8">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                paymentMethod === 'card'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">신용카드</span>
                {paymentMethod === 'card' && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('bank')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                paymentMethod === 'bank'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">무통장입금</span>
                {paymentMethod === 'bank' && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('kakao')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                paymentMethod === 'kakao'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">카카오페이</span>
                {paymentMethod === 'kakao' && (
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="border-t pt-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">응모 정보</p>
              <div className="space-y-1 text-sm">
                <p>매수: {quantity}매</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6 text-center">
              (당첨 시에만 결제됩니다)
            </p>

            <div className="flex gap-3">
              <Link
                href={`/performance/${id}/lottery/step2?scheduleId=${scheduleId}`}
                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
              >
                이전 단계
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '응모 중...' : '응모 완료'}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
