"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  performanceApi,
  type PerformanceDetailRes,
  type PerformanceScheduleListRes,
} from "@/lib/api/performance";
import Header from "@/components/Header";

type TabType = "info" | "description" | "additional";

export default function PerformanceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const performanceId = Number(id);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(
    null
  );
  const [schedules, setSchedules] = useState<PerformanceScheduleListRes[]>([]);
  const [selectedSchedule, setSelectedSchedule] =
    useState<PerformanceScheduleListRes | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 공연 상세 정보 조회
  useEffect(() => {
    const fetchPerformance = async () => {
      if (!performanceId || isNaN(performanceId)) {
        setError("잘못된 공연 ID입니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await performanceApi.getPerformance(performanceId);
        if (response.data) {
          setPerformance(response.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("공연 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, [performanceId]);

  // 공연 일정 조회
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!performanceId || isNaN(performanceId)) return;

      try {
        const response = await performanceApi.getSchedules(performanceId);
        if (response.data) {
          setSchedules(response.data);
        }
      } catch (err) {
        console.error("일정 조회 실패:", err);
      }
    };

    if (performance) {
      fetchSchedules();
    }
  }, [performanceId, performance]);

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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${formatDate(dateString)}(${dayOfWeek}) ${date.toLocaleTimeString(
      "ko-KR",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    )}`;
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "";
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">공연 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            {error || "공연 정보를 찾을 수 없습니다."}
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedSchedule) {
      alert("날짜와 회차를 선택해주세요.");
      return;
    }

    if (selectedSchedule.bookingType === "LOTTERY") {
      router.push(
        `/performance/${id}/lottery/step1?scheduleId=${selectedSchedule.performanceScheduleId}`
      );
    } else {
      router.push(
        `/performance/${id}/booking/section?scheduleId=${selectedSchedule.performanceScheduleId}`
      );
    }
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
  const selectedDateSchedules = selectedDate
    ? schedules.filter((schedule) => {
        if (!schedule.startAt) return false;
        const scheduleDate = new Date(schedule.startAt);
        return (
          scheduleDate.getFullYear() === selectedDate.getFullYear() &&
          scheduleDate.getMonth() === selectedDate.getMonth() &&
          scheduleDate.getDate() === selectedDate.getDate()
        );
      })
    : [];

  // 캘린더 관련 함수들
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }
    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    // 다음 달의 첫 날들 (캘린더를 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    return days;
  };

  const hasScheduleOnDate = (date: Date) => {
    return schedules.some((schedule) => {
      if (!schedule.startAt) return false;
      const scheduleDate = new Date(schedule.startAt);
      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate()
      );
    });
  };

  const handleDateClick = (date: Date) => {
    if (hasScheduleOnDate(date)) {
      setSelectedDate(date);
      setSelectedSchedule(null); // 날짜 선택 시 회차 초기화
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-2">
            {/* Poster */}
            <div className="bg-white rounded-xl overflow-hidden mb-6">
              {performance.posterUrl ? (
                <img
                  src={performance.posterUrl}
                  alt={performance.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-24 h-24 text-gray-400 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    <p className="text-gray-400 text-sm">공연 포스터</p>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                {performance.status === "ON_SALE" && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                    단독판매
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {performance.title}
              </h1>

              <div className="space-y-3 text-gray-700 mb-6">
                <div className="flex items-start">
                  <span className="font-semibold w-24 text-gray-600">
                    관람일정
                  </span>
                  <span className="flex-1">
                    {formatDateRange(
                      performance.startDate,
                      performance.endDate
                    )}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold w-24 text-gray-600">
                    관람장소
                  </span>
                  <span className="flex-1">
                    {performance.venue?.name || "-"}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold w-24 text-gray-600">
                    카테고리
                  </span>
                  <span className="flex-1">{performance.category || "-"}</span>
                </div>
                {performance.gradePrices &&
                  performance.gradePrices.length > 0 && (
                    <div className="flex items-start">
                      <span className="font-semibold w-24 text-gray-600">
                        가격
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-3">
                          {performance.gradePrices.map((priceInfo, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-50 text-red-700 rounded-lg font-medium"
                            >
                              {priceInfo.gradeType}:{" "}
                              {priceInfo.price.toLocaleString()}원
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                      activeTab === "info"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    공연정보
                  </button>
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                      activeTab === "description"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    공연소개
                  </button>
                  <button
                    onClick={() => setActiveTab("additional")}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                      activeTab === "additional"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    부가정보
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        공연정보
                      </h3>
                      <div className="space-y-2 text-gray-700">
                        <div>
                          <span className="font-medium">공연명:</span>{" "}
                          {performance.title}
                        </div>
                        {performance.startDate && (
                          <div>
                            <span className="font-medium">공연 일시:</span>{" "}
                            {formatDateTime(performance.startDate)}
                          </div>
                        )}
                        {performance.venue?.name && (
                          <div>
                            <span className="font-medium">공연 장소:</span>{" "}
                            {performance.venue.name}
                          </div>
                        )}
                        {performance.category && (
                          <div>
                            <span className="font-medium">카테고리:</span>{" "}
                            {performance.category}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "description" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      공연소개
                    </h3>
                    <div className="text-gray-700 whitespace-pre-line">
                      {performance.description || "공연 소개 정보가 없습니다."}
                    </div>
                  </div>
                )}

                {activeTab === "additional" && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      부가정보
                    </h3>
                    <div className="text-gray-700">
                      <p className="mb-2">
                        • 예매 및 취소 정책은 공연 주최사 정책을 따릅니다.
                      </p>
                      <p className="mb-2">
                        • 공연 일정 및 내용은 주최사 사정에 따라 변경될 수
                        있습니다.
                      </p>
                      <p className="mb-2">
                        • 문의사항은 고객센터로 연락주시기 바랍니다.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                예매 일정
              </h2>

              {schedules.length > 0 ? (
                <div className="space-y-6">
                  {/* Calendar */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      관람일
                    </h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => handleMonthChange("prev")}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <span className="text-sm font-semibold text-gray-900">
                          {currentMonth.getFullYear()}.{" "}
                          {String(currentMonth.getMonth() + 1).padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => handleMonthChange("next")}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {["일", "월", "화", "수", "목", "금", "토"].map(
                          (day, idx) => (
                            <div
                              key={day}
                              className={`text-center text-xs font-medium py-1 ${
                                idx === 0
                                  ? "text-red-500"
                                  : idx === 6
                                  ? "text-red-500"
                                  : "text-gray-600"
                              }`}
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((day, idx) => {
                          const isSelected =
                            selectedDate &&
                            day.date.getFullYear() ===
                              selectedDate.getFullYear() &&
                            day.date.getMonth() === selectedDate.getMonth() &&
                            day.date.getDate() === selectedDate.getDate();
                          const hasSchedule = hasScheduleOnDate(day.date);
                          const isToday =
                            day.date.getFullYear() ===
                              new Date().getFullYear() &&
                            day.date.getMonth() === new Date().getMonth() &&
                            day.date.getDate() === new Date().getDate();

                          return (
                            <button
                              key={idx}
                              onClick={() => handleDateClick(day.date)}
                              disabled={!hasSchedule || !day.isCurrentMonth}
                              className={`aspect-square text-xs rounded transition-colors ${
                                !day.isCurrentMonth
                                  ? "text-gray-300 cursor-not-allowed"
                                  : !hasSchedule
                                  ? "text-gray-300 cursor-not-allowed hover:bg-gray-50"
                                  : isSelected
                                  ? "bg-red-500 text-white font-semibold"
                                  : isToday
                                  ? "bg-red-50 text-red-600 font-semibold hover:bg-red-100"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {day.date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Round Selection */}
                  {selectedDate && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        회차
                      </h3>
                      {selectedDateSchedules.length > 0 ? (
                        <div className="space-y-2">
                          {selectedDateSchedules.map((schedule) => (
                            <button
                              key={schedule.performanceScheduleId}
                              onClick={() => setSelectedSchedule(schedule)}
                              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                selectedSchedule?.performanceScheduleId ===
                                schedule.performanceScheduleId
                                  ? "bg-red-600 text-white shadow-md"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{schedule.roundNo}회</span>
                                {schedule.startAt && (
                                  <span
                                    className={
                                      selectedSchedule?.performanceScheduleId ===
                                      schedule.performanceScheduleId
                                        ? "text-white"
                                        : "text-gray-700"
                                    }
                                  >
                                    {new Date(
                                      schedule.startAt
                                    ).toLocaleTimeString("ko-KR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          선택한 날짜에 예매 가능한 회차가 없습니다.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Booking Button */}
                  {selectedSchedule && (
                    <button
                      onClick={handleBooking}
                      className="w-full px-6 py-4 rounded-lg font-bold text-center transition-colors shadow-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      {selectedSchedule.bookingType === "LOTTERY"
                        ? "응모하기 (추첨)"
                        : "예매하기"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  예매 일정 정보가 없습니다.
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <svg
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>
                    예매 일정은 공연 주최사 사정에 의해 사전 예고 없이 변경 또는
                    취소될 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
