"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Header from "@/components/Header";
import { tradeApi, type Ticket } from "@/lib/api/trade";
import {
  performanceApi,
  type PerformanceDetailRes,
} from "@/lib/api/performance";
import { useAuth } from "@/contexts/AuthContext";

function TradeRegisterStep2Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tradeType = (searchParams.get("type") || "EXCHANGE") as
    | "EXCHANGE"
    | "TRANSFER";
  const performanceIdParam = searchParams.get("performanceId");
  const performanceId = performanceIdParam ? Number(performanceIdParam) : null;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(
    null
  );
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);
  const [isFetchingTickets, setIsFetchingTickets] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const queryString = searchParams.toString();
      const from = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
    }
  }, [authLoading, isAuthenticated, pathname, router, searchParams]);

  // 공연 정보 조회
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!performanceId) return;

    const fetchPerformance = async () => {
      try {
        const response = await performanceApi.getPerformance(performanceId);
        if (response.data) {
          setPerformance(response.data);
        }
      } catch (err) {
        console.error("공연 정보 조회 실패:", err);
      }
    };

    fetchPerformance();
  }, [isAuthenticated, performanceId]);

  // 내 티켓 목록 가져오기
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchMyTickets = async () => {
      setIsFetchingTickets(true);
      try {
        const response = await tradeApi.getMyTickets();
        if (response.data) {
          // ISSUED 상태인 티켓만 필터링
          const availableTickets = response.data.filter(
            (ticket) => ticket.status === "ISSUED"
          );
          setMyTickets(availableTickets);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("티켓 목록을 불러오는데 실패했습니다.");
        }
      } finally {
        setIsFetchingTickets(false);
      }
    };

    fetchMyTickets();
  }, [isAuthenticated]);

  // 선택한 공연의 티켓만 필터링
  useEffect(() => {
    if (!isAuthenticated) return;
    if (performanceId && myTickets.length > 0) {
      const filtered = myTickets.filter(
        (ticket) => ticket.performanceId === performanceId
      );
      setFilteredTickets(filtered);
    } else {
      setFilteredTickets([]);
    }
  }, [isAuthenticated, performanceId, myTickets]);

  const handleTicketToggle = (ticketId: number | undefined) => {
    if (!ticketId) return;

    if (tradeType === "EXCHANGE") {
      // 교환은 1개만 선택 가능
      setSelectedTicketIds([ticketId]);
    } else {
      // 양도는 여러 개 선택 가능
      setSelectedTicketIds((prev) =>
        prev.includes(ticketId)
          ? prev.filter((id) => id !== ticketId)
          : [...prev, ticketId]
      );
    }
  };

  const handleNext = () => {
    if (selectedTicketIds.length === 0) {
      setError("티켓을 선택해주세요.");
      return;
    }

    if (tradeType === "EXCHANGE" && selectedTicketIds.length !== 1) {
      setError("교환은 1개의 티켓만 선택 가능합니다.");
      return;
    }

    router.push(
      `/trade/register/step3?type=${tradeType}&performanceId=${performanceId}&ticketIds=${selectedTicketIds.join(
        ","
      )}`
    );
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 font-medium text-green-600">
                  공연 선택
                </span>
              </div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium text-green-600">
                  내 티켓 선택
                </span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 font-medium text-gray-500">
                  최종 확인
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              내 티켓 선택
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Selected Performance Info */}
              {performance && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    선택한 공연
                  </h3>
                  <div className="flex items-start gap-3">
                    {performance.posterUrl && (
                      <img
                        src={performance.posterUrl}
                        alt={performance.title}
                        className="w-20 h-28 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        {performance.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {performance.venue?.name || "장소 정보 없음"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Selection */}
              {isFetchingTickets ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">티켓 목록을 불러오는 중...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    선택한 공연에 대한 등록 가능한 티켓이 없습니다.
                  </p>
                  <Link
                    href="/my-page"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    마이페이지에서 확인하기
                  </Link>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        내 티켓 선택
                      </label>
                      {tradeType === "EXCHANGE" && (
                        <span className="text-xs text-gray-500">
                          교환은 1장만 선택 가능합니다
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                      {filteredTickets.map((ticket) => {
                        const isSelected =
                          ticket.ticketId !== undefined &&
                          selectedTicketIds.includes(ticket.ticketId);

                        return (
                          <button
                            key={ticket.ticketId}
                            onClick={() => handleTicketToggle(ticket.ticketId)}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                              isSelected
                                ? "border-green-600 bg-green-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <input
                                    type={
                                      tradeType === "EXCHANGE"
                                        ? "radio"
                                        : "checkbox"
                                    }
                                    checked={isSelected}
                                    onChange={() =>
                                      handleTicketToggle(ticket.ticketId)
                                    }
                                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                                  />
                                  <span className="font-medium text-gray-900">
                                    {ticket.sectionName || "구역 정보 없음"}구역{" "}
                                    {ticket.rowLabel || ""}열{" "}
                                    {ticket.seatNumber || ""}번
                                  </span>
                                </div>
                                {performance && (
                                  <p className="text-sm text-gray-600 ml-6">
                                    {performance.title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      선택된 티켓: {selectedTicketIds.length}개
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Link
                      href="/trade/register/step1"
                      className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold text-center hover:bg-gray-50 transition-colors"
                    >
                      이전
                    </Link>
                    <button
                      onClick={handleNext}
                      disabled={selectedTicketIds.length === 0}
                      className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradeRegisterStep2() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-400">로딩 중...</div>
            </div>
          </div>
        </div>
      }
    >
      <TradeRegisterStep2Content />
    </Suspense>
  );
}
