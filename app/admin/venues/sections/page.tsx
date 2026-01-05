"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type VenueSection } from "@/lib/api/admin";

export default function AdminVenueSectionsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [venueId, setVenueId] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!venueId || !sectionName.trim()) {
      setError("모든 필드를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await adminApi.createVenueSection(parseInt(venueId), {
        sectionName: sectionName.trim(),
      });

      if (response.data) {
        setSuccessMessage(
          `구역이 성공적으로 등록되었습니다. (구역 ID: ${response.data.sectionId})`
        );
        setSectionName("");
        // venueId는 유지하여 같은 공연장에 여러 구역을 연속으로 등록할 수 있도록 함
      }
    } catch (err: any) {
      console.error("구역 등록 실패:", err);

      let errorMessage = "구역 등록에 실패했습니다.";
      if (err instanceof Error) {
        if (err.message.includes("404")) {
          errorMessage = "공연장 정보가 올바르지 않습니다.";
        } else if (err.message.includes("409")) {
          errorMessage = "이미 등록된 구역입니다.";
        } else if (err.message.includes("500")) {
          errorMessage = "구역 등록 중 서버 오류가 발생했습니다.";
        } else {
          errorMessage = err.message;
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
          <h1 className="text-2xl font-bold">구역 등록</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← 대시보드로
          </button>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">공연장 구역 등록</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                구역을 등록할 공연장의 ID를 입력하세요
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                구역 이름 *
              </label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="예: VIP, A, B, 1층, 2층 등"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                구역 이름을 입력하세요 (예: VIP, A, B, 1층, 2층 등)
              </p>
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
                {isLoading ? "등록 중..." : "구역 등록"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSectionName("");
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
              <li>• 공연장 ID는 공연 생성 시 사용한 공연장의 ID입니다</li>
              <li>• 같은 공연장에 여러 구역을 등록할 수 있습니다</li>
              <li>• 구역 이름은 중복될 수 없습니다</li>
              <li>• 등록된 구역은 좌석 배치에 사용됩니다</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
