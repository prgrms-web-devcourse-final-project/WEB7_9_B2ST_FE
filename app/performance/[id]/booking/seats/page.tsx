"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import {
  performanceApi,
  type ScheduleSeatViewRes,
  type PerformanceScheduleListRes,
} from "@/lib/api/performance";
import { reservationApi } from "@/lib/api/reservation";
import { typedQueueApi } from "@/lib/api/typed-queue";

export default function BookingSeats({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");
  const queueId = searchParams.get("queueId");
  const section = searchParams.get("section");

  const [seats, setSeats] = useState<ScheduleSeatViewRes[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<ScheduleSeatViewRes[]>([]);
  const [schedules, setSchedules] = useState<PerformanceScheduleListRes[]>([]);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(
    scheduleId
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // 공연 일정 목록 로드
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!id) return;

      try {
        const response = await performanceApi.getSchedules(Number(id));
        if (response.data && Array.isArray(response.data)) {
          setSchedules(response.data);
        }
      } catch (err) {
        console.error("일정 목록 조회 실패:", err);
      }
    };

    fetchSchedules();
  }, [id]);

  // 좌석 데이터 로드
  useEffect(() => {
    if (!currentScheduleId) {
      setError("회차 정보가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchSeats = async () => {
      setIsLoading(true);
      setError("");
      setSelectedSeats([]); // 회차 변경 시 선택 초기화

      try {
        const response = await performanceApi.getScheduleSeats(
          Number(currentScheduleId)
        );
        if (response.data) {
          // 구역 필터링 (section 파라미터가 있으면 해당 구역만 표시)
          let filteredSeats = response.data;
          if (section) {
            filteredSeats = response.data.filter(
              (seat) =>
                seat.sectionName?.toLowerCase() === section.toLowerCase()
            );
          }
          setSeats(filteredSeats);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("좌석 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, [currentScheduleId, section]);

  // 페이지 이탈 시 대기열 나가기
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (queueId) {
        // 동기적으로 API 호출 (navigator.sendBeacon 사용)
        const blob = new Blob([JSON.stringify({})], {
          type: "application/json",
        });
        navigator.sendBeacon(`/api/queues/${queueId}/exit`, blob);
      }
    };

    const handleRouteChange = async () => {
      if (queueId) {
        try {
          await typedQueueApi.exit(Number(queueId));
        } catch (err) {
          console.error("대기열 나가기 실패:", err);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleRouteChange);

      // 컴포넌트 언마운트 시에도 대기열 나가기 (정상적인 페이지 이동)
      if (queueId && !isProcessing) {
        // 비동기 호출이지만 최선을 다해 전송
        typedQueueApi.exit(Number(queueId)).catch(() => {});
      }
    };
  }, [queueId, isProcessing]);

  // 회차 변경 핸들러
  const handleScheduleChange = (newScheduleId: string) => {
    setCurrentScheduleId(newScheduleId);
    // URL은 변경하지 않음 (대기열 재진입 방지)
  };

  // 중복 제거: sectionName + rowLabel + seatNumber로 유니크한 좌석만 선택
  const uniqueSeats = Array.from(
    new Map(
      seats.map((seat) => {
        const key = `${seat.sectionName}_${seat.rowLabel}_${seat.seatNumber}`;
        return [key, seat];
      })
    ).values()
  );

  // 좌석을 구역별, 행별로 그룹화
  const groupedSeats = uniqueSeats.reduce((acc, seat) => {
    const sectionName = seat.sectionName || "기타";
    const rowLabel = seat.rowLabel || "";

    if (!acc[sectionName]) {
      acc[sectionName] = {};
    }
    if (!acc[sectionName][rowLabel]) {
      acc[sectionName][rowLabel] = [];
    }

    acc[sectionName][rowLabel].push(seat);
    return acc;
  }, {} as Record<string, Record<string, ScheduleSeatViewRes[]>>);

  // 각 행의 좌석을 좌석 번호 순으로 정렬
  Object.keys(groupedSeats).forEach((sectionName) => {
    Object.keys(groupedSeats[sectionName]).forEach((rowLabel) => {
      groupedSeats[sectionName][rowLabel].sort(
        (a, b) => (a.seatNumber || 0) - (b.seatNumber || 0)
      );
    });
  });

  const toggleSeat = (seat: ScheduleSeatViewRes) => {
    // AVAILABLE 상태인 좌석만 선택 가능
    if (seat.status !== "AVAILABLE") return;

    setSelectedSeats((prev) => {
      const isSelected = prev.some(
        (s) =>
          s.sectionName === seat.sectionName &&
          s.rowLabel === seat.rowLabel &&
          s.seatNumber === seat.seatNumber
      );
      if (isSelected) {
        // 선택 해제
        return prev.filter(
          (s) =>
            !(
              s.sectionName === seat.sectionName &&
              s.rowLabel === seat.rowLabel &&
              s.seatNumber === seat.seatNumber
            )
        );
      } else {
        // 새로 선택 - 1개만 선택 가능하도록 제한
        if (prev.length >= 1) {
          alert("좌석은 1개만 선택할 수 있습니다.");
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  // 등급별 색상 매핑 (API 응답의 grade 필드 기반)
  const getGradeColor = (grade?: string): string => {
    if (!grade)
      return "bg-white border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-100";

    const upperGrade = grade.toUpperCase();
    if (upperGrade === "VIP")
      return "bg-yellow-100 border-yellow-400 text-gray-900 hover:bg-yellow-200 hover:border-yellow-500";
    if (upperGrade === "ROYAL")
      return "bg-purple-100 border-purple-400 text-gray-900 hover:bg-purple-200 hover:border-purple-500";
    if (upperGrade === "STANDARD")
      return "bg-blue-100 border-blue-400 text-gray-900 hover:bg-blue-200 hover:border-blue-500";
    return "bg-white border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-100";
  };

  const getSeatColor = (seat: ScheduleSeatViewRes) => {
    const isSelected = selectedSeats.some(
      (s) => s.scheduleSeatId === seat.scheduleSeatId
    );

    if (isSelected) return "bg-red-600 text-white border-red-600";
    if (seat.status === "SOLD")
      return "bg-gray-400 cursor-not-allowed border-gray-400";
    if (seat.status === "HOLD")
      return "bg-yellow-300 cursor-not-allowed border-yellow-300";

    // AVAILABLE 좌석의 경우 등급별 색상 적용
    return getGradeColor(seat.grade);
  };

  const isSeatDisabled = (seat: ScheduleSeatViewRes) => {
    return seat.status !== "AVAILABLE";
  };

  // 실제 가격 사용 (API에서 제공하는 price 필드)
  const getSeatPrice = (seat: ScheduleSeatViewRes) => {
    return seat.price || 0;
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );

  // 예매 진행 (validation -> hold -> reservation 생성 -> payment 이동)
  const handleProceedToPayment = async () => {
    // 좌석 선택 validation
    if (!currentScheduleId) {
      alert("회차 정보가 없습니다.");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }

    if (selectedSeats.length > 1) {
      alert("좌석은 1개만 선택할 수 있습니다.");
      return;
    }

    const seat = selectedSeats[0];
    if (!seat.seatId) {
      console.error("좌석 정보:", seat);
      alert("좌석 정보가 올바르지 않습니다.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // 1단계: 좌석 hold
      await performanceApi.holdSeat(Number(currentScheduleId), seat.seatId);

      // 2단계: 예매 생성 (hold가 성공한 경우에만 진행)
      const response = await reservationApi.createReservation(
        Number(currentScheduleId),
        [seat.seatId]
      );

      if (!response.data?.reservationId) {
        throw new Error("예매 생성에 실패했습니다.");
      }

      // 3단계: 결제 페이지로 이동 (모든 단계가 성공한 경우에만)
      // queueId가 있으면 함께 전달
      const paymentUrl = queueId
        ? `/performance/${id}/booking/payment?reservationId=${response.data.reservationId}&scheduleId=${currentScheduleId}&queueId=${queueId}`
        : `/performance/${id}/booking/payment?reservationId=${response.data.reservationId}&scheduleId=${currentScheduleId}`;

      router.push(paymentUrl);
    } catch (err) {
      setIsProcessing(false);
      console.error("예매 실패 상세:", err);
      if (err instanceof Error) {
        alert(err.message || "좌석 예매에 실패했습니다.");
      } else {
        alert("좌석 예매에 실패했습니다.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-gray-400">
            좌석 정보를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-400">좌석 정보가 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push(`/performance/${id}`)}
            className="mb-6 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
          >
            ← 공연으로 돌아가기
          </button>

          {/* 상단: 제목 및 회차 선택 드롭다운 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">좌석 선택</h1>

              {/* 대기열 정보 표시 */}
              {queueId && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-blue-700 font-medium">
                    대기열 통과
                  </span>
                </div>
              )}
            </div>

            {/* 회차 선택 드롭다운 */}
            {schedules.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <label
                  htmlFor="schedule-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  회차 선택
                </label>
                <select
                  id="schedule-select"
                  value={currentScheduleId || ""}
                  onChange={(e) => handleScheduleChange(e.target.value)}
                  className="block w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                >
                  {schedules.map((schedule) => (
                    <option
                      key={schedule.performanceScheduleId}
                      value={schedule.performanceScheduleId}
                    >
                      {schedule.startAt &&
                        new Date(schedule.startAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })}{" "}
                      {schedule.startAt &&
                        new Date(schedule.startAt).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      {schedule.roundNo && ` (${schedule.roundNo}회차)`}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  ※ 회차를 변경해도 대기열을 다시 거치지 않습니다.
                </p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Seat Map */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="text-center bg-gray-800 text-white py-4 rounded-lg font-bold mb-4">
                  STAGE
                </div>

                {/* Seat Legend */}
                <div className="flex justify-center gap-6 mb-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                    <span>VIP (30,000원)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 border-2 border-purple-400 rounded"></div>
                    <span>ROYAL (20,000원)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded"></div>
                    <span>STANDARD (10,000원)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-600 rounded"></div>
                    <span>선택됨</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-300 rounded"></div>
                    <span>예약 중</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    <span>판매 완료</span>
                  </div>
                </div>

                {/* Seat Grid by Section */}
                {Object.keys(groupedSeats).map((sectionName) => (
                  <div key={sectionName} className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {sectionName}구역
                    </h3>
                    <div className="space-y-2">
                      {Object.keys(groupedSeats[sectionName])
                        .sort()
                        .map((rowLabel) => (
                          <div
                            key={rowLabel}
                            className="flex items-center gap-2"
                          >
                            <span className="w-12 text-center font-medium text-gray-700">
                              {rowLabel}열
                            </span>
                            <div className="flex gap-1 flex-1 flex-wrap">
                              {groupedSeats[sectionName][rowLabel].map(
                                (seat) => (
                                  <button
                                    key={seat.scheduleSeatId}
                                    onClick={() => toggleSeat(seat)}
                                    className={`w-8 h-8 rounded border-2 text-xs font-medium transition-colors ${getSeatColor(
                                      seat
                                    )}`}
                                    disabled={isSeatDisabled(seat)}
                                    title={`${sectionName}구역 ${rowLabel}열 ${
                                      seat.seatNumber
                                    }번 - ${
                                      seat.price
                                        ? `${seat.price.toLocaleString()}원`
                                        : "가격 정보 없음"
                                    } - ${
                                      seat.status === "AVAILABLE"
                                        ? "선택 가능"
                                        : seat.status === "HOLD"
                                        ? "예약 중"
                                        : "판매 완료"
                                    }`}
                                  >
                                    {seat.seatNumber}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Selected Seats Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                선택된 좌석
              </h2>

              {selectedSeats.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.scheduleSeatId}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {seat.sectionName}구역 {seat.rowLabel}열{" "}
                            {seat.seatNumber}번
                          </span>
                          {seat.grade && (
                            <span className="text-xs text-gray-500">
                              {seat.grade}
                            </span>
                          )}
                        </div>
                        <span className="text-red-600 font-semibold">
                          {getSeatPrice(seat).toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">결제 금액</span>
                      <span className="text-lg font-bold text-red-600">
                        {totalPrice.toLocaleString()}원
                      </span>
                    </div>

                    <button
                      onClick={handleProceedToPayment}
                      disabled={isProcessing}
                      className={`block w-full px-6 py-4 ${
                        isProcessing
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white rounded-lg font-semibold text-center transition-colors`}
                    >
                      {isProcessing ? "처리 중..." : "결제하기"}
                    </button>
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
