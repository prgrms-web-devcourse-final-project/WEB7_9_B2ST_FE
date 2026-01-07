"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import { paymentApi, type PaymentRequest } from "@/lib/api/payment";
import { tradeApi } from "@/lib/api/trade";

export default function TradePaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const tradeId = Number(id);

  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "VIRTUAL_ACCOUNT" | "EASY_PAY"
  >("CARD");
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [trade, setTrade] = useState<any>(null);
  const [error, setError] = useState("");

  // 거래 정보 조회
  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const response = await tradeApi.getTradeDetail(tradeId);
        if (response.data) {
          setTrade(response.data);
        }
      } catch (err) {
        console.error("거래 정보 조회 실패:", err);
        setError("거래 정보를 불러오는데 실패했습니다.");
      }
    };

    if (tradeId) {
      fetchTrade();
    }
  }, [tradeId]);

  const handlePayment = async () => {
    if (!trade) {
      alert("거래 정보가 없습니다.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // 결제 API 호출
      const paymentRequest: PaymentRequest = {
        domainType: "TRADE",
        paymentMethod: paymentMethod,
        domainId: tradeId,
      };

      const response = await paymentApi.pay(paymentRequest);

      if (!response.success || !response.data) {
        throw new Error(response.error || "결제에 실패했습니다.");
      }

      // 결제 성공
      setIsComplete(true);
      setTimeout(() => {
        router.push("/my-page?tab=trades");
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">구매 완료</h2>
            <p className="text-gray-600">거래가 완료되었습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !trade) {
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

  if (!trade) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500">정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push(`/trade/${tradeId}`)}
            className="mb-6 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
          >
            ← 거래로 돌아가기
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">결제</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Payment Method */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                결제 수단 선택
              </h2>

              <div className="space-y-3 mb-8">
                <button
                  onClick={() => setPaymentMethod("CARD")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    paymentMethod === "CARD"
                      ? "border-red-600 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">신용카드</span>
                    {paymentMethod === "CARD" && (
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("VIRTUAL_ACCOUNT")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    paymentMethod === "VIRTUAL_ACCOUNT"
                      ? "border-red-600 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">무통장입금</span>
                    {paymentMethod === "VIRTUAL_ACCOUNT" && (
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("EASY_PAY")}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    paymentMethod === "EASY_PAY"
                      ? "border-red-600 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">간편결제</span>
                    {paymentMethod === "EASY_PAY" && (
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">약관 동의</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      결제 이용약관에 동의합니다.
                    </span>
                  </label>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      거래 약관에 동의합니다.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  결제 정보
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">거래 타입</p>
                    <p className="font-semibold text-gray-900">
                      {trade.type === "EXCHANGE" ? "교환" : "양도"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">가격</p>
                    <p className="text-2xl font-bold text-red-600">
                      {trade.price
                        ? `${trade.price.toLocaleString()}원`
                        : "가격 협의"}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">결제 금액</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {trade.price
                        ? `${trade.price.toLocaleString()}원`
                        : "가격 협의"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !trade.price}
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "결제 처리 중..." : "결제하기"}
                </button>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
