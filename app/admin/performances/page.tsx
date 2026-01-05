"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  performanceApi,
  type PerformanceDetailRes,
} from "@/lib/api/performance";

export default function AdminPerformancesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [venueId, setVenueId] = useState("1");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const loadPerformances = async () => {
    setIsLoadingList(true);
    try {
      const response = await performanceApi.getAdminPerformances({
        size: 50,
      });
      if (response.data?.content) {
        setList(response.data.content);
      }
    } catch (err) {
      console.error("공연 목록 로드 실패:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoadingList(true);
    try {
      const response = await performanceApi.searchAdminPerformances({
        keyword: searchKeyword.trim(),
        size: 50,
      });
      if (response.data?.content) {
        setList(response.data.content);
      }
    } catch (err) {
      console.error("공연 검색 실패:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    } else {
      loadPerformances();
    }
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await performanceApi.createPerformance({
        venueId: parseInt(venueId),
        title,
        category,
        posterUrl,
        description,
        startDate: `${startDate}T00:00:00`,
        endDate: `${endDate}T23:59:59`,
      });

      if (response.data) {
        setTitle("");
        setVenueId("1");
        setCategory("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setPosterUrl("");
        alert("공연이 생성되었습니다.");
        await loadPerformances();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "공연 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">공연 관리</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← 대시보드로
          </button>
        </div>

        <section className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">공연 생성</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">제목 *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded border px-3 py-2 border-gray-300"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">카테고리 *</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="뮤지컬, 콘서트 등"
                className="mt-1 block w-full rounded border px-3 py-2 border-gray-300"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">공연장 ID *</label>
              <input
                type="number"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="mt-1 block w-full rounded border px-3 py-2 border-gray-300"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded border px-3 py-2 border-gray-300"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium">시작일 *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded border px-3 py-2 border-gray-300"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">종료일 *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded border px-3 py-2 border-gray-300"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">포스터 URL *</label>
              <input
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://example.com/poster.jpg"
                className="mt-1 block w-full rounded border px-3 py-2 border-gray-300"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {isLoading ? "생성 중..." : "생성"}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">생성된 공연 목록</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="제목 또는 카테고리 검색"
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                검색
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword("");
                  loadPerformances();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                전체
              </button>
            </form>
          </div>
          {isLoadingList ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : list.length === 0 ? (
            <div className="text-sm text-gray-500">생성된 공연이 없습니다.</div>
          ) : (
            <ul className="space-y-3">
              {list.map((p) => (
                <li
                  key={p.performanceId}
                  onClick={() =>
                    router.push(`/admin/performances/${p.performanceId}`)
                  }
                  className="p-3 border rounded flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden rounded">
                    {p.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.posterUrl}
                        alt={p.title || "공연"}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-500">{p.venueName}</div>
                    <div className="text-xs text-gray-400">{p.category}</div>
                    <div className="text-sm text-gray-400">
                      {p.startDate} ~ {p.endDate}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
