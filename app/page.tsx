"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { performanceApi, type PerformanceListRes } from "@/lib/api/performance";
import Header from "@/components/Header";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"ticket" | "trade">("ticket");
  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [bookingType, setBookingType] = useState<
    "general" | "lottery" | "prereservation"
  >("general");
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
      if (activeTab !== "ticket") return;

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
  }, [activeTab]);

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

  const bookingTypeMeta: Record<
    typeof bookingType,
    { title: string; desc: string; badge: string }
  > = {
    general: {
      title: "일반 예매",
      desc: "즉시 결제 기반의 일반 예매 흐름입니다. 좌석 선택 → 결제까지 한 번에 진행됩니다.",
      badge: "실시간 예매",
    },
    lottery: {
      title: "추첨 예매",
      desc: "응모 후 당첨 시 결제하는 방식입니다. 한 번에 최대 4매까지 응모할 수 있습니다.",
      badge: "추첨 방식",
    },
    prereservation: {
      title: "사전신청 예매",
      desc: "선호 구역/좌석을 사전 신청 후 배정받는 방식입니다. 지정 회차별로 신청 가능합니다.",
      badge: "사전 신청",
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showCategoryTabs={activeTab === "ticket"}
        activeCategory={activeCategory}
        categories={categories}
        onCategoryChange={setActiveCategory}
      />

      {/* 서비스 소개 섹션 (랜딩) */}
      <section
        id="service"
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-300 mb-4">
              Doncrytt Ticket Platform
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              일반 예매 · 추첨 예매 · 사전신청을 한 곳에서
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              비로그인 상태에서도 공연을 둘러보고, 필요한 순간에 로그인하여
              예매·양도·교환을 진행하세요. 당첨형(추첨), 선호구역형(사전신청),
              실시간 일반 예매 흐름을 모두 지원합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#booking-types"
                className="px-5 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold shadow-lg transition-colors"
              >
                예매 타입 살펴보기
              </Link>
              <Link
                href={isAuthenticated ? "/trade" : "/login?from=/trade"}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold border border-white/20 transition-colors"
              >
                {isAuthenticated ? "양도/교환 바로가기" : "로그인하고 시작하기"}
              </Link>
            </div>
          </div>

          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 grid gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="text-sm text-gray-500">누구나 탐색</p>
                <p className="font-semibold">
                  서비스 소개 & 티켓 목록은 비로그인 접근 가능
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="text-sm text-gray-500">필요 시 로그인</p>
                <p className="font-semibold">
                  양도/교환, 마이페이지 접근 시 로그인 요구
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="text-sm text-gray-500">이전 페이지로 복귀</p>
                <p className="font-semibold">
                  로그인 완료 후 진입하려던 화면으로 복귀
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 예매 타입 분리 섹션 */}
      <section
        id="booking-types"
        className="bg-white border-b border-gray-100 py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <p className="text-sm font-semibold text-red-600 mb-2">
                예매 타입 선택
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                일반 · 추첨 · 사전신청을 구분해서 안내합니다
              </h2>
              <p className="text-gray-600">
                원하는 예매 방식을 선택하면 안내와 추천 경로를 보여드립니다.
                (목록은 동일한 공연 리스트를 노출합니다.)
              </p>
            </div>
            <div className="flex gap-2">
              {(
                [
                  { key: "general", label: "일반 예매" },
                  { key: "lottery", label: "추첨 예매" },
                  { key: "prereservation", label: "사전신청 예매" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setBookingType(key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    bookingType === key
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(
              [
                {
                  key: "general",
                  title: "일반 예매",
                  desc: "좌석 선택 후 즉시 결제하는 표준 예매 흐름",
                  chip: "실시간",
                  action: "공연 둘러보기",
                  href: "/",
                },
                {
                  key: "lottery",
                  title: "추첨 예매",
                  desc: "응모 후 당첨 시 결제 • 응모당 최대 4매",
                  chip: "당첨 시 결제",
                  action: "추첨 응모 가이드",
                  href: "/performance/guide?type=lottery",
                },
                {
                  key: "prereservation",
                  title: "사전신청 예매",
                  desc: "선호 구역/좌석을 신청하고 배정받는 방식",
                  chip: "신청 기반",
                  action: "사전신청 안내",
                  href: "/performance/guide?type=prereservation",
                },
              ] as const
            ).map((item) => (
              <div
                key={item.key}
                className={`p-6 rounded-xl border transition-all ${
                  bookingType === item.key
                    ? "border-red-500 shadow-lg shadow-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {item.chip}
                  </span>
                  {bookingType === item.key && (
                    <span className="text-xs font-semibold text-red-600">
                      선택됨
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  {item.action}
                  <svg
                    className="w-4 h-4"
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
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Banner */}
      {activeTab === "ticket" && performances.length > 0 && (
        <section className="relative bg-gradient-to-br from-pink-50 via-white to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Content */}
                <div className="p-12 flex flex-col justify-center">
                  {performances[0].startDate && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-red-600">
                        {new Date(performances[0].startDate).getFullYear()}
                      </span>
                    </div>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {performances[0].title}
                  </h1>
                  {performances[0].category && (
                    <p className="text-xl text-gray-600 mb-2">
                      {performances[0].category}
                    </p>
                  )}
                  <div className="space-y-2 text-gray-500 mb-6">
                    {performances[0].venueName && (
                      <p className="text-sm">{performances[0].venueName}</p>
                    )}
                    {(performances[0].startDate || performances[0].endDate) && (
                      <p className="text-sm">
                        {formatDateRange(
                          performances[0].startDate,
                          performances[0].endDate
                        )}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/performance/${performances[0].performanceId}`}
                    className="inline-block px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    예매하기
                  </Link>
                </div>

                {/* Right: Image */}
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center min-h-[400px] relative overflow-hidden">
                  {performances[0].posterUrl ? (
                    <img
                      src={performances[0].posterUrl}
                      alt={performances[0].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-pink-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm">공연 포스터</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Performance Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
              {bookingTypeMeta[bookingType].badge}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              {bookingTypeMeta[bookingType].title}
            </h2>
          </div>
          <p className="text-gray-600 text-sm">
            {bookingTypeMeta[bookingType].desc}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">공연 목록을 불러오는 중...</div>
          </div>
        ) : filteredPerformances.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">표시할 공연이 없습니다.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredPerformances.map((performance) => (
              <Link
                key={performance.performanceId}
                href={`/performance/${performance.performanceId}`}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {performance.posterUrl ? (
                      <img
                        src={performance.posterUrl}
                        alt={performance.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                      </div>
                    )}
                    {performance.category === "뮤지컬" && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                        단독판매
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {performance.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {performance.venueName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateRange(
                        performance.startDate,
                        performance.endDate
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
