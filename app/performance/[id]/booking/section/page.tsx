"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import {
  performanceApi,
  type ScheduleSeatViewRes,
  type PerformanceDetailRes,
  type PerformanceScheduleDetailRes,
} from "@/lib/api/performance";
import { reservationApi } from "@/lib/api/reservation";

export default function BookingSection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");

  const [seats, setSeats] = useState<ScheduleSeatViewRes[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<ScheduleSeatViewRes[]>([]);
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(
    null
  );
  const [schedule, setSchedule] = useState<PerformanceScheduleDetailRes | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 공연 상세 정보 및 좌석 데이터 로드
  useEffect(() => {
    if (!scheduleId) {
      setError("회차 정보가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // 공연 상세 정보 조회 (가격 정보 포함)
        const performanceResponse = await performanceApi.getPerformance(
          Number(id)
        );
        if (performanceResponse.data) {
          setPerformance(performanceResponse.data);
        }

        // 회차 상세 정보 조회
        const scheduleResponse = await performanceApi.getSchedule(
          Number(id),
          Number(scheduleId)
        );
        if (scheduleResponse.data) {
          setSchedule(scheduleResponse.data);
        }

        // 좌석 데이터 조회
        const seatsResponse = await performanceApi.getScheduleSeats(
          Number(scheduleId)
        );
        if (seatsResponse.data) {
          setSeats(seatsResponse.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [scheduleId, id]);

  // 좌석을 구역별, 행별로 그룹화
  const groupedSeats = seats.reduce((acc, seat) => {
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

  // 구역별 색상 매핑
  const getSectionColor = (sectionName: string) => {
    const name = sectionName.toUpperCase();
    if (name.includes("VIP")) return "bg-blue-100 border-blue-300";
    if (name.includes("R")) return "bg-green-100 border-green-300";
    if (name.includes("S")) return "bg-yellow-100 border-yellow-300";
    if (name.includes("A")) return "bg-purple-100 border-purple-300";
    return "bg-gray-100 border-gray-300";
  };

  const toggleSeat = (seat: ScheduleSeatViewRes) => {
    // AVAILABLE 상태인 좌석만 선택 가능
    if (seat.status !== "AVAILABLE") return;

    setSelectedSeats((prev) => {
      const isSelected = prev.some(
        (s) => s.scheduleSeatId === seat.scheduleSeatId
      );
      if (isSelected) {
        // 이미 선택된 좌석이면 선택 해제
        return [];
      } else {
        // 새로운 좌석 선택 시 기존 선택 해제하고 1개만 선택
        return [seat];
      }
    });
  };

  const getSeatColor = (seat: ScheduleSeatViewRes) => {
    // 예매 불가한 좌석은 회색으로 표기
    if (seat.status === "SOLD" || seat.status === "HOLD") {
      return "bg-gray-400 cursor-not-allowed border-gray-400";
    }

    const isSelected = selectedSeats.some(
      (s) => s.scheduleSeatId === seat.scheduleSeatId
    );

    if (isSelected) {
      // 선택된 좌석은 빨간색
      return "bg-red-600 text-white border-red-600";
    }

    // 구역별 기본 색상
    const sectionName = seat.sectionName || "";
    const name = sectionName.toUpperCase();
    if (name.includes("VIP"))
      return "bg-blue-200 border-blue-400 hover:bg-blue-300";
    if (name.includes("R"))
      return "bg-green-200 border-green-400 hover:bg-green-300";
    if (name.includes("S"))
      return "bg-yellow-200 border-yellow-400 hover:bg-yellow-300";
    if (name.includes("A"))
      return "bg-purple-200 border-purple-400 hover:bg-purple-300";
    return "bg-gray-200 border-gray-400 hover:bg-gray-300";
  };

  const isSeatDisabled = (seat: ScheduleSeatViewRes) => {
    return seat.status !== "AVAILABLE";
  };

  // 선택된 좌석의 총 가격 계산 (공연 상세 정보의 가격 정보 사용)
  const getSeatPrice = (seat: ScheduleSeatViewRes) => {
    if (!performance?.gradePrices || performance.gradePrices.length === 0) {
      // 가격 정보가 없으면 기본값 사용
      const sectionName = seat.sectionName?.toUpperCase() || "";
      if (sectionName.includes("VIP")) return 250000;
      if (sectionName.includes("R")) return 200000;
      if (sectionName.includes("S")) return 180000;
      return 150000;
    }

    // 구역명과 gradeType 매칭
    const sectionName = seat.sectionName?.toUpperCase() || "";
    const gradeType = sectionName.includes("VIP")
      ? "VIP"
      : sectionName.includes("R")
      ? "R"
      : sectionName.includes("S")
      ? "S"
      : "STANDARD";

    // 가격 정보에서 매칭되는 항목 찾기
    const priceInfo = performance.gradePrices.find(
      (p) => p.gradeType.toUpperCase() === gradeType.toUpperCase()
    );

    if (priceInfo) {
      return priceInfo.price;
    }

    // 매칭되지 않으면 첫 번째 가격 정보 사용
    return performance.gradePrices[0]?.price || 150000;
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );

  // 예매 홀딩 및 생성 처리
  const handleBooking = async () => {
    if (!scheduleId || selectedSeats.length === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }

    setIsHolding(true);
    setError("");

    try {
      // 1단계: 모든 좌석에 대해 홀딩
      for (const seat of selectedSeats) {
        if (!seat.seatId) {
          throw new Error("좌석 정보가 올바르지 않습니다.");
        }
        // 좌석 홀딩
        await performanceApi.holdSeat(Number(scheduleId), seat.seatId);
      }

      // 2단계: 홀딩 성공한 좌석 ID 배열 생성
      const seatIds = selectedSeats
        .filter((seat) => seat.seatId)
        .map((seat) => seat.seatId as number);

      if (seatIds.length === 0) {
        throw new Error("선택된 좌석이 없습니다.");
      }

      // 3단계: 배열로 예매 생성
      const response = await reservationApi.createReservation(
        Number(scheduleId),
        seatIds
      );

      if (response.data?.reservationId) {
        // 예매 성공 시 마이페이지로 리다이렉트
        router.push("/my-page?tab=lottery");
      } else {
        throw new Error("예매 생성에 실패했습니다.");
      }
    } catch (err) {
      setIsHolding(false);
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

  // 구역 목록 추출
  const sections = Array.from(
    new Set(seats.map((seat) => seat.sectionName).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">좌석 선택</h1>

          {/* 회차 정보 */}
          {schedule && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">예매 유형</p>
                  <p className="font-semibold text-gray-900">
                    {schedule.bookingType === "FIRST_COME"
                      ? "선착순"
                      : schedule.bookingType === "LOTTERY"
                      ? "추첨"
                      : "지정석"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">예매 시작</p>
                  <p className="font-semibold text-gray-900">
                    {schedule.bookingOpenAt
                      ? new Date(schedule.bookingOpenAt).toLocaleString(
                          "ko-KR",
                          {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">예매 종료</p>
                  <p className="font-semibold text-gray-900">
                    {schedule.bookingCloseAt
                      ? new Date(schedule.bookingCloseAt).toLocaleString(
                          "ko-KR",
                          {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">회차</p>
                  <p className="font-semibold text-gray-900">
                    {schedule.performanceScheduleId}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Seat Map */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="text-center bg-gray-800 text-white py-4 rounded-lg font-bold mb-4">
                  STAGE
                </div>

                {/* Seat Legend */}
                <div className="flex justify-center gap-4 mb-6 text-sm flex-wrap">
                  {sections.map((sectionName) => {
                    const name = sectionName?.toUpperCase() || "";
                    let color = "bg-gray-200 border-gray-400";
                    let label = sectionName || "기타";

                    if (name.includes("VIP")) {
                      color = "bg-blue-200 border-blue-400";
                      label = "VIP석";
                    } else if (name.includes("R")) {
                      color = "bg-green-200 border-green-400";
                      label = "R석";
                    } else if (name.includes("S")) {
                      color = "bg-yellow-200 border-yellow-400";
                      label = "S석";
                    } else if (name.includes("A")) {
                      color = "bg-purple-200 border-purple-400";
                      label = "A석";
                    }

                    return (
                      <div
                        key={sectionName}
                        className="flex items-center gap-2"
                      >
                        <div
                          className={`w-6 h-6 rounded border-2 ${color}`}
                        ></div>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-600 rounded"></div>
                    <span>선택됨</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    <span>예매 불가</span>
                  </div>
                </div>

                {/* Seat Grid by Section */}
                {Object.keys(groupedSeats).map((sectionName) => (
                  <div key={sectionName} className="mb-8">
                    <div
                      className={`p-3 rounded-lg mb-4 ${getSectionColor(
                        sectionName
                      )}`}
                    >
                      <h3 className="text-lg font-bold text-gray-900">
                        {sectionName}구역
                      </h3>
                    </div>
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
                        <span className="font-medium">
                          {seat.sectionName}구역 {seat.rowLabel}열{" "}
                          {seat.seatNumber}번
                        </span>
                        <span className="text-red-600 font-semibold">
                          {getSeatPrice(seat).toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-lg">총 결제금액</span>
                      <span className="text-2xl font-bold text-red-600">
                        {totalPrice.toLocaleString()}원
                      </span>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={isHolding}
                      className="w-full px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isHolding ? "좌석 홀딩 중..." : "예약 완료"}
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
