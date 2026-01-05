"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminApi,
  type AdminReservation,
  type ReservationStatus,
} from "@/lib/api/admin";

const STATUS_OPTIONS: ReservationStatus[] = [
  "PENDING",
  "COMPLETED",
  "CANCELED",
  "EXPIRED",
];

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminReservationsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const [scheduleId, setScheduleId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState<ReservationStatus | "">("");
  const [page, setPage] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
    first: true,
    last: true,
    size: 20,
  });

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtersSummary = useMemo(() => {
    const parts = [] as string[];
    if (status) parts.push(`상태=${status}`);
    if (scheduleId) parts.push(`회차=${scheduleId}`);
    if (memberId) parts.push(`회원=${memberId}`);
    return parts.length ? parts.join(" · ") : "필터 없음";
  }, [status, scheduleId, memberId]);

  const fetchReservations = async (pageToLoad: number) => {
    if (!status) {
      setError("상태를 선택해야 조회할 수 있습니다.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await adminApi.getReservations({
        scheduleId: scheduleId ? parseInt(scheduleId, 10) : undefined,
        memberId: memberId ? parseInt(memberId, 10) : undefined,
        page: pageToLoad,
        status,
      });

      setReservations(response.data.content || []);
      setPageInfo({
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        number: response.data.number,
        first: response.data.first,
        last: response.data.last,
        size: response.data.size,
      });
      setPage(response.data.number);
    } catch (err: any) {
      console.error("예매 조회 실패:", err);
      const msg =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchReservations(0);
  };

  const handlePrev = async () => {
    if (!pageInfo.first) {
      await fetchReservations(Math.max(0, page - 1));
    }
  };

  const handleNext = async () => {
    if (!pageInfo.last) {
      await fetchReservations(page + 1);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">예매 조회</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← 대시보드로
          </button>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">필터</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  회차 ID (선택)
                </label>
                <input
                  type="number"
                  value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                  placeholder="예: 1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  회원 ID (선택)
                </label>
                <input
                  type="number"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="예: 2"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  예매 상태 *
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ReservationStatus | "")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                >
                  <option value="">상태를 선택하세요</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  상태를 선택하지 않으면 조회되지 않습니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  페이지 (0부터)
                </label>
                <input
                  type="number"
                  value={page}
                  onChange={(e) => setPage(parseInt(e.target.value || "0", 10))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  한 페이지에 20개씩 표시됩니다.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !status}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "조회 중..." : "조회"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleId("");
                  setMemberId("");
                  setStatus("");
                  setPage(0);
                  setReservations([]);
                  setError("");
                  setPageInfo({
                    totalElements: 0,
                    totalPages: 0,
                    number: 0,
                    first: true,
                    last: true,
                    size: 20,
                  });
                }}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                초기화
              </button>
            </div>

            <p className="text-xs text-gray-500">현재 필터: {filtersSummary}</p>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">조회 결과</h2>
            <div className="text-sm text-gray-600">
              총 {pageInfo.totalElements}건 · {pageInfo.number + 1}/
              {Math.max(pageInfo.totalPages, 1)} 페이지
            </div>
          </div>

          {reservations.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-300 rounded text-sm text-gray-600">
              데이터가 없습니다. 상태를 선택해 조회해주세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      예약 ID
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      회차 ID
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      회원 ID
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      상태
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      좌석 수
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      생성일
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      만료일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map((r) => (
                    <tr key={r.reservationId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">
                        {r.reservationId}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {r.scheduleId}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{r.memberId}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">{r.seatCount}</td>
                      <td className="px-4 py-2 text-gray-700">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {formatDate(r.expiresAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={isLoading || pageInfo.first}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <div className="text-sm text-gray-600">
              페이지 {pageInfo.number + 1} / {Math.max(pageInfo.totalPages, 1)}
            </div>
            <button
              onClick={handleNext}
              disabled={isLoading || pageInfo.last}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
