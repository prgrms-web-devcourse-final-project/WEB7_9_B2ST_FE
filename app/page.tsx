"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { performanceApi, type PerformanceListRes } from "@/lib/api/performance";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<"ticket" | "trade">("ticket");
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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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

      {/* Ticket Tab Content */}
      {activeTab === "ticket" && (
        <>
          {/* Hero Banner */}
          {performances.length > 0 && (
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
                        {(performances[0].startDate ||
                          performances[0].endDate) && (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                공연 목록
              </h2>
              <p className="text-gray-600 text-sm">
                원하는 공연을 선택하고 예매하세요.
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
        </>
      )}

      {/* Service Intro Content */}
      {activeTab !== "ticket" && (
        <>
          {/* Hero Section */}
          <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center overflow-hidden pt-20">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full text-sm font-semibold text-red-300 mb-4">
                    새로운 예매 경험
                  </span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  티켓팅
                  <br />
                  이제 울지 마세요
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  모두에게 공정한 예매 서비스. 일반 예매, 추첨, 사전신청을 한
                  곳에서 관리하세요.
                  <br />
                  비로그인으로도 공연을 둘러보고, 필요할 때만 로그인하세요.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/search"
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                  >
                    예매하러 가기
                  </Link>
                  <button
                    onClick={() => scrollToSection("service")}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/30 transition-colors"
                  >
                    서비스 소개
                  </button>
                </div>
              </div>

              {/* Logo/Visual */}
              <div className="relative hidden lg:flex items-center justify-center">
                <div
                  className="w-64 h-64 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform"
                  style={{
                    transform: `translateY(${scrollY * 0.3}px)`,
                  }}
                >
                  <div className="text-8xl font-bold text-white">TT</div>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <svg
                className="w-6 h-6 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </section>

          {/* Service Introduction Section */}
          <section id="service" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  서비스 소개
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  우리의 서비스는 모든 사용자를 위해 공정하고 투명한 티켓팅
                  경험을 제공합니다.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Card 1 */}
                <div
                  className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white transform hover:-translate-y-2 transition-transform"
                  style={{
                    opacity: 1 - scrollY / 1000,
                  }}
                >
                  <div className="w-14 h-14 bg-red-500/20 rounded-lg flex items-center justify-center mb-6 border border-red-500/30">
                    <svg
                      className="w-7 h-7 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">공정한 티켓팅</h3>
                  <p className="text-gray-300">
                    모든 사용자에게 동등한 기회를 제공합니다. 일반 예매는 실시간
                    판매, 추첨 예매는 공정한 추첨, 사전신청은 선호 구역 신청으로
                    공정성을 보장합니다.
                  </p>
                </div>

                {/* Card 2 */}
                <div
                  className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white transform hover:-translate-y-2 transition-transform"
                  style={{
                    opacity: 1 - scrollY / 1000,
                  }}
                >
                  <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 border border-blue-500/30">
                    <svg
                      className="w-7 h-7 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    교환 · 양도 서비스
                  </h3>
                  <p className="text-gray-300">
                    예매된 티켓을 안전하게 교환하고 양도할 수 있습니다. 투명한
                    수수료 정책과 사용자 보호를 통해 신뢰할 수 있는 거래 환경을
                    제공합니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Booking Methods Section */}
          <section id="booking-methods" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  예매 방식 안내
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  당신의 스타일에 맞는 예매 방식을 선택하세요
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* General Booking */}
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-red-600">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    일반 예매
                  </h3>
                  <p className="text-gray-600 mb-4">
                    좌석을 선택하고 즉시 결제하는 가장 빠른 예매 방식입니다.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>실시간 좌석 선택</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>즉시 결제 시스템</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>빠른 예매 확정</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => scrollToSection("service")}
                    className="w-full px-4 py-2 border border-red-600 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    자세히 보기
                  </button>
                </div>

                {/* Lottery Booking */}
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-blue-600">🎲</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    추첨 예매
                  </h3>
                  <p className="text-gray-600 mb-4">
                    응모하고 당첨되면 결제하는 공정한 예매 방식입니다.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>최대 4매 응모 가능</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>공정한 당첨 시스템</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>당첨 후 결제</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => scrollToSection("service")}
                    className="w-full px-4 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    자세히 보기
                  </button>
                </div>

                {/* Pre-reservation */}
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-green-600">
                      📍
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    구역별 사전 신청
                  </h3>
                  <p className="text-gray-600 mb-4">
                    선호 구역을 신청하고 배정받는 예약형 예매입니다.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>구역 선호도 신청</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>좌석 자동 배정</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>배정 후 결제</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => scrollToSection("service")}
                    className="w-full px-4 py-2 border border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold mb-6">지금 시작하세요</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                공정하고 투명한 티켓팅 서비스로 원하는 공연의 티켓을 확보하세요.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/search"
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                  공연 둘러보기
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/30 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-slate-950 text-gray-400 py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h4 className="text-white font-bold mb-4">TT</h4>
                  <p className="text-sm">
                    모두에게 공정한 티켓팅 서비스를 제공합니다.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-4">서비스</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/search" className="hover:text-white">
                        공연 찾기
                      </Link>
                    </li>
                    <li>
                      <Link href="/trade" className="hover:text-white">
                        티켓 양도
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-4">고객지원</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#" className="hover:text-white">
                        공지사항
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-white">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-4">법적사항</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#" className="hover:text-white">
                        이용약관
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-white">
                        개인정보처리방침
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-8">
                <p className="text-sm text-center">
                  © 2024 TT. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
