"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  typedAdminQueueApi,
  type AdminQueueStatisticsResponse,
  type QueueStatusType,
} from "@/lib/api/typed-admin-queue";

export default function AdminQueueStatistics() {
  const router = useRouter();
  const params = useParams();
  const queueId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statistics, setStatistics] =
    useState<AdminQueueStatisticsResponse | null>(null);

  // 통계 데이터 로드
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await typedAdminQueueApi.getQueueStatistics(
          Number(queueId)
        );
        setStatistics(response);
      } catch (err: any) {
        console.error("대기열 통계 조회 실패:", err);

        if (err.response?.status === 404) {
          setError("해당 대기열을 찾을 수 없습니다.");
        } else if (err.response?.status === 500) {
          setError(
            err.response?.data?.message || "Redis 작업 중 오류가 발생했습니다."
          );
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "통계 정보를 불러오는데 실패했습니다."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (queueId) {
      fetchStatistics();
    }
  }, [queueId]);

  // 페이지로 이동
  const handleGoToDetail = () => {
    router.push(`/admin/queues/${queueId}`);
  };

  // 목록으로 이동
  const handleGoBack = () => {
    router.push("/admin/queues");
  };

  // 새로고침
  const handleRefresh = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await typedAdminQueueApi.getQueueStatistics(
        Number(queueId)
      );
      setStatistics(response);
    } catch (err: any) {
      console.error("대기열 통계 새로고침 실패:", err);

      if (err.response?.status === 404) {
        setError("해당 대기열을 찾을 수 없습니다.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "통계 정보를 불러오는데 실패했습니다."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: QueueStatusType): string => {
    switch (status) {
      case "WAITING":
        return "대기 중";
      case "ENTERABLE":
        return "입장 가능";
      case "EXPIRED":
        return "만료됨";
      case "COMPLETED":
        return "완료됨";
      default:
        return status;
    }
  };

  const getStatusColor = (
    status: QueueStatusType
  ): { bg: string; text: string; border: string } => {
    switch (status) {
      case "WAITING":
        return {
          bg: "bg-blue-50",
          text: "text-blue-800",
          border: "border-blue-200",
        };
      case "ENTERABLE":
        return {
          bg: "bg-green-50",
          text: "text-green-800",
          border: "border-green-200",
        };
      case "EXPIRED":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-800",
          border: "border-yellow-200",
        };
      case "COMPLETED":
        return {
          bg: "bg-purple-50",
          text: "text-purple-800",
          border: "border-purple-200",
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-800",
          border: "border-gray-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12 text-gray-500">로드 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error || "통계 정보를 불러올 수 없습니다."}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                목록으로 돌아가기
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 상태별 통계 정렬 (WAITING, ENTERABLE, EXPIRED, COMPLETED 순서)
  const statusOrder: QueueStatusType[] = [
    "WAITING",
    "ENTERABLE",
    "EXPIRED",
    "COMPLETED",
  ];
  const sortedStatusCounts = [...statistics.statusCounts].sort((a, b) => {
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  });

  // 누적 인원 계산
  const totalAccumulated = sortedStatusCounts.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <button
              onClick={handleGoBack}
              className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <span>←</span>
              <span>목록으로 돌아가기</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              대기열 통계
            </h1>
            <p className="text-gray-600">
              대기열 ID: {statistics.queueId} - 실시간 및 누적 통계
            </p>
          </div>

          {/* 상단 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* 실시간 대기 인원 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 font-medium mb-2">
                실시간 대기 인원
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {statistics.totalWaiting}
              </div>
              <div className="text-xs text-gray-500">명</div>
            </div>

            {/* 실시간 입장 가능 인원 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 font-medium mb-2">
                실시간 입장 가능 인원
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {statistics.totalEnterable}
              </div>
              <div className="text-xs text-gray-500">명</div>
            </div>

            {/* 최대 활성 사용자 수 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <div className="text-sm text-gray-600 font-medium mb-2">
                최대 활성 사용자 수
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {statistics.maxActiveUsers}
              </div>
              <div className="text-xs text-gray-500">명</div>
            </div>

            {/* 사용률 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
              <div className="text-sm text-gray-600 font-medium mb-2">
                현재 사용률
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {Math.round(
                  ((statistics.totalWaiting + statistics.totalEnterable) /
                    statistics.maxActiveUsers) *
                    100
                )}
              </div>
              <div className="text-xs text-gray-500">%</div>
            </div>
          </div>

          {/* 상태별 통계 */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                상태별 누적 통계
              </h2>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
              >
                새로고침
              </button>
            </div>

            {/* 상태별 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {sortedStatusCounts.map((item) => {
                const colors = getStatusColor(item.status);
                const percentage = (
                  (item.count / totalAccumulated) *
                  100
                ).toFixed(1);

                return (
                  <div
                    key={item.status}
                    className={`${colors.bg} border ${colors.border} rounded-lg p-6`}
                  >
                    <div className="text-sm font-medium mb-2">
                      {getStatusLabel(item.status)}
                    </div>
                    <div className="text-3xl font-bold mb-2">{item.count}</div>
                    <div className="text-xs text-gray-600">{percentage}%</div>
                  </div>
                );
              })}
            </div>

            {/* 상세 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      누적 개수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      비율
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      진행 표시줄
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStatusCounts.map((item) => {
                    const colors = getStatusColor(item.status);
                    const percentage = (
                      (item.count / totalAccumulated) *
                      100
                    ).toFixed(1);

                    return (
                      <tr key={item.status} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${colors.text} ${colors.bg} border ${colors.border}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {item.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: colors.text
                                  .replace("text-", "")
                                  .replace("-800", "-600"),
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      합계
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalAccumulated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      100%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-300 rounded-full h-2"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              목록으로 돌아가기
            </button>
            <button
              onClick={handleGoToDetail}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
            >
              상세 정보 보기
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium"
            >
              새로고침
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
