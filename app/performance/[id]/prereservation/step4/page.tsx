"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { performanceApi } from "@/lib/api/performance";
import { typedPrereservationApi } from "@/lib/api/typed-prereservation";
import { paymentApi } from "@/lib/api/payment";

export default function PrereservationStep4({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");
  const sectionId = searchParams.get("sectionId");
  const seatId = searchParams.get("seatId");

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [performance, setPerformance] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [section, setSection] = useState<any>(null);
  const [price, setPrice] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CARD");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const from = `/performance/${id}/prereservation/step4?scheduleId=${scheduleId}&sectionId=${sectionId}&seatId=${seatId}`;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [authLoading, isAuthenticated, id, scheduleId, sectionId, seatId, router]);

  // 공연 및 가격 정보 로드
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !scheduleId || !sectionId) return;

      try {
        setIsLoading(true);
        setError("");

        const perfId = Number(id);
        const schedId = Number(scheduleId);
        const sectId = Number(sectionId);

        // 공연 및 스케줄 정보 로드
        const [perfRes, schedRes] = await Promise.all([
          performanceApi.getPerformance(perfId),
          performanceApi.getSchedules(perfId),
        ]);

        setPerformance(perfRes.data);

        if (Array.isArray(schedRes.data)) {
          const foundSchedule = schedRes.data.find(
            (s) => s.performanceScheduleId === schedId
          );
          setSchedule(foundSchedule);
        }

        // 구역 정보 및 가격 로드
        const sectionsRes =
          await typedPrereservationApi.getPrereservationSections(schedId);
        if (Array.isArray(sectionsRes)) {
          const foundSection = sectionsRes.find((s) => s.sectionId === sectId);
          setSection(foundSection);
          if (foundSection && foundSection.price) {
            setPrice(Number(foundSection.price));
          }
        }
      } catch (err: any) {
        console.error("정보 로드 실패:", err);
        setError("공연 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, id, scheduleId, sectionId]);

  const handlePayment = async () => {
    if (!scheduleId || !seatId) {
      setError("필수 정보가 누락되었습니다.");
      return;
    }

    setIsSubmitting(true);
    setIsProcessing(true);
    setError("");

    try {
      const schedId = Number(scheduleId);
      const sId = Number(seatId);

      // 1. 예약 생성
      const bookingRes =
        await typedPrereservationApi.createPrereservationBooking(schedId, sId);

      if (!bookingRes.prereservationBookingId) {
        throw new Error("예약 생성에 실패했습니다.");
      }

      const prereservationBookingId = bookingRes.prereservationBookingId;

      // 2. 결제 요청
      const paymentRes = await paymentApi.pay({
        domainType: "PRERESERVATION",
        domainId: prereservationBookingId,
        paymentMethod: selectedPaymentMethod as
          | "CARD"
          | "EASY_PAY"
          | "VIRTUAL_ACCOUNT",
      });

      if (paymentRes.success && paymentRes.data) {
        // 결제 성공
        router.push(`/my-page/reservations`);
      } else {
        throw new Error(paymentRes.error || "결제 요청에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("결제 실패:", err);
      setError(
        err.message || "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const fee = Math.floor(price * 0.1); // 10% 수수료
  const total = price + fee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="ml-2 font-medium text-green-600">
                  신청 신청
                </span>
              </div>
              <div className="w-16 h-1 bg-green-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium text-green-600">
                  구역/시간 선택
                </span>
              </div>
              <div className="w-16 h-1 bg-green-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 font-medium text-green-600">
                  좌석 선택
                </span>
              </div>
              <div className="w-16 h-1 bg-green-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <span className="ml-2 font-medium text-green-600">결제</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 좌측: 주문 정보 */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">결제</h1>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {performance && schedule && (
                  <>
                    {/* 공연 정보 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-4">
                        공연 정보
                      </h3>
                      <div className="space-y-2">
                        <p className="text-gray-900 font-semibold">
                          {performance.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {schedule.roundNo && `${schedule.roundNo}회차`}
                          {schedule.startAt &&
                            ` • ${new Date(schedule.startAt).toLocaleString(
                              "ko-KR"
                            )}`}
                        </p>
                        {section && (
                          <p className="text-sm text-gray-600">
                            구역: {section.sectionName} | 좌석: {seatId}번
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 결제 수단 선택 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        결제 수단
                      </h3>
                      <div className="space-y-2">
                        {[
                          { value: "CARD", label: "신용카드" },
                          { value: "EASY_PAY", label: "간편결제" },
                          { value: "VIRTUAL_ACCOUNT", label: "가상계좌" },
                        ].map((method) => (
                          <label
                            key={method.value}
                            className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
                            style={{
                              borderColor:
                                selectedPaymentMethod === method.value
                                  ? "#16a34a"
                                  : "#e5e7eb",
                              backgroundColor:
                                selectedPaymentMethod === method.value
                                  ? "#f0fdf4"
                                  : "#ffffff",
                            }}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.value}
                              checked={selectedPaymentMethod === method.value}
                              onChange={(e) =>
                                setSelectedPaymentMethod(e.target.value)
                              }
                              className="mr-3"
                            />
                            <span className="font-medium text-gray-900">
                              {method.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 이용약관 */}
                    <div className="space-y-3">
                      <label className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          className="mt-1 mr-3"
                          defaultChecked
                        />
                        <span className="text-sm text-gray-700">
                          구매자 이용약관에 동의합니다.
                        </span>
                      </label>
                      <label className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          className="mt-1 mr-3"
                          defaultChecked
                        />
                        <span className="text-sm text-gray-700">
                          개인정보 수집 및 이용에 동의합니다.
                        </span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 우측: 결제 요약 */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  주문 요약
                </h3>

                <div className="space-y-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">공연 가격</span>
                    <span className="text-gray-900 font-medium">
                      {price.toLocaleString()} 원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수수료 (10%)</span>
                    <span className="text-gray-900 font-medium">
                      {fee.toLocaleString()} 원
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    총액
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {total.toLocaleString()} 원
                  </span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isSubmitting}
                  className="mt-8 w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "결제 처리 중..." : "결제하기"}
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/performance/${id}/prereservation/step3?scheduleId=${scheduleId}&sectionId=${sectionId}`
                    )
                  }
                  className="mt-3 w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  결제는 안전한 결제 시스템을 통해 처리됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
