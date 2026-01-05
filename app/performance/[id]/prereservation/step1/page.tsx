"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { performanceApi } from "@/lib/api/performance";
import { typedPrereservationApi } from "@/lib/api/typed-prereservation";

export default function PrereservationStep1({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [performance, setPerformance] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const from = `/performance/${id}/prereservation/step1?scheduleId=${scheduleId}`;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [authLoading, isAuthenticated, id, scheduleId, router]);

  // 공연 정보 로드
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !scheduleId) return;

      try {
        setIsLoading(true);
        setError("");

        const perfId = Number(id);
        const schedId = Number(scheduleId);

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
      } catch (err: any) {
        console.error("정보 로드 실패:", err);
        setError("공연 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, id, scheduleId]);

  const handleApply = async () => {
    if (!schedule) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Step2에서 구역을 선택하므로 여기서는 신청만 진행
      // API에서 구역 선택 없이 신청 가능하면 0을 전달, 아니면 별도 처리 필요
      // 일단 Step2로 이동
      router.push(
        `/performance/${id}/prereservation/step2?scheduleId=${scheduleId}`
      );
    } catch (err: any) {
      console.error("진행 실패:", err);
      setError(err.message || "다음 단계로 진행할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
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
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium text-gray-500">
                  구역/시간 선택
                </span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 font-medium text-gray-500">
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

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              신청예매 신청
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {performance && schedule && (
              <div className="space-y-6">
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
                      {performance.venueName || "장소 정보 없음"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {schedule.roundNo && `${schedule.roundNo}회차`}
                      {schedule.startAt &&
                        ` • ${new Date(schedule.startAt).toLocaleString(
                          "ko-KR"
                        )}`}
                    </p>
                  </div>
                </div>

                {/* 설명 */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    신청예매란?
                  </h3>
                  <p className="text-sm text-blue-800">
                    선착순 예매보다 먼저 원하는 구역과 좌석을 신청할 수 있는
                    방식입니다. 신청 후 지정된 시간에 구역 오픈 알림을 받고 해당
                    시간에 구역을 확인하여 예매를 진행할 수 있습니다.
                  </p>
                </div>

                {/* 신청 버튼 */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "신청 중..." : "신청하기"}
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
