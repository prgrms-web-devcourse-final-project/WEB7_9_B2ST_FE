"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, use } from "react";
import Header from "@/components/Header";
import {
  typedQueueApi,
  type QueuePositionResponse,
} from "@/lib/api/typed-queue";

export default function QueueWaiting({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("scheduleId");
  const queueId = searchParams.get("queueId");

  const [queueData, setQueueData] = useState<QueuePositionResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollingCount, setPollingCount] = useState(0);

  // 대기열 위치 조회
  const fetchQueuePosition = useCallback(async () => {
    if (!queueId) return;

    try {
      const response = await typedQueueApi.getPosition(Number(queueId));
      setQueueData(response);
      setError("");

      // 입장 가능 상태가 되면 예매 페이지로 이동
      if (response.status === "ENTERABLE") {
        router.push(
          `/performance/${id}/booking/seats?scheduleId=${scheduleId}&queueId=${queueId}`
        );
      }

      // 만료되었거나 완료된 경우 경고
      if (response.status === "EXPIRED") {
        setError("입장 권한이 만료되었습니다.");
      } else if (response.status === "COMPLETED") {
        setError("이미 입장이 완료되었습니다.");
      } else if (response.status === "NOT_IN_QUEUE") {
        setError("대기열에 등록되지 않았습니다.");
      }
    } catch (err: any) {
      console.error("대기열 위치 조회 실패:", err);
      setError(
        err.response?.data?.message || "대기열 정보를 불러오는데 실패했습니다."
      );
    }
  }, [queueId, id, scheduleId, router]);

  // 초기 로딩
  useEffect(() => {
    if (!scheduleId || !queueId) {
      setError("잘못된 접근입니다.");
      setIsLoading(false);
      return;
    }

    const init = async () => {
      setIsLoading(true);
      await fetchQueuePosition();
      setIsLoading(false);
    };

    init();
  }, [scheduleId, queueId, fetchQueuePosition]);

  // 3초마다 폴링
  useEffect(() => {
    if (isLoading || error || !queueData) return;

    if (queueData.status === "WAITING") {
      const interval = setInterval(() => {
        setPollingCount((prev) => prev + 1);
        fetchQueuePosition();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLoading, error, queueData, fetchQueuePosition]);

  // 나가기 버튼 핸들러
  const handleExit = async () => {
    if (!confirm("대기를 취소하시겠습니까?")) {
      return;
    }

    if (!queueId) {
      router.push(`/performance/${id}`);
      return;
    }

    try {
      // 대기열 나가기 API 호출
      await typedQueueApi.exit(Number(queueId));
      alert("대기가 취소되었습니다.");
      router.push(`/performance/${id}`);
    } catch (err: any) {
      console.error("대기열 나가기 실패:", err);
      // 에러가 발생해도 페이지 이동
      alert(
        err.response?.data?.message ||
          "대기열 나가기에 실패했습니다. 페이지를 이동합니다."
      );
      router.push(`/performance/${id}`);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">대기열 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !queueData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-16">
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center text-red-600 mb-6">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-lg font-semibold">
                  {error || "오류가 발생했습니다."}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push(`/performance/${id}`)}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  공연 상세로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pt-16">
        <div className="max-w-2xl mx-auto p-6">
          {/* 대기열 상태 카드 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                예매 대기 중
              </h1>
              <p className="text-gray-600">
                잠시만 기다려주세요. 곧 입장하실 수 있습니다.
              </p>
            </div>

            {/* 대기 인원 */}
            {queueData.status === "WAITING" &&
            queueData.aheadCount !== null &&
            queueData.myRank !== null ? (
              <>
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      내 앞 대기 인원
                    </p>
                    <p className="text-5xl font-bold text-blue-600 mb-3">
                      {queueData.aheadCount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">명</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">내 순서</p>
                      <p className="text-2xl font-semibold text-gray-700">
                        {queueData.myRank.toLocaleString()}번째
                      </p>
                    </div>
                  </div>
                </div>

                {/* 예상 대기 시간 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-gray-700">
                      예상 대기 시간:{" "}
                      <span className="font-semibold text-gray-900">
                        약 {Math.ceil(queueData.aheadCount / 20)}분
                      </span>
                    </p>
                  </div>
                </div>

                {/* 진행 상황 표시 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">진행 상황</span>
                    <span className="text-sm text-gray-600">
                      {pollingCount > 0 && `업데이트: ${pollingCount}회`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 animate-pulse"
                      style={{
                        width:
                          queueData.aheadCount > 50
                            ? "20%"
                            : `${100 - queueData.aheadCount * 2}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
                <p className="text-gray-600">
                  {queueData.status === "ENTERABLE" && "입장 가능 상태입니다."}
                  {queueData.status === "EXPIRED" &&
                    "입장 권한이 만료되었습니다."}
                  {queueData.status === "COMPLETED" && "입장이 완료되었습니다."}
                  {queueData.status === "NOT_IN_QUEUE" &&
                    "대기열에 등록되지 않았습니다."}
                </p>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
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
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">유의사항</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      이 페이지를 새로고침하거나 닫으면 대기가 취소됩니다.
                    </li>
                    <li>대기 순서는 자동으로 업데이트됩니다.</li>
                    <li>입장 가능 시 자동으로 예매 페이지로 이동합니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 나가기 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={handleExit}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                대기 취소
              </button>
            </div>
          </div>

          {/* 실시간 업데이트 표시 */}
          <div className="text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>3초마다 자동 업데이트 중</span>
            </div>
            {queueData.status === "WAITING" && queueData.myRank !== null && (
              <p className="mt-2 text-xs">
                큐 ID: {queueData.queueId} | 순서: {queueData.myRank}번
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
