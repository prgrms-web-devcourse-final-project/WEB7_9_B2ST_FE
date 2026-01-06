"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Header from "@/components/Header";
import { paymentApi, type PaymentRequest } from "@/lib/api/payment";

function LotteryPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const entryId = searchParams.get("entryId");
  const price = Number(searchParams.get("price")) || 0;
  const title = searchParams.get("title") || "";

  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "VIRTUAL_ACCOUNT" | "EASY_PAY"
  >("CARD");
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // 결제 처리
  const handlePayment = async () => {
    if (!entryId) {
      alert("응모 정보가 없습니다.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const paymentRequest: PaymentRequest = {
        domainType: "LOTTERY",
        paymentMethod,
        entryId,
      };

      await paymentApi.pay(paymentRequest);

      setIsComplete(true);

      // 3초 후 마이페이지로 이동
      setTimeout(() => {
        router.push("/my-page?tab=lottery");
      }, 3000);
    } catch (err) {
      console.error("결제 실패:", err);
      if (err instanceof Error) {
        setError(err.message || "결제에 실패했습니다.");
      } else {
        setError("결제에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 결제 완료 화면
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
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
              결제가 완료되었습니다
            </h2>
            <p className="text-gray-600 mb-6">
              추첨 응모 당첨 티켓이 발급되었습니다.
            </p>
            <button
              onClick={() => router.push("/my-page?tab=lottery")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          추첨 당첨 결제
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 결제 정보 입력 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 공연 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                공연 정보
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">공연명</span>
                  <span className="font-medium">{title}</span>
                </div>
              </div>
            </div>

            {/* 결제 수단 선택 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                결제 수단 선택
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as
                          | "CARD"
                          | "VIRTUAL_ACCOUNT"
                          | "EASY_PAY"
                      )
                    }
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="ml-3 font-medium">신용/체크카드</span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="EASY_PAY"
                    checked={paymentMethod === "EASY_PAY"}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as
                          | "CARD"
                          | "VIRTUAL_ACCOUNT"
                          | "EASY_PAY"
                      )
                    }
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="ml-3 font-medium">간편결제</span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VIRTUAL_ACCOUNT"
                    checked={paymentMethod === "VIRTUAL_ACCOUNT"}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as
                          | "CARD"
                          | "VIRTUAL_ACCOUNT"
                          | "EASY_PAY"
                      )
                    }
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="ml-3 font-medium">무통장입금</span>
                </label>
              </div>
            </div>
          </div>

          {/* 결제 금액 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                결제 금액
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>티켓 금액</span>
                  <span>{price.toLocaleString()}원</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">총 결제 금액</span>
                  <span className="text-2xl font-bold text-red-600">
                    {price.toLocaleString()}원
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || !entryId}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                  isProcessing || !entryId
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
              >
                {isProcessing ? "결제 처리 중..." : "결제하기"}
              </button>

              {!entryId && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  응모 정보가 없습니다
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LotteryPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12 text-gray-400">로딩 중...</div>
          </div>
        </div>
      }
    >
      <LotteryPaymentContent />
    </Suspense>
  );
}
