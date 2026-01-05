"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, type LoginLog } from "@/lib/api/admin";

export default function AdminLoginLogsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilters, setLogFilters] = useState({
    email: "",
    clientIp: "",
    success: undefined as boolean | undefined,
    hours: 24,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadLoginLogs = async (page: number = 0) => {
    setIsLoadingLogs(true);
    try {
      const response = await adminApi.getLoginLogs({
        ...logFilters,
        email: logFilters.email || undefined,
        clientIp: logFilters.clientIp || undefined,
        page,
        size: 20,
      });
      if (response.data) {
        setLoginLogs(response.data.content);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("로그인 로그 조회 실패:", err);
      alert("로그인 로그 조회에 실패했습니다.");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleLogSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLoginLogs(0);
  };

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    } else {
      loadLoginLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">로그인 로그</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← 대시보드로
          </button>
        </div>

        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">로그인 로그 조회</h2>

          {/* 필터 */}
          <form
            onSubmit={handleLogSearch}
            className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">이메일</label>
                <input
                  type="text"
                  value={logFilters.email}
                  onChange={(e) =>
                    setLogFilters({ ...logFilters, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  IP 주소
                </label>
                <input
                  type="text"
                  value={logFilters.clientIp}
                  onChange={(e) =>
                    setLogFilters({ ...logFilters, clientIp: e.target.value })
                  }
                  placeholder="203.0.113.42"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  성공 여부
                </label>
                <select
                  value={
                    logFilters.success === undefined
                      ? ""
                      : String(logFilters.success)
                  }
                  onChange={(e) =>
                    setLogFilters({
                      ...logFilters,
                      success:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">전체</option>
                  <option value="true">성공</option>
                  <option value="false">실패</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  시간 범위 (시간)
                </label>
                <input
                  type="number"
                  value={logFilters.hours}
                  onChange={(e) =>
                    setLogFilters({
                      ...logFilters,
                      hours: parseInt(e.target.value) || 24,
                    })
                  }
                  min="1"
                  placeholder="24"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                조회
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogFilters({
                    email: "",
                    clientIp: "",
                    success: undefined,
                    hours: 24,
                  });
                  loadLoginLogs(0);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                초기화
              </button>
            </div>
          </form>

          {/* 로그 목록 */}
          {isLoadingLogs ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : loginLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              조회된 로그가 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        이메일
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        IP 주소
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        결과
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        실패 사유
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        시도 시각
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{log.id}</td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {log.email}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {log.clientIp}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.success
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {log.success ? "성공" : "실패"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {log.failReason ? (
                            <span className="text-red-600 text-xs">
                              {log.failReason === "INVALID_PASSWORD"
                                ? "잘못된 비밀번호"
                                : log.failReason === "INVALID_EMAIL"
                                ? "잘못된 이메일"
                                : log.failReason === "ACCOUNT_LOCKED"
                                ? "계정 잠김"
                                : log.failReason}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(log.attemptedAt).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => loadLoginLogs(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  <span className="px-3 py-1">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => loadLoginLogs(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
