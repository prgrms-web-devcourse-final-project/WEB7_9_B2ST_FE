"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";

export default function AdminVenueSeatsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [venueId, setVenueId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [rowLabel, setRowLabel] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!venueId || !sectionId || !rowLabel.trim() || !seatNumber) {
      setError("모든 필드를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await adminApi.createVenueSeat(parseInt(venueId, 10), {
        sectionId: parseInt(sectionId, 10),
        rowLabel: rowLabel.trim(),
        seatNumber: parseInt(seatNumber, 10),
      });

      if (response.data) {
        const { seatId, sectionName } = response.data;
        setSuccessMessage(
          `좌석이 성공적으로 등록되었습니다. (좌석 ID: ${seatId}, 구역: ${sectionName})`
        );
        // venueId, sectionId 유지하여 연속 등록 가능
        setRowLabel("");
        setSeatNumber("");
      }
    } catch (err: any) {
      console.error("좌석 등록 실패:", err);
      console.error("에러 상세:", {
        message: err?.message,
        response: err?.response,
        status: err?.status,
      });

      let errorMessage = "좌석 등록에 실패했습니다.";
      if (err instanceof Error) {
        const msg = err.message || "";
        if (msg.includes("403") || msg.includes("권한")) {
          errorMessage = "권한이 없습니다. 관리자 로그인이 필요합니다.";
        } else if (msg.includes("401")) {
          errorMessage = "인증이 필요합니다. 관리자로 로그인해주세요.";
        } else if (msg.includes("400")) {
          errorMessage =
            "요청 값이 올바르지 않습니다. 좌석 정보를 다시 확인해주세요.";
        } else if (msg.includes("404")) {
          errorMessage = msg.includes("공연장")
            ? "공연장 정보를 찾을 수 없습니다."
            : msg.includes("구역")
            ? "구역 정보를 찾을 수 없습니다."
            : "요청한 정보를 찾을 수 없습니다.";
        } else if (msg.includes("409")) {
          errorMessage = "이미 등록된 좌석입니다.";
        } else if (msg.includes("500")) {
          errorMessage = "좌석 등록 중 서버 오류가 발생했습니다.";
        } else if (msg.trim().length > 0) {
          errorMessage = msg;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">좌석 등록</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← 대시보드로
          </button>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">공연장 좌석 등록</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  공연장 ID *
                </label>
                <input
                  type="number"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  좌석을 등록할 공연장의 ID를 입력하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  구역 ID *
                </label>
                <input
                  type="number"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  placeholder="예: 12"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  해당 공연장에 등록된 구역의 ID를 입력하세요
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  행 이름 (rowLabel) *
                </label>
                <input
                  type="text"
                  value={rowLabel}
                  onChange={(e) => setRowLabel(e.target.value)}
                  placeholder="예: A, 1CO, 7"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  좌석이 속한 행 이름을 입력하세요 (예: A, 1CO, 7 등)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  좌석 번호 *
                </label>
                <input
                  type="number"
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder="13"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  행 내 좌석 번호를 입력하세요
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "등록 중..." : "좌석 등록"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRowLabel("");
                  setSeatNumber("");
                  setError("");
                  setSuccessMessage("");
                }}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                초기화
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 사용 안내
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 공연장 ID와 구역 ID를 정확히 입력해야 합니다.</li>
              <li>• 동일한 행/좌석 조합은 중복 등록할 수 없습니다.</li>
              <li>• 좌석 번호는 행 내 숫자로 입력하세요.</li>
              <li>• 400 오류가 나면 필수 값과 형식을 다시 확인해주세요.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
