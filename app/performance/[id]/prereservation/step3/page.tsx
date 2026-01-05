"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { performanceApi } from "@/lib/api/performance";
import { typedPrereservationApi } from "@/lib/api/typed-prereservation";

export default function PrereservationStep3({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");
  const sectionId = searchParams.get("sectionId");

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [performance, setPerformance] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [section, setSection] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const from = `/performance/${id}/prereservation/step3?scheduleId=${scheduleId}&sectionId=${sectionId}`;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [authLoading, isAuthenticated, id, scheduleId, sectionId, router]);

  // 공연 및 좌석 정보 로드
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

        // 구역 정보 및 좌석 정보 로드
        const sectionsRes =
          await typedPrereservationApi.getPrereservationSections(schedId);
        if (Array.isArray(sectionsRes)) {
          const foundSection = sectionsRes.find((s) => s.sectionId === sectId);
          setSection(foundSection);
        }

        // 좌석 정보 로드 (임시 데이터 - 실제로는 API에서 가져와야 함)
        const tempSeats = Array.from({ length: 20 }, (_, i) => ({
          seatId: i + 1,
          seatNumber: `${Math.floor(i / 5) + 1}열 ${(i % 5) + 1}번`,
          status: Math.random() > 0.7 ? "SOLD" : "AVAILABLE", // AVAILABLE, SOLD, HOLD
        }));
        setSeats(tempSeats);
      } catch (err: any) {
        console.error("정보 로드 실패:", err);
        setError("좌석 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, id, scheduleId, sectionId]);

  const handleSelectSeat = async (seatId: number) => {
    if (!scheduleId) return;

    setSelectedSeat(seatId);
    setIsSubmitting(true);
    setError("");

    try {
      const schedId = Number(scheduleId);

      // 좌석 hold 요청
      const holdRes = await typedPrereservationApi.holdPrereservationSeat(
        schedId,
        seatId
      );

      if (holdRes.expiresAt) {
        setHoldExpiresAt(new Date(holdRes.expiresAt));
      }
    } catch (err: any) {
      console.error("좌석 선택 실패:", err);
      setError(err.message || "좌석을 선택할 수 없습니다.");
      setSelectedSeat(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!selectedSeat) {
      setError("좌석을 선택해주세요.");
      return;
    }

    // Step4로 이동
    router.push(
      `/performance/${id}/prereservation/step4?scheduleId=${scheduleId}&sectionId=${sectionId}&seatId=${selectedSeat}`
    );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <span className="ml-2 font-medium text-gray-500">결제</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">좌석 선택</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {performance && schedule && (
              <div className="space-y-8">
                {/* 공연 및 구역 정보 */}
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
                        구역: {section.sectionName}
                        {section.price &&
                          ` (${Number(section.price).toLocaleString()} 원)`}
                      </p>
                    )}
                  </div>
                </div>

                {/* 좌석 범례 */}
                <div className="flex gap-6 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded border border-gray-400"></div>
                    <span className="text-sm text-gray-600">예매 불가</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded border-2 border-gray-400 hover:border-green-600 cursor-pointer"></div>
                    <span className="text-sm text-gray-600">선택 가능</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded border border-green-600"></div>
                    <span className="text-sm text-gray-600">선택됨</span>
                  </div>
                </div>

                {/* 좌석 맵 */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-5 gap-3">
                    {seats.map((seat) => (
                      <button
                        key={seat.seatId}
                        onClick={() =>
                          seat.status === "AVAILABLE" &&
                          handleSelectSeat(seat.seatId)
                        }
                        disabled={seat.status !== "AVAILABLE" || isSubmitting}
                        className={`w-12 h-12 rounded font-semibold text-sm transition-colors ${
                          selectedSeat === seat.seatId
                            ? "bg-green-600 text-white border border-green-600"
                            : seat.status === "SOLD"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-white text-gray-700 border-2 border-gray-400 hover:border-green-600"
                        }`}
                        title={seat.seatNumber}
                      >
                        {seat.seatId}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hold 만료 시간 표시 */}
                {selectedSeat && holdExpiresAt && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      선택한 좌석은{" "}
                      <strong>
                        {holdExpiresAt.toLocaleTimeString("ko-KR")}
                      </strong>
                      까지 보유됩니다.
                    </p>
                  </div>
                )}

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() =>
                      router.push(
                        `/performance/${id}/prereservation/step2?scheduleId=${scheduleId}`
                      )
                    }
                    className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting || !selectedSeat}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "선택 중..." : "다음"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
