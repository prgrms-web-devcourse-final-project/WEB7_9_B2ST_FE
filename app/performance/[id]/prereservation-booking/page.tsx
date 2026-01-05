"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import {
  performanceApi,
  type ScheduleSeatViewRes,
} from "@/lib/api/performance";
import { typedPrereservationApi } from "@/lib/api/typed-prereservation";

export default function PrereservationBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: scheduleIdParam } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionIdParam = searchParams.get("sectionId");

  const [seats, setSeats] = useState<ScheduleSeatViewRes[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<ScheduleSeatViewRes | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [sectionId, setSectionId] = useState<number | null>(null);

  const scheduleId = Number(scheduleIdParam);

  // 좌석 데이터 로드
  useEffect(() => {
    if (!scheduleId || !sectionIdParam) {
      setError("회차 정보 또는 구역 정보가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchSeats = async () => {
      setIsLoading(true);
      setError("");

      try {
        // 먼저 사전 예매 섹션 정보를 가져와서 섹션 이름 확인
        const { prereservationApi } = await import("@/lib/api/prereservation");
        const sectionsResponse =
          await prereservationApi.getPrereservationSections(scheduleId);

        const targetSection = sectionsResponse.data?.find(
          (s) => s.sectionId === Number(sectionIdParam)
        );

        if (!targetSection) {
          throw new Error("해당 구역을 찾을 수 없습니다.");
        }

        setSectionName(targetSection.sectionName);
        setSectionId(targetSection.sectionId);

        // 좌석 정보 가져오기
        const response = await performanceApi.getScheduleSeats(scheduleId);
        if (response.data) {
          // 해당 섹션의 좌석만 필터링 (섹션 이름으로)
          const filteredSeats = response.data.filter(
            (seat) => seat.sectionName === targetSection.sectionName
          );

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
  }, [scheduleId, sectionIdParam]);

  // 중복 제거: rowLabel + seatNumber로 유니크한 좌석만 선택
  const uniqueSeats = Array.from(
    new Map(
      seats.map((seat) => {
        const key = `${seat.rowLabel}_${seat.seatNumber}`;
        return [key, seat];
      })
    ).values()
  );

  // 좌석을 행별로 그룹화
  const groupedSeats = uniqueSeats.reduce((acc, seat) => {
    const rowLabel = seat.rowLabel || "";

    if (!acc[rowLabel]) {
      acc[rowLabel] = [];
    }

    acc[rowLabel].push(seat);
    return acc;
  }, {} as Record<string, ScheduleSeatViewRes[]>);

  // 각 행의 좌석을 좌석 번호 순으로 정렬
  Object.keys(groupedSeats).forEach((rowLabel) => {
    groupedSeats[rowLabel].sort(
      (a, b) => (a.seatNumber || 0) - (b.seatNumber || 0)
    );
  });

  const toggleSeat = (seat: ScheduleSeatViewRes) => {
    // AVAILABLE 상태인 좌석만 선택 가능
    if (seat.status !== "AVAILABLE") return;

    if (selectedSeat?.scheduleSeatId === seat.scheduleSeatId) {
      // 선택 해제
      setSelectedSeat(null);
    } else {
      // 새로 선택 (1개만 선택 가능)
      setSelectedSeat(seat);
    }
  };

  // 등급별 색상 매핑
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
    const isSelected = selectedSeat?.scheduleSeatId === seat.scheduleSeatId;

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

  const getSeatPrice = (seat: ScheduleSeatViewRes) => {
    return seat.price || 0;
  };

  // 예매 진행 (사전 예매 전용 API 사용)
  const handleProceedToPayment = async () => {
    if (!selectedSeat || !selectedSeat.seatId) {
      alert("좌석을 선택해주세요.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // 1단계: 사전 예매 좌석 hold (사전 예매 전용 API)
      await typedPrereservationApi.holdPrereservationSeat(
        scheduleId,
        selectedSeat.seatId
      );

      // 2단계: 사전 예매 예매 생성 (사전 예매 전용 API)
      const response = await typedPrereservationApi.createPrereservationBooking(
        scheduleId,
        selectedSeat.seatId
      );

      if (!response.prereservationBookingId) {
        throw new Error("사전 예매 생성에 실패했습니다.");
      }

      // 3단계: 결제 페이지로 이동
      router.push(
        `/performance/${scheduleId}/prereservation-booking/payment?prereservationBookingId=${response.prereservationBookingId}&scheduleId=${scheduleId}`
      );
    } catch (err) {
      setIsProcessing(false);
      console.error("사전 예매 실패 상세:", err);
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
            <p className="text-gray-400">해당 구역에 좌석 정보가 없습니다.</p>
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
          {/* 상단: 제목 및 사전 예매 안내 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                사전 예매 좌석 선택
              </h1>

              {/* 사전 예매 정보 표시 */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                <svg
                  className="w-5 h-5 text-green-600"
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
                <span className="text-sm text-green-700 font-medium">
                  사전 신청 승인
                </span>
              </div>
            </div>

            {/* 구역 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                선택된 구역:{" "}
                <span className="font-bold text-gray-900">
                  {sectionName}구역
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ※ 사전 신청으로 지정된 구역의 좌석만 선택할 수 있습니다.
              </p>
            </div>
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
                    <span>VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 border-2 border-purple-400 rounded"></div>
                    <span>ROYAL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 border-2 border-blue-400 rounded"></div>
                    <span>STANDARD</span>
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

                {/* Seat Grid by Row */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {sectionName}구역
                  </h3>
                  <div className="space-y-2">
                    {Object.keys(groupedSeats)
                      .sort()
                      .map((rowLabel) => (
                        <div key={rowLabel} className="flex items-center gap-2">
                          <span className="w-12 text-center font-medium text-gray-700">
                            {rowLabel}열
                          </span>
                          <div className="flex gap-1 flex-1 flex-wrap">
                            {groupedSeats[rowLabel].map((seat) => (
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
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Selected Seat Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                선택된 좌석
              </h2>

              {selectedSeat ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {selectedSeat.sectionName}구역 {selectedSeat.rowLabel}
                          열 {selectedSeat.seatNumber}번
                        </span>
                        {selectedSeat.grade && (
                          <span className="text-xs text-gray-500">
                            {selectedSeat.grade}
                          </span>
                        )}
                      </div>
                      <span className="text-red-600 font-semibold">
                        {getSeatPrice(selectedSeat).toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">결제 금액</span>
                      <span className="text-lg font-bold text-red-600">
                        {getSeatPrice(selectedSeat).toLocaleString()}원
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
