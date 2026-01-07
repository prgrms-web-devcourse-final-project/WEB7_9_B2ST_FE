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
import { prereservationApi } from "@/lib/api/prereservation";

export default function BookingSection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");
  const isPrereservation = searchParams.get("prereservation") === "true";

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

  // 가격별 색상 매핑
  const getColorByPrice = (price: number | undefined) => {
    if (price === 30000)
      return { bg: "bg-blue-200 border-blue-400", hover: "hover:bg-blue-300" };
    if (price === 20000)
      return {
        bg: "bg-green-200 border-green-400",
        hover: "hover:bg-green-300",
      };
    if (price === 10000)
      return {
        bg: "bg-yellow-200 border-yellow-400",
        hover: "hover:bg-yellow-300",
      };
    return { bg: "bg-gray-200 border-gray-400", hover: "hover:bg-gray-300" };
  };

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

    const isSelected = selectedSeats.some(
      (s) => s.scheduleSeatId === seat.scheduleSeatId
    );

    if (isSelected) {
      // 이미 선택된 좌석이면 선택 해제
      setSelectedSeats((prev) =>
        prev.filter((s) => s.scheduleSeatId !== seat.scheduleSeatId)
      );
    } else {
      // 1개만 선택 가능하도록 제한
      if (selectedSeats.length >= 1) {
        alert("좌석은 1개만 선택할 수 있습니다.");
        return;
      }
      // 새로운 좌석 선택
      setSelectedSeats((prev) => [...prev, seat]);
    }
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

    // 가격별 색상
    const colors = getColorByPrice(seat.price);
    return `${colors.bg} ${colors.hover}`;
  };

  // 구역의 가격 정보 추출
  const getSectionPrices = (sectionName: string) => {
    const seatsInSection = Object.values(
      groupedSeats[sectionName] || {}
    ).flat();
    const prices = new Set(
      seatsInSection.map((s) => s.price).filter((p) => p !== undefined)
    );
    return Array.from(prices).sort((a, b) => (b || 0) - (a || 0));
  };

  const isSeatDisabled = (seat: ScheduleSeatViewRes) => {
    return seat.status !== "AVAILABLE";
  };

  // 선택된 좌석의 총 가격 계산 (API 응답의 price 필드 사용)
  const getSeatPrice = (seat: ScheduleSeatViewRes) => {
    // API 응답에서 price 필드 직접 사용
    if (seat.price !== undefined && seat.price !== null) {
      return seat.price;
    }
    // price 필드가 없으면 기본값 사용
    return 0;
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );

  // 예매 홀딩 및 생성 처리 (공통 로직)
  const handleHoldingAndCreateReservation = async () => {
    if (!scheduleId) {
      alert("회차 정보가 없습니다.");
      return null;
    }

    if (selectedSeats.length === 0) {
      alert("좌석을 선택해주세요.");
      return null;
    }

    if (selectedSeats.length > 1) {
      alert("좌석은 1개만 선택할 수 있습니다.");
      return null;
    }

    setIsHolding(true);
    setError("");

    let holdSuccessful = false;

    try {
      // 1단계: 모든 좌석에 대해 홀딩
      for (const seat of selectedSeats) {
        if (!seat.seatId) {
          throw new Error("좌석 정보가 올바르지 않습니다.");
        }
        // 좌석 홀딩 (사전 예매는 전용 API 사용)
        if (isPrereservation) {
          await prereservationApi.holdPrereservationSeat(
            Number(scheduleId),
            seat.seatId
          );
        } else {
          await performanceApi.holdSeat(Number(scheduleId), seat.seatId);
        }
      }

      holdSuccessful = true;

      // 2단계: 홀딩 성공한 좌석 ID 배열 생성
      const seatIds = selectedSeats
        .filter((seat) => seat.seatId)
        .map((seat) => seat.seatId as number);

      if (seatIds.length === 0) {
        throw new Error("선택된 좌석이 없습니다.");
      }

      // 3단계: 배열로 예매 생성 (hold가 성공한 경우에만 진행)
      const response = await reservationApi.createReservation(
        Number(scheduleId),
        seatIds
      );

      if (response.data?.reservationId) {
        return response.data.reservationId;
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
      return null;
    }
  };

  // 바로 결제하기
  const handlePaymentImmediately = async () => {
    const reservationId = await handleHoldingAndCreateReservation();
    if (reservationId) {
      router.push(
        `/performance/${id}/booking/payment?reservationId=${reservationId}&scheduleId=${scheduleId}`
      );
    }
  };

  // 나중에 결제하기
  const handlePaymentLater = async () => {
    const reservationId = await handleHoldingAndCreateReservation();
    if (reservationId) {
      router.push(`/my-page/reservations/${reservationId}`);
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
          <button
            onClick={() => router.push(`/performance/${id}`)}
            className="mb-6 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
          >
            ← 공연으로 돌아가기
          </button>

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
                <div className="flex justify-center gap-6 mb-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-200 border-2 border-blue-400 rounded"></div>
                    <span>VIP석 - 30,000원</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-200 border-2 border-green-400 rounded"></div>
                    <span>R석 - 20,000원</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                    <span>S석 - 10,000원</span>
                  </div>
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
                {Object.keys(groupedSeats).map((sectionName) => {
                  const sectionPrices = getSectionPrices(sectionName);
                  const priceLabel =
                    sectionPrices.length > 0
                      ? sectionPrices
                          .map((p) => `${p?.toLocaleString()}원`)
                          .join(", ")
                      : "";

                  return (
                    <div key={sectionName} className="mb-8">
                      <div className="p-3 rounded-lg mb-4 bg-gray-100 border border-gray-300">
                        <h3 className="text-lg font-bold text-gray-900">
                          {sectionName}구역{" "}
                          {priceLabel && (
                            <span className="text-sm font-normal text-gray-600">
                              ({priceLabel})
                            </span>
                          )}
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
                  );
                })}
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
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group"
                      >
                        <span className="font-medium">
                          {seat.sectionName}구역 {seat.rowLabel}열{" "}
                          {seat.seatNumber}번
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-red-600 font-semibold">
                            {getSeatPrice(seat).toLocaleString()}원
                          </span>
                          <button
                            onClick={() => toggleSeat(seat)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                            title="선택 취소"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        좌석 {selectedSeats.length}개
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-lg">총 결제금액</span>
                      <span className="text-2xl font-bold text-red-600">
                        {totalPrice.toLocaleString()}원
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={handlePaymentImmediately}
                        disabled={isHolding}
                        className="w-full px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isHolding ? "홀딩 중..." : "바로 결제하기"}
                      </button>
                      <button
                        onClick={handlePaymentLater}
                        disabled={isHolding}
                        className="w-full px-6 py-4 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isHolding ? "홀딩 중..." : "나중에 결제하기"}
                      </button>
                    </div>
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
