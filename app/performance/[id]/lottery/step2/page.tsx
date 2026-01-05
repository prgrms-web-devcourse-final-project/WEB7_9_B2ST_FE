"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, use } from "react";
import { lotteryApi, type LotterySection } from "@/lib/api/lottery";
import Header from "@/components/Header";

export default function LotteryStep2({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();
  const { id } = use(params);
  const performanceId = Number(id);
  const scheduleId = Number(searchParams.get("scheduleId"));

  const [sections, setSections] = useState<LotterySection[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<{
    sectionName: string;
    grade: string;
    seatGradeId?: number;
  } | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

  // 구역/등급 데이터 로드
  useEffect(() => {
    const fetchSections = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await lotteryApi.getLotterySections(performanceId);
        if (response.data) {
          setSections(response.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("구역 배치 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (performanceId) {
      fetchSections();
    }
  }, [performanceId]);

  const clampTicket = (value: number) => Math.min(4, Math.max(1, value));

  const handleSubmit = async () => {
    if (!scheduleId || !selectedGrade) {
      setError("회차 또는 구역 정보가 누락되었습니다.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await lotteryApi.createLotteryEntry(performanceId, {
        scheduleId,
        grade: selectedGrade.grade,
        quantity: ticketCount,
      });

      if (response.data) {
        setIsComplete(true);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("응모 등록에 실패했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">응모 완료</h2>
            <p className="text-gray-600 mb-4">
              추첨 결과는 발표일자에 알려드립니다.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              당첨 시 마이페이지에서 결제 버튼으로 결제를 진행하세요.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/performance/${id}`}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                공연 페이지로
              </Link>
              <Link
                href="/my-page"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                마이페이지 이동
              </Link>
            </div>
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
          {/* Progress Steps (2단계로 축소) */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 font-medium text-gray-500">
                  날짜/회차 선택
                </span>
              </div>
              <div className="w-16 h-1 bg-purple-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium text-purple-600">
                  구역/매수 선택
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Section Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                구역 배치 설명
              </h2>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">로딩 중...</p>
                </div>
              ) : (
                <div className="relative bg-gray-100 rounded-lg p-8 min-h-[400px]">
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-8 py-4 rounded-lg text-center font-bold">
                    STAGE
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-32">
                    {sections.map((section) =>
                      section.grades.map((grade, gradeIndex) => {
                        const isSelected =
                          selectedGrade?.sectionName === section.sectionName &&
                          selectedGrade?.grade === grade.grade;
                        return (
                          <div
                            key={`${section.sectionName}-${grade.grade}`}
                            className={`p-6 rounded-lg border-2 ${
                              isSelected
                                ? "border-purple-600 bg-purple-50"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            <div className="text-center">
                              <h3 className="font-bold text-lg text-gray-900 mb-2">
                                {section.sectionName} - {grade.grade}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {grade.rows.length}개 행
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                좌석 등급 정보
              </h2>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">로딩 중...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {sections.map((section) =>
                      section.grades.map((grade, gradeIndex) => {
                        const isSelected =
                          selectedGrade?.sectionName === section.sectionName &&
                          selectedGrade?.grade === grade.grade;
                        return (
                          <button
                            key={`${section.sectionName}-${grade.grade}`}
                            onClick={() =>
                              setSelectedGrade({
                                sectionName: section.sectionName,
                                grade: grade.grade,
                                seatGradeId: gradeIndex + 1,
                              })
                            }
                            className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                              isSelected
                                ? "border-purple-600 bg-purple-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {section.sectionName} - {grade.grade}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  행: {grade.rows.join(", ")}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {selectedGrade && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        매수 선택 (최대 4매)
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            setTicketCount((prev) => clampTicket(prev - 1))
                          }
                          className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium w-12 text-center">
                          {ticketCount}
                        </span>
                        <button
                          onClick={() =>
                            setTicketCount((prev) => clampTicket(prev + 1))
                          }
                          className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        한 번에 최대 4장까지 응모 가능합니다.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/performance/${id}/lottery/step1`}
                      className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-300 transition-colors"
                    >
                      이전 단계
                    </Link>
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedGrade || !scheduleId || isSubmitting}
                      className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold text-center hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "응모 중..." : "응모 완료"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
