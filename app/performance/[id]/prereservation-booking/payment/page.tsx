"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { paymentApi, type PaymentRequest } from "@/lib/api/payment";

export default function PrereservationBookingPayment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const prereservationBookingId = searchParams.get("prereservationBookingId");
  const scheduleId = searchParams.get("scheduleId");

  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "VIRTUAL_ACCOUNT" | "EASY_PAY"
  >("CARD");
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    if (!prereservationBookingId) {
      alert("사전 예매 정보가 없습니다.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // 결제 API 호출 (사전 예매는 PRERESERVATION 도메인 타입 사용)
      const paymentRequest: PaymentRequest = {
        domainType: "PRERESERVATION",
        paymentMethod: paymentMethod,
        domainId: Number(prereservationBookingId),
      };

      const response = await paymentApi.pay(paymentRequest);

      if (!response.success || !response.data) {
        throw new Error(response.error || "결제에 실패했습니다.");
      }

      // 결제 성공
      setIsComplete(true);
      setTimeout(() => {
        router.push(`/my-page?tab=prereservations`);
      }, 2000);
    } catch (err) {
      setIsProcessing(false);
      if (err instanceof Error) {
        alert(err.message || "결제 처리에 실패했습니다.");
      } else {
        alert("결제 처리에 실패했습니다.");
      }
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              사전 예매 결제 완료
            </h2>
            <p className="text-gray-600">예매가 완료되었습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
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
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              사전 예매 결제
            </h1>
            <p className="text-gray-600">
              결제 정보를 확인하고 결제를 진행해주세요.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 결제 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 결제 수단 선택 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  결제 수단
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="CARD"
                      checked={paymentMethod === "CARD"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "CARD")
                      }
                      className="w-5 h-5 text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">
                        신용/체크카드
                      </p>
                      <p className="text-sm text-gray-500">
                        모든 카드사 이용 가능
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="VIRTUAL_ACCOUNT"
                      checked={paymentMethod === "VIRTUAL_ACCOUNT"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "VIRTUAL_ACCOUNT")
                      }
                      className="w-5 h-5 text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">가상계좌</p>
                      <p className="text-sm text-gray-500">
                        입금 기한 내 계좌이체
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="EASY_PAY"
                      checked={paymentMethod === "EASY_PAY"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value as "EASY_PAY")
                      }
                      className="w-5 h-5 text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">간편결제</p>
                      <p className="text-sm text-gray-500">
                        카카오페이, 네이버페이 등
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 환불 규정 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  환불 규정
                </h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• 공연 시작 7일 전: 전액 환불</p>
                  <p>• 공연 시작 3~6일 전: 90% 환불</p>
                  <p>• 공연 시작 1~2일 전: 70% 환불</p>
                  <p>• 공연 당일: 환불 불가</p>
                </div>
              </div>
            </div>

            {/* 결제 요약 */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                결제 정보
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">사전 예매 ID</span>
                  <span className="font-medium text-gray-900">
                    {prereservationBookingId}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-lg font-bold text-gray-900">
                    총 결제 금액
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-red-600 text-right leading-snug break-keep">
                    결제 진행 시 확인
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`block w-full px-6 py-4 ${
                  isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } text-white rounded-lg font-semibold text-center transition-colors`}
              >
                {isProcessing ? "처리 중..." : "결제하기"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                결제하기 버튼을 누르면 환불 규정에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
