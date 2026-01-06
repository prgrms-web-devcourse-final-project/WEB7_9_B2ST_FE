"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { performanceApi, type PerformanceListRes } from "@/lib/api/performance";

interface HeaderProps {
  activeTab?: "ticket" | "trade";
  onTabChange?: (tab: "ticket" | "trade") => void;
  showCategoryTabs?: boolean;
  activeCategory?: string;
  categories?: string[];
  onCategoryChange?: (category: string) => void;
}

export default function Header({
  activeTab,
  onTabChange,
  showCategoryTabs = false,
  activeCategory,
  categories = [],
  onCategoryChange,
}: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PerformanceListRes[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 검색어 변경 시 debounce 검색
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await performanceApi.searchPerformances(
          searchQuery.trim(),
          {
            page: 0,
            size: 5, // 드롭다운에는 최대 5개만 표시
            sort: ["createdAt,desc"],
          }
        );

        if (response.data?.content) {
          setSearchResults(response.data.content);
          setShowDropdown(true);
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      } catch (err) {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = (performanceId: number) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/performance/${performanceId}`);
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const end = new Date(endDate).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return `${start} ~ ${end}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/doncrytt-logo5.png"
              alt="doncrytt 로고"
              width={200}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="공연, 아티스트 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                className="w-full px-5 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isSearching ? (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </button>
            </form>

            {/* 검색 결과 드롭다운 */}
            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    검색 중...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((performance) => (
                      <button
                        key={performance.performanceId}
                        onClick={() =>
                          handleResultClick(performance.performanceId!)
                        }
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded overflow-hidden">
                          {performance.posterUrl ? (
                            <img
                              src={performance.posterUrl}
                              alt={performance.title || "Performance"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg
                                className="w-8 h-8"
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
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
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
                      </button>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleSearch}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-center font-medium"
                      >
                        전체 검색 결과 보기
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/#service"
              className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium text-sm transition-colors"
            >
              서비스 소개
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/my-page"
                  className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium text-sm transition-colors"
                >
                  마이페이지
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {(activeTab !== undefined || showCategoryTabs) && (
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1">
              {activeTab !== undefined && (
                <>
                  <Link
                    href="/"
                    className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                      activeTab === "ticket"
                        ? "text-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    티켓
                    {activeTab === "ticket" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
                    )}
                  </Link>
                  <Link
                    href="/trade"
                    className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                      activeTab === "trade"
                        ? "text-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    양도/교환
                    {activeTab === "trade" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
                    )}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs (티켓 탭일 때만) */}
      {showCategoryTabs && activeTab === "ticket" && categories.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange?.(category)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeCategory === category
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
