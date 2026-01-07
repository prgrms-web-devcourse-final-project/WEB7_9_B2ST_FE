"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  reservationApi,
  type ReservationDetailWithSeatsRes,
} from "@/lib/api/reservation";
import { paymentApi, type PaymentRequest } from "@/lib/api/payment";
import { performanceApi } from "@/lib/api/performance";

export default function BookingPayment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  // reservationId (단수) 또는 reservationIds (복수)에서 ID 추출
  const reservationIdParam = searchParams.get("reservationId");
  const reservationIdsParam = searchParams.get("reservationIds");
  const queueId = searchParams.get("queueId");
  const reservationIds = reservationIdParam
    ? [Number(reservationIdParam)]
    : reservationIdsParam?.split(",").map(Number).filter(Boolean) || [];

  const [paymentMethod, setPaymentMethod] = useState<
    "CARD" | "VIRTUAL_ACCOUNT" | "EASY_PAY"
  >("CARD");
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reservations, setReservations] = useState<
    ReservationDetailWithSeatsRes[]
  >([]);
  const [seatPrices, setSeatPrices] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState("");

  // 예매 정보 조회
  useEffect(() => {
    const fetchReservations = async () => {
      if (reservationIds.length === 0) {
        setError("예매 정보가 없습니다.");
        return;
      }

      try {
        const reservationDetails = await Promise.all(
          reservationIds.map((reservationId) =>
            reservationApi.getReservationDetail(reservationId)
          )
        );
        const reservationData = reservationDetails
          .map((r) => r.data)
          .filter(Boolean) as ReservationDetailWithSeatsRes[];

        setReservations(reservationData);

        // 좌석 가격 조회
        const pricesMap = new Map<number, number>();
        for (const reservation of reservationData) {
          const scheduleId =
            reservation.reservation.performance.performanceScheduleId;
          try {
            const seatsResponse = await performanceApi.getScheduleSeats(
              scheduleId
            );
            if (seatsResponse.data) {
              // 각 예약된 좌석의 가격 매핑
              reservation.seats.forEach((reservedSeat) => {
                const seatInfo = seatsResponse.data.find(
                  (s) => s.seatId === reservedSeat.seatId
                );
                if (seatInfo && seatInfo.price) {
                  pricesMap.set(reservedSeat.seatId, seatInfo.price);
                }
              });
            }
          } catch (err) {
            console.error(`스케줄 ${scheduleId} 좌석 정보 조회 실패:`, err);
          }
        }
        setSeatPrices(pricesMap);
      } catch (err) {
        console.error("예매 정보 조회 실패:", err);
        setError("예매 정보를 불러오는데 실패했습니다.");
      }
    };

    fetchReservations();
  }, [reservationIds.join(",")]);

  // 총 가격 계산 (실제 좌석 가격 사용)
  const totalPrice = reservations.reduce((sum, reservation) => {
    const seatPrice =
      reservation.seats?.reduce((seatSum, seat) => {
        const price = seatPrices.get(seat.seatId) || 0;
        return seatSum + price;
      }, 0) || 0;
    return sum + seatPrice;
  }, 0);

  const handlePayment = async () => {
    if (reservationIds.length === 0) {
      alert("예매 정보가 없습니다.");
      return;
    }

    if (reservationIds.length > 1) {
      alert("한 번에 하나의 예매만 결제할 수 있습니다.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const reservationId = reservationIds[0];

      // 결제 API 호출
      const paymentRequest: PaymentRequest = {
        domainType: "RESERVATION",
        paymentMethod: paymentMethod,
        domainId: reservationId,
      };

      const response = await paymentApi.pay(paymentRequest);

      if (!response.success || !response.data) {
        throw new Error(response.error || "결제에 실패했습니다.");
      }

      // 결제 성공 후 대기열 권한 소진 (queueId가 있는 경우)
      if (queueId) {
        try {
          const { typedQueueApi } = await import("@/lib/api/typed-queue");
          await typedQueueApi.complete(Number(queueId));
        } catch (queueErr) {
          console.error("대기열 권한 소진 실패:", queueErr);
          // 대기열 권한 소진 실패는 결제 완료에 영향을 주지 않음
        }
      }

      // 결제 성공
      setIsComplete(true);
      setTimeout(() => {
        router.push(`/my-page/reservations/${reservationId}`);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">결제 완료</h2>
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
          <button
            onClick={() => router.push(`/performance/${id}`)}
            className="mb-6 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
          >
            ← 공연으로 돌아가기
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

              {/* Payment Form */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">결제 정보 입력</h3>

                {paymentMethod === "CARD" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카드번호
                      </label>
                      <input
                        type="text"
                        placeholder="0000-0000-0000-0000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          유효기간
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "VIRTUAL_ACCOUNT" && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">입금계좌 정보</p>
                    <p className="font-medium">국민은행 123-456-789012</p>
                    <p className="font-medium">예금주: TT 티켓</p>
                    <p className="text-sm text-gray-600 mt-2">
                      입금 기한: 24시간 이내
                    </p>
                  </div>
                )}

                {paymentMethod === "EASY_PAY" && (
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-gray-600">
                      간편결제는 결제하기 버튼 클릭 시 진행됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                주문 요약
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">선택된 좌석</p>
                  <div className="space-y-1">
                    {reservations.length > 0 ? (
                      reservations.map((reservation) => (
                        <div key={reservation.reservation.reservationId}>
                          {reservation.seats && reservation.seats.length > 0 ? (
                            reservation.seats.map((seat, index) => (
                              <p key={index} className="text-sm font-medium">
                                {seat.sectionName}구역 {seat.rowLabel}열{" "}
                                {seat.seatNumber}번
                              </p>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">
                              좌석 정보 없음
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        예매 정보를 불러오는 중...
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">티켓 금액</span>
                    <span className="font-medium">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">수수료</span>
                    <span className="font-medium">0원</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">총 결제금액</span>
                      <span className="text-2xl font-bold text-red-600">
                        {totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || reservations.length === 0}
                className="w-full px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? "결제 처리 중..." : "결제하기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
