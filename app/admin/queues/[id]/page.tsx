"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  typedAdminQueueApi,
  type AdminQueueDetailResponse,
  type AdminQueueUpdateRequest,
} from "@/lib/api/typed-admin-queue";

export default function AdminQueueDetail() {
  const router = useRouter();
  const params = useParams();
  const queueId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queueDetail, setQueueDetail] =
    useState<AdminQueueDetailResponse | null>(null);

  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editMaxActiveUsers, setEditMaxActiveUsers] = useState<number | null>(
    null
  );
  const [editEntryTtlMinutes, setEditEntryTtlMinutes] = useState<number | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 대기열 상세 정보 로드
  useEffect(() => {
    const fetchQueueDetail = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await typedAdminQueueApi.getQueue(Number(queueId));
        setQueueDetail(response);
      } catch (err: any) {
        console.error("대기열 상세 조회 실패:", err);

        if (err.response?.status === 404) {
          setError("해당 대기열을 찾을 수 없습니다.");
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "대기열 정보를 불러오는데 실패했습니다."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (queueId) {
      fetchQueueDetail();
    }
  }, [queueId]);

  // 수정 모드 진입
  const handleEditClick = () => {
    if (queueDetail) {
      setEditMaxActiveUsers(queueDetail.maxActiveUsers);
      setEditEntryTtlMinutes(queueDetail.entryTtlMinutes);
      setIsEditMode(true);
      setError("");
    }
  };

  // 수정 모드 취소
  const handleCancel = () => {
    setIsEditMode(false);
    setEditMaxActiveUsers(null);
    setEditEntryTtlMinutes(null);
    setError("");
    setSuccessMessage("");
  };

  // 설정 저장
  const handleSave = async () => {
    if (!queueDetail) return;

    // 유효성 검사
    if (
      editMaxActiveUsers === null ||
      editMaxActiveUsers < 1 ||
      editEntryTtlMinutes === null ||
      editEntryTtlMinutes < 1
    ) {
      setError("모든 필드에 1 이상의 값을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updateRequest: AdminQueueUpdateRequest = {
        maxActiveUsers: editMaxActiveUsers,
        entryTtlMinutes: editEntryTtlMinutes,
      };

      const response = await typedAdminQueueApi.updateQueue(
        Number(queueId),
        updateRequest
      );

      setQueueDetail(response);
      setIsEditMode(false);
      setSuccessMessage("대기열 설정이 성공적으로 수정되었습니다.");

      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("대기열 설정 수정 실패:", err);

      if (err.response?.status === 404) {
        setError("해당 대기열을 찾을 수 없습니다.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "설정 수정에 실패했습니다."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 대기열 삭제
  const handleDelete = async () => {
    if (!queueDetail) return;

    const confirmDelete = confirm(
      "정말로 이 대기열을 삭제하시겠습니까?\nRedis 데이터도 함께 정리됩니다."
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await typedAdminQueueApi.deleteQueue(Number(queueId));
      setSuccessMessage("대기열이 성공적으로 삭제되었습니다.");

      // 2초 후 목록 페이지로 이동
      setTimeout(() => {
        router.push("/admin/queues");
      }, 2000);
    } catch (err: any) {
      console.error("대기열 삭제 실패:", err);

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
            "대기열 삭제에 실패했습니다."
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 목록으로 돌아가기
  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12 text-gray-500">로드 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !queueDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error || "대기열 정보를 불러올 수 없습니다."}
            </div>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  const getQueueTypeLabel = (queueType: string): string => {
    switch (queueType) {
      case "BOOKING_ORDER":
        return "선착순 예매";
      case "LOTTERY":
        return "로또";
      case "PROMOTION":
        return "프로모션";
      default:
        return queueType;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              대기열 상세 정보
            </h1>
            <p className="text-gray-600">대기열 ID: {queueDetail.queueId}</p>
          </div>

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

          {/* 상세 정보 카드 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 좌측: 기본 정보 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  기본 정보
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대기열 ID
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {queueDetail.queueId}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      공연 ID
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {queueDetail.performanceId}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대기열 타입
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
                        {getQueueTypeLabel(queueDetail.queueType)}
                      </span>
                    </div>
                  </div>

                  {!isEditMode ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          최대 동시 입장 인원
                        </label>
                        <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                          {queueDetail.maxActiveUsers}명
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          입장권 유효시간
                        </label>
                        <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                          {queueDetail.entryTtlMinutes}분
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          최대 동시 입장 인원 *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={editMaxActiveUsers || ""}
                          onChange={(e) =>
                            setEditMaxActiveUsers(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          입장권 유효시간 (분) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={editEntryTtlMinutes || ""}
                          onChange={(e) =>
                            setEditEntryTtlMinutes(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 우측: 현재 상태 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  현재 상태
                </h2>
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-700 font-medium mb-2">
                      현재 대기 인원
                    </div>
                    <div className="text-4xl font-bold text-blue-900">
                      {queueDetail.currentWaiting}
                    </div>
                    <div className="text-xs text-blue-600 mt-2">명</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">
                      현재 입장 가능 인원
                    </div>
                    <div className="text-4xl font-bold text-green-900">
                      {queueDetail.currentEnterable}
                    </div>
                    <div className="text-xs text-green-600 mt-2">명</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-3">합계 통계</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">
                          대기 + 입장 가능:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {queueDetail.currentWaiting +
                            queueDetail.currentEnterable}
                          명
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700">
                          최대 수용 인원:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {queueDetail.maxActiveUsers}명
                        </span>
                      </div>
                      <div className="flex justify-between mt-3 pt-2 border-t border-gray-300">
                        <span className="text-sm text-gray-700">사용률:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {Math.round(
                            ((queueDetail.currentWaiting +
                              queueDetail.currentEnterable) /
                              queueDetail.maxActiveUsers) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
                disabled={isDeleting}
              >
                목록으로 돌아가기
              </button>
              {!isEditMode ? (
                <>
                  <button
                    onClick={() =>
                      router.push(`/admin/queues/${queueId}/statistics`)
                    }
                    disabled={isDeleting}
                    className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    통계 보기
                  </button>
                  <button
                    onClick={handleEditClick}
                    disabled={isDeleting}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    설정 수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isDeleting}
                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving || isDeleting}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
                  >
                    취소
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
