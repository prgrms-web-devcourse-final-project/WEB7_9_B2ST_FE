"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { performanceApi } from "@/lib/api/performance";
import { typedPrereservationApi } from "@/lib/api/typed-prereservation";

export default function PrereservationStep2({
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
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 인증 체크
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const from = `/performance/${id}/prereservation/step2?scheduleId=${scheduleId}`;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [authLoading, isAuthenticated, id, scheduleId, router]);

  // 공연 정보 및 구역 로드
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !scheduleId) return;

      try {
        setIsLoading(true);
        setError("");

        const perfId = Number(id);
        const schedId = Number(scheduleId);

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

        // 구역 정보 로드
        const sectionsRes =
          await typedPrereservationApi.getPrereservationSections(schedId);
        if (Array.isArray(sectionsRes)) {
          setSections(sectionsRes);
          if (sectionsRes.length > 0) {
            setSelectedSectionId(sectionsRes[0].sectionId);
          }
        }
      } catch (err: any) {
        console.error("정보 로드 실패:", err);
        setError("구역 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, id, scheduleId]);

  const handleNext = async () => {
    if (!selectedSectionId) {
      setError("구역을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const schedId = Number(scheduleId);

      // 신청 생성
      await typedPrereservationApi.createPrereservationApplication(
        schedId,
        selectedSectionId
      );

      // Step3으로 이동 (구역 정보도 전달)
      router.push(
        `/performance/${id}/prereservation/step3?scheduleId=${scheduleId}&sectionId=${selectedSectionId}`
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
              <div className="w-16 h-1 bg-green-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium text-green-600">
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
              구역/시간 선택
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
                      {schedule.roundNo && `${schedule.roundNo}회차`}
                      {schedule.startAt &&
                        ` • ${new Date(schedule.startAt).toLocaleString(
                          "ko-KR"
                        )}`}
                    </p>
                  </div>
                </div>

                {/* 구역 선택 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    원하는 구역을 선택해주세요
                  </h3>
                  {sections.length === 0 ? (
                    <p className="text-gray-500">
                      신청 가능한 구역이 없습니다.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {sections.map((section) => (
                        <div
                          key={section.sectionId}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedSectionId === section.sectionId
                              ? "border-green-600 bg-green-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                          onClick={() =>
                            setSelectedSectionId(section.sectionId)
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {section.sectionName}
                              </p>
                              {section.price && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {Number(section.price).toLocaleString()} 원
                                </p>
                              )}
                              {section.availableCount !== undefined && (
                                <p className="text-xs text-gray-500 mt-2">
                                  남은 좌석: {section.availableCount}개
                                </p>
                              )}
                            </div>
                            {selectedSectionId === section.sectionId && (
                              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() =>
                      router.push(
                        `/performance/${id}/prereservation/step1?scheduleId=${scheduleId}`
                      )
                    }
                    className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting || !selectedSectionId}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "진행 중..." : "다음"}
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
