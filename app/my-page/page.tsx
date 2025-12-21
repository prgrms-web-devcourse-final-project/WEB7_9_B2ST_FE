"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProfileTab from "./ProfileTab";
import { reservationApi, type ReservationDetailRes } from "@/lib/api/reservation";
import { lotteryApi, type LotteryEntry } from "@/lib/api/lottery";
import { tradeApi, type Ticket, type TradeRequest, type Trade } from "@/lib/api/trade";
import { mypageApi } from "@/lib/api/mypage";

export default function MyPage() {
  // 초기 상태는 항상 동일하게 설정 (서버와 클라이언트 일치)
  const [activeTab, setActiveTab] = useState<
    "reservations" | "profile" | "trades" | "lottery" | "tickets"
  >("reservations");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"bookingDate" | "viewingDate">("bookingDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [reservations, setReservations] = useState<ReservationDetailRes[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState("");
  const [lotteryEntries, setLotteryEntries] = useState<LotteryEntry[]>([]);
  const [isLoadingLottery, setIsLoadingLottery] = useState(false);
  const [lotteryError, setLotteryError] = useState("");
  const [lotteryCurrentPage, setLotteryCurrentPage] = useState(0);
  const [lotteryHasMore, setLotteryHasMore] = useState(true);
  const [isLoadingMoreLottery, setIsLoadingMoreLottery] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState("");

  // 교환/양도 관련 상태
  const [tradesSubTab, setTradesSubTab] = useState<
    "my-trades" | "received-requests" | "sent-requests"
  >("my-trades");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [myTrades, setMyTrades] = useState<Trade[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<TradeRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<TradeRequest[]>([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(false);
  const [tradesError, setTradesError] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // 클라이언트에서만 세션 스토리지에서 탭 상태 복원
  useEffect(() => {
    if (typeof window !== "undefined" && !isHydrated) {
      const savedTab = sessionStorage.getItem("mypage-active-tab");
      if (savedTab && ["reservations", "profile", "trades", "lottery", "tickets"].includes(savedTab)) {
        setActiveTab(savedTab as "reservations" | "profile" | "trades" | "lottery" | "tickets");
      }

      const savedTradesSubTab = sessionStorage.getItem("mypage-trades-sub-tab");
      if (savedTradesSubTab && ["my-trades", "received-requests", "sent-requests"].includes(savedTradesSubTab)) {
        setTradesSubTab(savedTradesSubTab as "my-trades" | "received-requests" | "sent-requests");
      }

      setIsHydrated(true);
    }
  }, [isHydrated]);

  // 탭 상태를 세션 스토리지에 저장
  useEffect(() => {
    if (typeof window !== "undefined" && isHydrated) {
      sessionStorage.setItem("mypage-active-tab", activeTab);
    }
  }, [activeTab, isHydrated]);

  useEffect(() => {
    if (typeof window !== "undefined" && isHydrated) {
      sessionStorage.setItem("mypage-trades-sub-tab", tradesSubTab);
    }
  }, [tradesSubTab, isHydrated]);

  // 예매내역 조회
  useEffect(() => {
    if (activeTab === "reservations") {
      const fetchReservations = async () => {
        setIsLoadingReservations(true);
        setReservationsError("");

        try {
          const response = await reservationApi.getMyReservations();
          if (response.data) {
            setReservations(response.data);
          }
        } catch (err) {
          if (err instanceof Error) {
            setReservationsError(err.message);
          } else {
            setReservationsError("예매내역을 불러오는데 실패했습니다.");
          }
        } finally {
          setIsLoadingReservations(false);
        }
      };

      fetchReservations();
    }
  }, [activeTab]);

  // 추첨 응모 내역 조회 (초기 로드)
  useEffect(() => {
    if (activeTab === "lottery") {
      // 탭 전환 시 초기화
      setLotteryEntries([]);
      setLotteryCurrentPage(0);
      setLotteryHasMore(true);

      const fetchLotteryEntries = async () => {
        setIsLoadingLottery(true);
        setLotteryError("");

        try {
          const response = await lotteryApi.getMyLotteryEntries(0);
          if (response.data) {
            setLotteryEntries(response.data);
            // 10개 미만이면 더 이상 데이터가 없음
            setLotteryHasMore(response.data.length >= 10);
          }
        } catch (err) {
          if (err instanceof Error) {
            setLotteryError(err.message);
          } else {
            setLotteryError("응모 내역을 불러오는데 실패했습니다.");
          }
        } finally {
          setIsLoadingLottery(false);
        }
      };

      fetchLotteryEntries();
    }
  }, [activeTab]);

  // 더보기 버튼 클릭 핸들러
  const handleLoadMoreLottery = async () => {
    if (isLoadingMoreLottery || !lotteryHasMore) return;

    const nextPage = lotteryCurrentPage + 1;
    setIsLoadingMoreLottery(true);
    setLotteryError("");

    try {
      const response = await lotteryApi.getMyLotteryEntries(nextPage);
      if (response.data) {
        // 기존 데이터에 추가
        setLotteryEntries((prev) => [...prev, ...response.data]);
        setLotteryCurrentPage(nextPage);
        // 10개 미만이면 더 이상 데이터가 없음
        setLotteryHasMore(response.data.length >= 10);
      }
    } catch (err) {
      if (err instanceof Error) {
        setLotteryError(err.message);
      } else {
        setLotteryError("응모 내역을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoadingMoreLottery(false);
    }
  };

  // 내 티켓 목록 조회
  useEffect(() => {
    if (activeTab === "tickets") {
      const fetchTickets = async () => {
        setIsLoadingTickets(true);
        setTicketsError("");

        try {
          const response = await tradeApi.getMyTickets();
          if (response.data) {
            setTickets(response.data);
          }
        } catch (err) {
          if (err instanceof Error) {
            setTicketsError(err.message);
          } else {
            setTicketsError("티켓 목록을 불러오는데 실패했습니다.");
          }
        } finally {
          setIsLoadingTickets(false);
        }
      };

      fetchTickets();
    }
  }, [activeTab]);

  // 현재 사용자 ID 조회
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await mypageApi.getMyInfo();
        if (response.data?.memberId) {
          setCurrentUserId(response.data.memberId);
        }
      } catch (err) {
        console.error("사용자 정보 조회 실패:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // 교환/양도 관련 데이터 조회
  useEffect(() => {
    if (activeTab === "trades" && currentUserId) {
      if (tradesSubTab === "my-trades") {
        fetchMyTrades();
      } else if (tradesSubTab === "received-requests") {
        fetchReceivedRequests();
      } else if (tradesSubTab === "sent-requests") {
        fetchSentRequests();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tradesSubTab, currentUserId]);

  const fetchMyTrades = async () => {
    if (!currentUserId) return;

    setIsLoadingTrades(true);
    setTradesError("");

    try {
      const response = await tradeApi.getTradeList({
        status: "ACTIVE",
        page: 0,
        size: 100,
      });

      if (response.data?.content) {
        const myRegisteredTrades = response.data.content.filter(
          (trade: Trade) => trade.memberId === currentUserId,
        );
        setMyTrades(myRegisteredTrades);
      }
    } catch (err) {
      if (err instanceof Error) {
        setTradesError(err.message);
      } else {
        setTradesError("거래 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoadingTrades(false);
    }
  };

  const fetchReceivedRequests = async () => {
    if (!currentUserId) return;

    setIsLoadingTrades(true);
    setTradesError("");

    try {
      const myTradesResponse = await tradeApi.getTradeList({
        status: "ACTIVE",
        page: 0,
        size: 100,
      });

      if (myTradesResponse.data?.content) {
        const myRegisteredTrades = myTradesResponse.data.content.filter(
          (trade: Trade) => trade.memberId === currentUserId,
        );

        setMyTrades(myRegisteredTrades);

        const allRequests: TradeRequest[] = [];
        for (const trade of myRegisteredTrades) {
          if (trade.tradeId) {
            try {
              const requestsResponse = await tradeApi.getTradeRequestList({
                tradeId: trade.tradeId,
              });
              if (requestsResponse.data) {
                allRequests.push(...requestsResponse.data);
              }
            } catch (err) {
              console.error(`거래 ${trade.tradeId}의 신청 목록 조회 실패:`, err);
            }
          }
        }

        setReceivedRequests(allRequests);
      }
    } catch (err) {
      if (err instanceof Error) {
        setTradesError(err.message);
      } else {
        setTradesError("신청 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoadingTrades(false);
    }
  };

  const fetchSentRequests = async () => {
    if (!currentUserId) return;

    setIsLoadingTrades(true);
    setTradesError("");

    try {
      const response = await tradeApi.getTradeRequestList({
        requesterId: currentUserId,
      });
      if (response.data) {
        setSentRequests(response.data);
      }
    } catch (err) {
      if (err instanceof Error) {
        setTradesError(err.message);
      } else {
        setTradesError("신청 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoadingTrades(false);
    }
  };

  const handleAccept = async (tradeRequestId: number | undefined) => {
    if (!tradeRequestId) {
      alert("신청 ID가 없습니다.");
      return;
    }

    if (!confirm("이 교환 신청을 수락하시겠습니까?")) {
      return;
    }

    try {
      await tradeApi.acceptTradeRequest(tradeRequestId);
      alert("교환 신청이 수락되었습니다.");
      fetchReceivedRequests();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("신청 수락에 실패했습니다.");
      }
    }
  };

  const handleReject = async (tradeRequestId: number | undefined) => {
    if (!tradeRequestId) {
      alert("신청 ID가 없습니다.");
      return;
    }

    if (!confirm("이 교환 신청을 거절하시겠습니까?")) {
      return;
    }

    try {
      await tradeApi.rejectTradeRequest(tradeRequestId);
      alert("교환 신청이 거절되었습니다.");
      fetchReceivedRequests();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("신청 거절에 실패했습니다.");
      }
    }
  };

  const formatTradeDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          알 수 없음
        </span>
      );
    }

    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-800" },
      ACCEPTED: { label: "수락됨", className: "bg-green-100 text-green-800" },
      REJECTED: { label: "거절됨", className: "bg-red-100 text-red-800" },
      CANCELLED: { label: "취소됨", className: "bg-gray-100 text-gray-800" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  // 필터링 및 정렬
  const filteredAndSortedReservations = (() => {
    let filtered = [...reservations];

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => {
        const status = r.status?.toUpperCase();
        switch (statusFilter) {
          case "reserved":
            const reservedStatus = status?.toUpperCase();
            return reservedStatus === "PENDING" || reservedStatus === "HOLD" || reservedStatus === "CREATED";
          case "booked":
            return status === "CONFIRMED" || status === "COMPLETED";
          case "cancelPending":
            return status === "CANCELLING";
          case "cancelled":
            const statusUpper = status?.toUpperCase();
            return statusUpper === "CANCELLED" || statusUpper === "CANCELED";
          default:
            return true;
        }
      });
    }

    // 기간 필터 (클라이언트 사이드에서 처리)
    if (periodFilter !== "all") {
      const now = new Date();
      const periodDate = new Date();
      switch (periodFilter) {
        case "1month":
          periodDate.setMonth(now.getMonth() - 1);
          break;
        case "3month":
          periodDate.setMonth(now.getMonth() - 3);
          break;
        case "6month":
          periodDate.setMonth(now.getMonth() - 6);
          break;
      }
      if (periodFilter !== "all") {
        filtered = filtered.filter((r) => {
          const date = r.performance?.startDate ? new Date(r.performance.startDate) : null;
          return date && date >= periodDate;
        });
      }
    }

    // 정렬
    filtered.sort((a, b) => {
      let aDate: Date | null = null;
      let bDate: Date | null = null;

      if (sortBy === "bookingDate") {
        // 예매일은 API에 없으므로 startDate 사용
        aDate = a.performance?.startDate ? new Date(a.performance.startDate) : null;
        bDate = b.performance?.startDate ? new Date(b.performance.startDate) : null;
      } else {
        // 관람일
        aDate = a.performance?.startAt ? new Date(a.performance.startAt) : null;
        bDate = b.performance?.startAt ? new Date(b.performance.startAt) : null;
      }

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      const comparison = aDate.getTime() - bDate.getTime();
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  })();

  // 상태 한글 변환
  const getStatusLabel = (status?: string) => {
    if (!status) return "알 수 없음";
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "예약 대기";
      case "HOLD":
      case "CREATED":
        return "예매 확정 대기";
      case "CONFIRMED":
      case "COMPLETED":
        return "예매완료";
      case "CANCELLING":
        return "취소 대기";
      case "CANCELLED":
      case "CANCELED":
        return "취소완료";
      default:
        return status;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "CONFIRMED":
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
      case "HOLD":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLING":
        return "bg-orange-100 text-orange-800";
      case "CANCELLED":
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 날짜 포맷팅
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">마이페이지</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "reservations"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              예매내역
            </button>
            <button
              onClick={() => setActiveTab("trades")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "trades"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              나의 교환/양도
            </button>
            <button
              onClick={() => setActiveTab("lottery")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "lottery"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              추첨 응모
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "tickets"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              내 티켓
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              회원정보
            </button>
          </div>
        </div>

        {/* Reservations Tab */}
        {activeTab === "reservations" && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="1month">1개월</option>
                    <option value="3month">3개월</option>
                    <option value="6month">6개월</option>
                    <option value="all">전체</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">전체</option>
                    <option value="reserved">예약</option>
                    <option value="booked">예매완료</option>
                    <option value="cancelPending">취소대기</option>
                    <option value="cancelled">취소완료</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "bookingDate" | "viewingDate")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="bookingDate">예매일</option>
                    <option value="viewingDate">관람일</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="desc">내림차순</option>
                    <option value="asc">오름차순</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {reservationsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {reservationsError}
              </div>
            )}

            {/* 로딩 상태 */}
            {isLoadingReservations && (
              <div className="text-center py-12 text-gray-400">예매내역을 불러오는 중...</div>
            )}

            {/* 예매내역이 없는 경우 */}
            {!isLoadingReservations &&
              !reservationsError &&
              filteredAndSortedReservations.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-400">예매내역이 없습니다.</p>
                </div>
              )}

            {/* Reservation Cards */}
            {!isLoadingReservations &&
              !reservationsError &&
              filteredAndSortedReservations.length > 0 && (
                <div className="space-y-4">
                  {filteredAndSortedReservations.map((reservation) => (
                    <div
                      key={reservation.reservationId}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <Link
                        href={`/my-page/reservations/${reservation.reservationId}`}
                        className="block"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                              {reservation.performance?.title || "공연 정보 없음"}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>예매번호: {reservation.reservationId}</p>
                              {reservation.performance?.startAt && (
                                <p>관람일시: {formatDateTime(reservation.performance.startAt)}</p>
                              )}
                              {reservation.performance?.startDate && (
                                <p>공연 기간: {formatDate(reservation.performance.startDate)}</p>
                              )}
                              {reservation.performance?.category && (
                                <p>카테고리: {reservation.performance.category}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                reservation.status,
                              )}`}
                            >
                              {getStatusLabel(reservation.status)}
                            </span>
                          </div>
                        </div>

                        {/* 좌석 정보 */}
                        {reservation.seat && (
                          <div className="border-t pt-4 mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span className="font-medium">
                                {reservation.seat.sectionName}구역 {reservation.seat.rowLabel}열{" "}
                                {reservation.seat.seatNumber}번
                              </span>
                              {(reservation.status === "PENDING" ||
                                reservation.status === "HOLD") && (
                                <span className="text-sm text-red-600 font-medium">취소 가능</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Link>

                      {/* 공연 상세 링크 - Link 밖으로 분리 */}
                      {reservation.performance?.performanceId && (
                        <div className="border-t pt-4">
                          <Link
                            href={`/performance/${reservation.performance.performanceId}`}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            공연 상세 보기 →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === "trades" && (
          <div>
            {/* 서브 탭 */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setTradesSubTab("my-trades")}
                  className={`px-6 py-4 font-medium transition-colors ${
                    tradesSubTab === "my-trades"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  내 거래
                </button>
                <button
                  onClick={() => setTradesSubTab("received-requests")}
                  className={`px-6 py-4 font-medium transition-colors ${
                    tradesSubTab === "received-requests"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  받은 신청
                </button>
                <button
                  onClick={() => setTradesSubTab("sent-requests")}
                  className={`px-6 py-4 font-medium transition-colors ${
                    tradesSubTab === "sent-requests"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  보낸 신청
                </button>
              </div>
            </div>

            {tradesError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {tradesError}
              </div>
            )}

            {/* 내 거래 서브 탭 */}
            {tradesSubTab === "my-trades" && (
              <div className="space-y-4">
                {isLoadingTrades ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500">로딩 중...</p>
                  </div>
                ) : myTrades.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-400">등록한 거래가 없습니다.</p>
                  </div>
                ) : (
                  myTrades.map((trade) => (
                    <Link
                      key={trade.tradeId}
                      href={`/trade/${trade.tradeId}`}
                      className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            거래 #{trade.tradeId}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            {trade.section && (
                              <p>
                                <span className="font-semibold">구역:</span> {trade.section}
                              </p>
                            )}
                            {trade.row && (
                              <p>
                                <span className="font-semibold">열:</span> {trade.row}
                              </p>
                            )}
                            {trade.seatNumber && (
                              <p>
                                <span className="font-semibold">좌석:</span> {trade.seatNumber}
                              </p>
                            )}
                            <p>
                              <span className="font-semibold">매수:</span> {trade.totalCount || 0}매
                            </p>
                            <p>
                              <span className="font-semibold">등록일:</span>{" "}
                              {formatTradeDate(trade.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              trade.type === "EXCHANGE"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {trade.type === "EXCHANGE" ? "교환" : "양도"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* 받은 신청 서브 탭 */}
            {tradesSubTab === "received-requests" && (
              <div className="space-y-4">
                {isLoadingTrades ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500">로딩 중...</p>
                  </div>
                ) : receivedRequests.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-400">받은 신청이 없습니다.</p>
                  </div>
                ) : (
                  receivedRequests.map((request) => (
                    <div key={request.tradeRequestId} className="bg-white rounded-lg shadow-sm p-6">
                      <Link
                        href={`/my-page/trade-requests/${request.tradeRequestId}`}
                        className="block"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                              교환 신청 #{request.tradeRequestId}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>거래 ID: {request.tradeId}</p>
                              <p>신청자 ID: {request.requesterId}</p>
                              <p>신청자 티켓 ID: {request.requesterTicketId}</p>
                              <p>신청일: {formatTradeDate(request.createdAt)}</p>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </Link>

                      {request.status === "PENDING" && (
                        <div className="pt-4 border-t">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAccept(request.tradeRequestId)}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                              수락
                            </button>
                            <button
                              onClick={() => handleReject(request.tradeRequestId)}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                              거절
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 보낸 신청 서브 탭 */}
            {tradesSubTab === "sent-requests" && (
              <div className="space-y-4">
                {isLoadingTrades ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-500">로딩 중...</p>
                  </div>
                ) : sentRequests.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <p className="text-gray-400">보낸 신청이 없습니다.</p>
                  </div>
                ) : (
                  sentRequests.map((request) => (
                    <div key={request.tradeRequestId} className="bg-white rounded-lg shadow-sm p-6">
                      <Link
                        href={`/my-page/trade-requests/${request.tradeRequestId}`}
                        className="block"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                              교환 신청 #{request.tradeRequestId}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>거래 ID: {request.tradeId}</p>
                              <p>내 티켓 ID: {request.requesterTicketId}</p>
                              <p>신청일: {formatTradeDate(request.createdAt)}</p>
                              {request.modifiedAt !== request.createdAt && (
                                <p>수정일: {formatTradeDate(request.modifiedAt)}</p>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </Link>

                      <div className="pt-4 border-t">
                        <Link
                          href={`/my-page/trade-requests/${request.tradeRequestId}`}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors inline-block"
                        >
                          거래 상세 보기
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Lottery Tab */}
        {activeTab === "lottery" && (
          <div>
            {/* 에러 메시지 */}
            {lotteryError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {lotteryError}
              </div>
            )}

            {/* 로딩 상태 */}
            {isLoadingLottery && (
              <div className="text-center py-12 text-gray-400">응모 내역을 불러오는 중...</div>
            )}

            {/* 응모 내역이 없는 경우 */}
            {!isLoadingLottery && !lotteryError && lotteryEntries.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-400">응모 내역이 없습니다.</p>
              </div>
            )}

            {/* 응모 내역 카드 */}
            {!isLoadingLottery && !lotteryError && lotteryEntries.length > 0 && (
              <div className="space-y-4">
                {lotteryEntries.map((entry) => {
                  const getStatusBadge = (status: string) => {
                    const statusMap: Record<string, { label: string; className: string }> = {
                      APPLIED: { label: "응모완료", className: "bg-red-100 text-red-800" },
                      WIN: { label: "당첨", className: "bg-green-100 text-green-800" },
                      LOSE: { label: "낙첨", className: "bg-gray-100 text-gray-800" },
                      CANCELLED: { label: "취소됨", className: "bg-red-100 text-red-800" },
                    };

                    const statusInfo = statusMap[status] || {
                      label: status,
                      className: "bg-gray-100 text-gray-800",
                    };
                    return (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    );
                  };

                  const formatDateTime = (dateString: string) => {
                    const date = new Date(dateString);
                    return date.toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                  };

                  return (
                    <div key={entry.lotteryEntryId} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.title}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>공연일시: {formatDateTime(entry.startAt)}</p>
                            <p>회차: {entry.roundNo}회차</p>
                            <p>등급: {entry.gradeType}</p>
                            <p>매수: {entry.quantity}매</p>
                          </div>
                        </div>
                        <div>{getStatusBadge(entry.status)}</div>
                      </div>

                      {entry.status === "WIN" && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 font-medium">
                            🎉 당첨되었습니다! 결제를 진행해주세요.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 더보기 버튼 */}
                {lotteryHasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleLoadMoreLottery}
                      disabled={isLoadingMoreLottery}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoadingMoreLottery ? "로딩 중..." : "더보기"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          <div>
            {/* 에러 메시지 */}
            {ticketsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {ticketsError}
              </div>
            )}

            {/* 로딩 상태 */}
            {isLoadingTickets && (
              <div className="text-center py-12 text-gray-400">티켓 목록을 불러오는 중...</div>
            )}

            {/* 티켓이 없는 경우 */}
            {!isLoadingTickets && !ticketsError && tickets.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-400">보유한 티켓이 없습니다.</p>
              </div>
            )}

            {/* 티켓 카드 */}
            {!isLoadingTickets && !ticketsError && tickets.length > 0 && (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const getStatusLabel = (status?: string) => {
                    switch (status) {
                      case "ISSUED":
                        return "발급됨";
                      case "USED":
                        return "사용됨";
                      case "CANCELED":
                        return "취소됨";
                      case "EXCHANGED":
                        return "교환됨";
                      case "TRANSFERRED":
                        return "양도됨";
                      case "EXPIRED":
                        return "만료됨";
                      default:
                        return status || "알 수 없음";
                    }
                  };

                  const getStatusColor = (status?: string) => {
                    switch (status) {
                      case "ISSUED":
                        return "bg-green-100 text-green-800";
                      case "USED":
                        return "bg-red-100 text-red-800";
                      case "CANCELED":
                        return "bg-red-100 text-red-800";
                      case "EXCHANGED":
                      case "TRANSFERRED":
                        return "bg-red-100 text-red-800";
                      case "EXPIRED":
                        return "bg-gray-100 text-gray-800";
                      default:
                        return "bg-gray-100 text-gray-800";
                    }
                  };

                  return (
                    <div key={ticket.ticketId} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            티켓 #{ticket.ticketId}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            {ticket.reservationId && <p>예매번호: {ticket.reservationId}</p>}
                            {ticket.seatId && <p>좌석 ID: {ticket.seatId}</p>}
                            {ticket.sectionName && <p>구역: {ticket.sectionName}</p>}
                          </div>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              ticket.status,
                            )}`}
                          >
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>
                      </div>

                      {ticket.reservationId && (
                        <div className="border-t pt-4">
                          <Link
                            href={`/my-page/reservations/${ticket.reservationId}`}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            예매 내역 보기 →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && <ProfileTab />}
      </div>
    </div>
  );
}
