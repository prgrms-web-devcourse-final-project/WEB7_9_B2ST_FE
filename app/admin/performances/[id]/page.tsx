"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  performanceApi,
  type PerformanceDetailRes,
} from "@/lib/api/performance";

export default function AdminPerformanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const performanceId = params.id as string;

  const [isAdmin, setIsAdmin] = useState(false);
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [bookingOpenAt, setBookingOpenAt] = useState("");
  const [bookingCloseAt, setBookingCloseAt] = useState("");
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
      return;
    }

    loadPerformance();
  }, [performanceId, router]);

  const loadPerformance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await performanceApi.getAdminPerformance(
        parseInt(performanceId)
      );
      if (response.data) {
        setPerformance(response.data);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "공연 정보를 불러오는데 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPolicy = () => {
    setIsEditingPolicy(true);
    setPolicyError(null);
    setBookingOpenAt(performance?.bookingOpenAt || "");
    setBookingCloseAt(performance?.bookingCloseAt || "");
  };

  const handleSavePolicy = async () => {
    setPolicyError(null);
    setIsSavingPolicy(true);

    try {
      await performanceApi.updateBookingPolicy(parseInt(performanceId), {
        bookingOpenAt,
        bookingCloseAt,
      });
      await loadPerformance();
      setIsEditingPolicy(false);
      alert("예매 정책이 업데이트되었습니다.");
    } catch (err: any) {
      setPolicyError(
        err?.response?.data?.message || "예매 정책 업데이트에 실패했습니다"
      );
    } finally {
      setIsSavingPolicy(false);
    }
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          ← 돌아가기
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error || "공연을 찾을 수 없습니다"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        ← 돌아가기
      </button>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex gap-6 mb-6">
          <div className="w-48 h-64 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
            {performance.posterUrl ? (
              <img
                src={performance.posterUrl}
                alt={performance.title || "공연"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{performance.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                {performance.category}
              </span>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  performance.status === "ACTIVE"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {performance.status}
              </span>
              {performance.isBookable && (
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                  예매 가능
                </span>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex">
                <span className="w-24 text-gray-500">공연 ID</span>
                <span className="font-medium">{performance.performanceId}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">공연장</span>
                <span className="font-medium">
                  {performance.venue?.name || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">공연 기간</span>
                <span className="font-medium">
                  {performance.startDate} ~ {performance.endDate}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">예매 오픈</span>
                <span className="font-medium">
                  {performance.bookingOpenAt || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-gray-500">예매 마감</span>
                <span className="font-medium">
                  {performance.bookingCloseAt || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {performance.description && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-3">공연 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {performance.description}
            </p>
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">예매 정책 관리</h2>
            {!isEditingPolicy && (
              <button
                onClick={handleEditPolicy}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                수정
              </button>
            )}
          </div>

          {isEditingPolicy ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  예매 오픈 시간
                </label>
                <input
                  type="datetime-local"
                  value={bookingOpenAt ? bookingOpenAt.slice(0, 16) : ""}
                  onChange={(e) =>
                    setBookingOpenAt(
                      e.target.value ? `${e.target.value}:00` : ""
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={isSavingPolicy}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  예매 마감 시간
                </label>
                <input
                  type="datetime-local"
                  value={bookingCloseAt ? bookingCloseAt.slice(0, 16) : ""}
                  onChange={(e) =>
                    setBookingCloseAt(
                      e.target.value ? `${e.target.value}:00` : ""
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={isSavingPolicy}
                />
              </div>

              {policyError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {policyError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSavePolicy}
                  disabled={isSavingPolicy}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isSavingPolicy ? "저장 중..." : "저장"}
                </button>
                <button
                  onClick={() => setIsEditingPolicy(false)}
                  disabled={isSavingPolicy}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-32 text-gray-500">예매 오픈</span>
                <span className="font-medium">
                  {performance.bookingOpenAt || "-"}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">예매 마감</span>
                <span className="font-medium">
                  {performance.bookingCloseAt || "-"}
                </span>
              </div>
            </div>
          )}
        </div>

        {performance.gradePrices && performance.gradePrices.length > 0 && (
          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-semibold mb-3">등급별 가격</h2>
            <div className="grid grid-cols-2 gap-3">
              {performance.gradePrices.map((grade, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <span className="font-medium">{grade.gradeType}</span>
                  <span className="text-lg font-bold text-red-600">
                    {grade.price.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
