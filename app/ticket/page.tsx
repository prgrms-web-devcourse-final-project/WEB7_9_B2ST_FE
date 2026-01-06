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
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  // 캐러셀용 랜덤 공연 선택 (5개)
  const carouselPerformances = useMemo(() => {
    if (performances.length === 0) return [];
    const shuffled = [...performances]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(5, performances.length));
    return shuffled;
  }, [performances]);

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
      weekday: "short",
    });
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "";
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  };

  // 캐러셀 이동
  const handleCarouselPrev = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? carouselPerformances.length - 1 : prev - 1
    );
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) =>
      prev === carouselPerformances.length - 1 ? 0 : prev + 1
    );
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
          {/* 캐러셀 */}
          {carouselPerformances.length > 0 && !isLoading && (
            <div className="mb-12">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                {/* 캐러셀 컨테이너 */}
                <div className="relative h-96 bg-gray-900">
                  <Link
                    href={`/performance/${carouselPerformances[carouselIndex].performanceId}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={
                        carouselPerformances[carouselIndex].posterUrl ||
                        "/placeholder.jpg"
                      }
                      alt={carouselPerformances[carouselIndex].title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                  </Link>

                  {/* 좌측 화살표 */}
                  <button
                    onClick={handleCarouselPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* 우측 화살표 */}
                  <button
                    onClick={handleCarouselNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white rounded-full p-3 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* 포스터 정보 (좌측 하단) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <Link
                      href={`/performance/${carouselPerformances[carouselIndex].performanceId}`}
                      className="block group"
                    >
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-gray-300 transition-colors line-clamp-2">
                        {carouselPerformances[carouselIndex].title}
                      </h2>
                      <p className="text-gray-300 text-sm mb-3">
                        {carouselPerformances[carouselIndex].venueName}
                      </p>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>
                          {formatDate(
                            carouselPerformances[carouselIndex].startDate
                          )}
                        </span>
                        <span>~</span>
                        <span>
                          {formatDate(
                            carouselPerformances[carouselIndex].endDate
                          )}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* 인디케이터 (하단 중앙) */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
                  {carouselPerformances.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === carouselIndex
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPerformances.map((performance) => (
                <Link
                  key={performance.performanceId}
                  href={`/performance/${performance.performanceId}`}
                  className="group block"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200">
                    {/* 이미지 영역 - 더 짧게 */}
                    <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                      {performance.posterUrl ? (
                        <img
                          src={performance.posterUrl}
                          alt={performance.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <svg
                            className="w-16 h-16 text-gray-400"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    {/* 콘텐츠 영역 */}
                    <div className="p-5">
                      {/* 카테고리 */}
                      {performance.category && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                            {performance.category}
                          </span>
                        </div>
                      )}

                      {/* 제목 */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {performance.title}
                      </h3>

                      {/* 장소 */}
                      <div className="flex items-start mb-3 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
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
                        <span>{performance.venueName}</span>
                      </div>

                      {/* 날짜 정보 */}
                      <div className="space-y-2 text-sm">
                        {/* 사전 등록 오픈일 */}
                        <div className="flex items-start">
                          <svg
                            className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">
                              사전 등록 오픈일
                            </p>
                            <p className="text-gray-700 font-medium">
                              {performance.startDate
                                ? formatDate(performance.startDate)
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* 티켓 오픈일 */}
                        <div className="flex items-start">
                          <svg
                            className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z"
                            />
                          </svg>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-0.5">
                              티켓 오픈일
                            </p>
                            <p className="text-gray-700 font-medium">
                              {performance.endDate
                                ? formatDate(performance.endDate)
                                : "-"}
                            </p>
                          </div>
                        </div>
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
