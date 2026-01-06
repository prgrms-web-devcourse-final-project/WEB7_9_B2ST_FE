"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import { performanceApi, type PerformanceListRes } from "@/lib/api/performance";

export default function TicketPage() {
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [performances, setPerformances] = useState<PerformanceListRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = [
    "전체",
    "콘서트",
    "뮤지컬",
    "클래식",
    "연극",
    "전시/행사",
  ];

  // 공연 목록 조회
  useEffect(() => {
    const fetchPerformances = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await performanceApi.getPerformances({
          page: 0,
          size: 20,
          sort: ["createdAt,desc"],
        });

        if (response.data?.content) {
          setPerformances(response.data.content);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("공연 목록을 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformances();
  }, []);

  const filteredPerformances = useMemo(() => {
    if (activeCategory === "전체") return performances;
    return performances.filter((p) => p.category === activeCategory);
  }, [activeCategory, performances]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "";
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab="ticket"
        onTabChange={() => {}}
        showCategoryTabs={true}
        activeCategory={activeCategory}
        categories={categories}
        onCategoryChange={setActiveCategory}
      />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">공연 목록</h2>
            <p className="text-gray-600">원하는 공연을 선택하고 예매하세요</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600 font-medium">
                  공연 목록을 불러오는 중...
                </p>
              </div>
            </div>
          ) : filteredPerformances.length === 0 ? (
            <div className="flex justify-center items-center py-32">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">
                  표시할 공연이 없습니다
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredPerformances.map((performance) => (
                <Link
                  key={performance.performanceId}
                  href={`/performance/${performance.performanceId}`}
                  className="group block"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-[3/4.2] bg-gray-100 relative overflow-hidden">
                      {performance.posterUrl ? (
                        <img
                          src={performance.posterUrl}
                          alt={performance.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <svg
                            className="w-20 h-20 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z"
                            />
                          </svg>
                        </div>
                      )}
                      {performance.category === "뮤지컬" && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          HOT
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                        {performance.title}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 flex items-center">
                          <svg
                            className="w-3 h-3 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {performance.venueName}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <svg
                            className="w-3 h-3 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDateRange(
                            performance.startDate,
                            performance.endDate
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
