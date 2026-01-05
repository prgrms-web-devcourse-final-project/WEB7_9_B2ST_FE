"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminApi,
  type ScheduleSeat,
  type ScheduleSeatStatus,
} from "@/lib/api/admin";

const STATUS_OPTIONS: { value: ScheduleSeatStatus | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "AVAILABLE", label: "AVAILABLE (예매 가능)" },
  { value: "HOLD", label: "HOLD (임시 예약)" },
  { value: "SOLD", label: "SOLD (판매 완료)" },
];

function getStatusBadgeColor(status: ScheduleSeatStatus) {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-100 text-green-800";
    case "HOLD":
      return "bg-yellow-100 text-yellow-800";
    case "SOLD":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}

export default function AdminScheduleSeatsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const [scheduleId, setScheduleId] = useState("");
  const [status, setStatus] = useState<ScheduleSeatStatus | "">("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [seats, setSeats] = useState<ScheduleSeat[]>([]);

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSeats = async () => {
    if (!scheduleId) {
      setError("회차 ID를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await adminApi.getScheduleSeats(
        parseInt(scheduleId, 10),
        status ? { status } : undefined
      );

      setSeats(response.data || []);
    } catch (err: any) {
      console.error("좌석 조회 실패:", err);
      const msg =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchSeats();
  };

  const statusSummary = seats.reduce((acc, seat) => {
    acc[seat.status] = (acc[seat.status] || 0) + 1;
    return acc;
  }, {} as Record<ScheduleSeatStatus, number>);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">회차 좌석 조회</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← 대시보드로
          </button>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">조회 조건</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  회차 ID *
                </label>
                <input
                  type="number"
                  value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                  placeholder="예: 1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  조회할 회차의 ID를 입력하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  좌석 상태 (선택)
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as ScheduleSeatStatus | "")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isLoading}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  선택하지 않으면 모든 상태를 조회합니다
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
                disabled={isLoading || !scheduleId}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "조회 중..." : "조회"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleId("");
                  setStatus("");
                  setSeats([]);
                  setError("");
                }}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                초기화
              </button>
            </div>
          </form>
        </section>

        {seats.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">상태 요약</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <div className="text-sm text-green-700">예매 가능</div>
                <div className="text-2xl font-bold text-green-900">
                  {statusSummary.AVAILABLE || 0}석
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm text-yellow-700">임시 예약</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {statusSummary.HOLD || 0}석
                </div>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <div className="text-sm text-red-700">판매 완료</div>
                <div className="text-2xl font-bold text-red-900">
                  {statusSummary.SOLD || 0}석
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">조회 결과</h2>
            <div className="text-sm text-gray-600">총 {seats.length}석</div>
          </div>

          {seats.length === 0 ? (
            <div className="p-4 border border-dashed border-gray-300 rounded text-sm text-gray-600">
              데이터가 없습니다. 회차 ID를 입력하여 조회해주세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      회차좌석 ID
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      좌석 ID
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      구역
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      행
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      좌석번호
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      등급
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      가격
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {seats.map((seat) => (
                    <tr key={seat.scheduleSeatId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">
                        {seat.scheduleSeatId}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{seat.seatId}</td>
                      <td className="px-4 py-2 text-gray-700">
                        {seat.sectionName}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {seat.rowLabel}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {seat.seatNumber}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{seat.grade}</td>
                      <td className="px-4 py-2 text-gray-700 font-semibold">
                        {formatPrice(seat.price)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                            seat.status
                          )}`}
                        >
                          {seat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
