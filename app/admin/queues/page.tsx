"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  typedAdminQueueApi,
  type AdminQueueCreateRequest,
  type AdminQueueListItemResponse,
  type QueueType,
} from "@/lib/api/typed-admin-queue";
import {
  performanceApi,
  type PerformanceScheduleListRes,
} from "@/lib/api/performance";

export default function AdminQueuesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "list" | "detail">(
    "list"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 대기열 생성 폼 상태
  const [performances, setPerformances] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [schedules, setSchedules] = useState<PerformanceScheduleListRes[]>([]);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<
    number | null
  >(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null
  );
  const [queueType, setQueueType] = useState<
    "BOOKING_ORDER" | "LOTTERY" | "PROMOTION"
  >("BOOKING_ORDER");
  const [maxActiveUsers, setMaxActiveUsers] = useState(100);
  const [entryTtlMinutes, setEntryTtlMinutes] = useState(10);

  // 대기열 목록 및 필터
  const [queueList, setQueueList] = useState<AdminQueueListItemResponse[]>([]);
  const [filterPerformanceId, setFilterPerformanceId] = useState<number | null>(
    null
  );
  const [filterQueueType, setFilterQueueType] = useState<QueueType | null>(
    null
  );

  // 대기열 상세 조회
  const [selectedQueueDetail, setSelectedQueueDetail] =
    useState<AdminQueueListItemResponse | null>(null);

  // 공연 목록 로드
  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const response = await performanceApi.getPerformances({ size: 100 });
        if (response.data?.content) {
          setPerformances(
            response.data.content.map((p) => ({
              id: p.performanceId || 0,
              title: p.title || "Unknown",
            }))
          );
        }
      } catch (err) {
        console.error("공연 목록 로드 실패:", err);
      }
    };

    if (isAdmin) {
      fetchPerformances();
    }
  }, [isAdmin]);

  // 선택된 공연의 회차 로드
  useEffect(() => {
    if (!selectedPerformanceId) {
      setSchedules([]);
      return;
    }

    const fetchSchedules = async () => {
      try {
        const response = await performanceApi.getSchedules(
          selectedPerformanceId
        );
        if (Array.isArray(response.data)) {
          setSchedules(response.data);
        }
      } catch (err) {
        console.error("회차 목록 로드 실패:", err);
      }
    };

    fetchSchedules();
  }, [selectedPerformanceId]);

  // 대기열 목록 로드
  const loadQueueList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await typedAdminQueueApi.listQueues({
        performanceId: filterPerformanceId || undefined,
        queueType: filterQueueType || undefined,
      });

      setQueueList(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("대기열 목록 로드 실패:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "대기열 목록을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [filterPerformanceId, filterQueueType]);

  // 초기 로드 및 필터 변경 시 재로드
  useEffect(() => {
    loadQueueList();
  }, [loadQueueList]);

  // 대기열 생성
  const handleCreateQueue = async () => {
    if (!selectedScheduleId) {
      setError("회차를 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const request: AdminQueueCreateRequest = {
        scheduleId: selectedScheduleId,
        queueType,
        maxActiveUsers,
        entryTtlMinutes,
      };

      const response = await typedAdminQueueApi.createQueue(request);

      setSuccessMessage(`대기열이 생성되었습니다. (ID: ${response.queueId})`);

      // 폼 초기화
      setSelectedPerformanceId(null);
      setSelectedScheduleId(null);
      setQueueType("BOOKING_ORDER");
      setMaxActiveUsers(100);
      setEntryTtlMinutes(10);

      // 목록 새로고침
      setActiveTab("list");
      await loadQueueList();
    } catch (err: any) {
      console.error("대기열 생성 실패:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "대기열 생성에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 대기열 삭제
  const handleDeleteQueue = async (queueId: number) => {
    if (!confirm("정말로 이 대기열을 삭제하시겠습니까?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await typedAdminQueueApi.deleteQueue(queueId);
      setSuccessMessage("대기열이 삭제되었습니다.");
      setQueueList((prev) => prev.filter((q) => q.queueId !== queueId));
    } catch (err: any) {
      console.error("대기열 삭제 실패:", err);
      setError(err.response?.data?.message || "대기열 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 대기열 리셋
  const handleResetQueue = async (queueId: number) => {
    if (!confirm("정말로 이 대기열을 초기화하시겠습니까? (Redis 초기화)")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await typedAdminQueueApi.resetQueue(queueId);
      setSuccessMessage("대기열이 초기화되었습니다.");
      // 목록 새로고침
      await loadQueueList();
    } catch (err: any) {
      console.error("대기열 초기화 실패:", err);
      setError(err.response?.data?.message || "대기열 초기화에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">대기열 관리</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 알림 메시지 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* 탭 네비게이션 */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("list")}
                className={`px-6 py-3 font-medium ${
                  activeTab === "list"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                대기열 목록
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-6 py-3 font-medium ${
                  activeTab === "create"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                대기열 생성
              </button>
            </div>
          </div>

          {/* 대기열 목록 탭 */}
          {activeTab === "list" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* 필터 */}
              <div className="mb-6 flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공연 필터
                  </label>
                  <select
                    value={filterPerformanceId || ""}
                    onChange={(e) =>
                      setFilterPerformanceId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전체</option>
                    {performances.map((perf) => (
                      <option key={perf.id} value={perf.id}>
                        {perf.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대기열 타입 필터
                  </label>
                  <select
                    value={filterQueueType || ""}
                    onChange={(e) =>
                      setFilterQueueType((e.target.value as QueueType) || null)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">전체</option>
                    <option value="BOOKING_ORDER">선착순 예매</option>
                    <option value="LOTTERY">로또</option>
                    <option value="PROMOTION">프로모션</option>
                  </select>
                </div>
              </div>

              {/* 로딩 상태 */}
              {loading && (
                <div className="text-center py-8 text-gray-500">로드 중...</div>
              )}

              {/* 테이블 */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        공연 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        타입
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        최대 입장 인원
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        입장권 유효시간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        현재 상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        조치
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queueList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          대기열 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      queueList.map((queue) => (
                        <tr
                          key={queue.queueId}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() =>
                            router.push(`/admin/queues/${queue.queueId}`)
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {queue.queueId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {queue.performanceId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
                              {queue.queueType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {queue.maxActiveUsers}명
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {queue.entryTtlMinutes}분
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2 text-xs">
                              <span className="text-gray-600">
                                대기: {queue.currentWaiting}
                              </span>
                              <span className="text-green-600">
                                입장: {queue.currentEnterable}
                              </span>
                            </div>
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm flex gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleResetQueue(queue.queueId)}
                              disabled={loading}
                              className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 disabled:opacity-50"
                            >
                              초기화
                            </button>
                            <button
                              onClick={() => handleDeleteQueue(queue.queueId)}
                              disabled={loading}
                              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 대기열 생성 탭 */}
          {activeTab === "create" && (
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
              <div className="space-y-6">
                {/* 공연 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공연 선택 *
                  </label>
                  <select
                    value={selectedPerformanceId || ""}
                    onChange={(e) =>
                      setSelectedPerformanceId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">공연을 선택해주세요</option>
                    {performances.map((perf) => (
                      <option key={perf.id} value={perf.id}>
                        {perf.title} (ID: {perf.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 회차 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회차 선택 *
                  </label>
                  <select
                    value={selectedScheduleId || ""}
                    onChange={(e) =>
                      setSelectedScheduleId(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    disabled={!selectedPerformanceId}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">회차를 선택해주세요</option>
                    {schedules.map((schedule) => (
                      <option
                        key={schedule.performanceScheduleId}
                        value={schedule.performanceScheduleId}
                      >
                        {schedule.startAt &&
                          new Date(schedule.startAt).toLocaleDateString(
                            "ko-KR"
                          )}{" "}
                        {schedule.startAt &&
                          new Date(schedule.startAt).toLocaleTimeString(
                            "ko-KR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        {schedule.roundNo && ` (${schedule.roundNo}회차)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 대기열 타입 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대기열 타입 *
                  </label>
                  <select
                    value={queueType}
                    onChange={(e) =>
                      setQueueType(
                        e.target.value as
                          | "BOOKING_ORDER"
                          | "LOTTERY"
                          | "PROMOTION"
                      )
                    }
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BOOKING_ORDER">선착순 예매</option>
                    <option value="LOTTERY">로또</option>
                    <option value="PROMOTION">프로모션</option>
                  </select>
                </div>

                {/* 최대 동시 입장 인원 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 동시 입장 인원 (명) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={maxActiveUsers}
                    onChange={(e) =>
                      setMaxActiveUsers(Math.max(1, Number(e.target.value)))
                    }
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    동시에 입장 가능한 최대 인원 수입니다.
                  </p>
                </div>

                {/* 입장권 유효 시간 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입장권 유효 시간 (분) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={entryTtlMinutes}
                    onChange={(e) =>
                      setEntryTtlMinutes(Math.max(1, Number(e.target.value)))
                    }
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    입장 가능 상태 유지 시간입니다.
                  </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCreateQueue}
                    disabled={loading || !selectedScheduleId}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? "생성 중..." : "대기열 생성"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPerformanceId(null);
                      setSelectedScheduleId(null);
                      setQueueType("BOOKING_ORDER");
                      setMaxActiveUsers(100);
                      setEntryTtlMinutes(10);
                      setError("");
                    }}
                    disabled={loading}
                    className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-medium"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
