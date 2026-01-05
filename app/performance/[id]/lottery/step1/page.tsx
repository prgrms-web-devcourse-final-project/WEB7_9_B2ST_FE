"use client";

import Link from "next/link";
import { useState, use, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import {
  performanceApi,
  type PerformanceDetailRes,
  type PerformanceScheduleListRes,
} from "@/lib/api/performance";

function LotteryStep1Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const scheduleIdParam = searchParams.get("scheduleId");

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(
    null
  );
  const [schedules, setSchedules] = useState<PerformanceScheduleListRes[]>([]);
  const [selectedSchedule, setSelectedSchedule] =
    useState<PerformanceScheduleListRes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const performanceId = Number(id);

  // 공연 상세 정보 및 일정 조회
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [performanceResponse, schedulesResponse] = await Promise.all([
          performanceApi.getPerformance(performanceId),
          performanceApi.getSchedules(performanceId),
        ]);

        if (performanceResponse.data) {
          setPerformance(performanceResponse.data);
        }

        if (schedulesResponse.data) {
          setSchedules(schedulesResponse.data);
        }
      } catch (err) {
        console.error("데이터 조회 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (performanceId && !isNaN(performanceId)) {
      fetchData();
    }
  }, [performanceId]);

  // scheduleId 파라미터가 있으면 해당 스케줄 선택
  useEffect(() => {
    if (scheduleIdParam && schedules.length > 0) {
      const schedule = schedules.find(
        (s) => s.performanceScheduleId === Number(scheduleIdParam)
      );
      if (schedule && schedule.startAt) {
        const scheduleDate = new Date(schedule.startAt);
        const dateStr = scheduleDate.toISOString().split("T")[0];
        setSelectedDate(dateStr);
        setSelectedSchedule(schedule);
        setSelectedRound(
          `${schedule.roundNo}회 ${scheduleDate.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}`
        );
      }
    }
  }, [scheduleIdParam, schedules]);

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 일정 그룹화 (날짜별)
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!schedule.startAt) return acc;
    const dateKey = formatDate(schedule.startAt);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, PerformanceScheduleListRes[]>);

  // 선택된 날짜의 회차 목록
  const selectedDateRounds = selectedDate
    ? schedules
        .filter((schedule) => {
          if (!schedule.startAt) return false;
          const scheduleDate = new Date(schedule.startAt);
          const dateStr = scheduleDate.toISOString().split("T")[0];
          return dateStr === selectedDate;
        })
        .map((schedule) => {
          const scheduleDate = new Date(schedule.startAt!);
          return {
            schedule,
            label: `${schedule.roundNo}회 ${scheduleDate.toLocaleTimeString(
              "ko-KR",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }
            )}`,
          };
        })
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps (2단계로 축소) */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="ml-2 font-medium text-purple-600">
                  날짜/회차 선택
                </span>
              </div>
              <div className="w-16 h-1 bg-purple-200"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium text-gray-500">
                  구역/매수 선택
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Performance Info */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                  <p className="text-gray-400">공연 포스터</p>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {performance?.title || "공연 정보 없음"}
                </h1>

                <div className="space-y-3 text-gray-700 text-sm">
                  <div className="flex items-start">
                    <span className="font-medium w-20">장소</span>
                    <span>{performance?.venue?.name || "-"}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-20">기간</span>
                    <span>
                      {performance?.startDate && performance?.endDate
                        ? `${formatDate(performance.startDate)} ~ ${formatDate(
                            performance.endDate
                          )}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-20">카테고리</span>
                    <span>{performance?.category || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Date/Round Selection */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  날짜/회차 선택
                </h2>

                {/* Date Selection */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    날짜 선택
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(groupedSchedules).map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(
                            schedules
                              .find((s) => formatDate(s.startAt) === date)
                              ?.startAt?.split("T")[0] || null
                          );
                          setSelectedRound(null);
                          setSelectedSchedule(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDate ===
                          (schedules
                            .find((s) => formatDate(s.startAt) === date)
                            ?.startAt?.split("T")[0] || null)
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Round Selection */}
                {selectedDate && selectedDateRounds.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      회차 선택
                    </h3>
                    <div className="space-y-2">
                      {selectedDateRounds.map(({ schedule, label }) => (
                        <button
                          key={schedule.performanceScheduleId}
                          onClick={() => {
                            setSelectedRound(label);
                            setSelectedSchedule(schedule);
                          }}
                          className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            selectedSchedule?.performanceScheduleId ===
                            schedule.performanceScheduleId
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSchedule && (
                  <Link
                    href={`/performance/${id}/lottery/step2?scheduleId=${selectedSchedule.performanceScheduleId}`}
                    className="block w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors"
                  >
                    다음 단계
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LotteryStep1({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        </div>
      }
    >
      <LotteryStep1Content params={params} />
    </Suspense>
  );
}
