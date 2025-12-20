"use client";

import { useState, useEffect } from "react";
import { tradeApi, type TradeRequest, type Trade } from "@/lib/api/trade";
import { mypageApi } from "@/lib/api/mypage";
import Link from "next/link";
import Header from "@/components/Header";

export default function MyTradesPage() {
  const [activeTab, setActiveTab] = useState<"my-trades" | "received-requests" | "sent-requests">(
    "my-trades",
  );
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [myTrades, setMyTrades] = useState<Trade[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<TradeRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<TradeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  // 내 거래 목록 조회
  useEffect(() => {
    if (activeTab === "my-trades" && currentUserId) {
      fetchMyTrades();
    }
  }, [activeTab, currentUserId]);

  // 받은 신청 목록 조회
  useEffect(() => {
    if (activeTab === "received-requests" && currentUserId) {
      fetchReceivedRequests();
    }
  }, [activeTab, currentUserId]);

  // 보낸 신청 목록 조회
  useEffect(() => {
    if (activeTab === "sent-requests" && currentUserId) {
      fetchSentRequests();
    }
  }, [activeTab, currentUserId]);

  const fetchMyTrades = async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await tradeApi.getTradeList({
        status: "ACTIVE",
        page: 0,
        size: 100,
      });

      if (response.data?.content) {
        // 내 거래만 필터링
        const myRegisteredTrades = response.data.content.filter(
          (trade: Trade) => trade.memberId === currentUserId,
        );
        setMyTrades(myRegisteredTrades);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("거래 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReceivedRequests = async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError("");

    try {
      // 내가 등록한 거래 목록 조회 (ACTIVE 상태만)
      const myTradesResponse = await tradeApi.getTradeList({
        status: "ACTIVE",
        page: 0,
        size: 100, // 충분히 큰 값
      });

      if (myTradesResponse.data?.content) {
        // 내 거래 중에서 내 memberId와 일치하는 것만 필터링
        const myRegisteredTrades = myTradesResponse.data.content.filter(
          (trade: Trade) => trade.memberId === currentUserId,
        );

        setMyTrades(myRegisteredTrades);

        // 각 거래에 대한 신청 목록 조회
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
        setError(err.message);
      } else {
        setError("신청 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await tradeApi.getTradeRequestList({
        requesterId: currentUserId,
      });
      if (response.data) {
        setSentRequests(response.data);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("신청 목록을 불러오는데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
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

  const formatDate = (dateString: string | undefined) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">나의 교환/양도</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("my-trades")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "my-trades"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              내 거래
            </button>
            <button
              onClick={() => setActiveTab("received-requests")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "received-requests"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              받은 신청
            </button>
            <button
              onClick={() => setActiveTab("sent-requests")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "sent-requests"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              보낸 신청
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 내 거래 탭 */}
        {activeTab === "my-trades" && (
          <div className="space-y-4">
            {isLoading ? (
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
                          {formatDate(trade.createdAt)}
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

        {/* 받은 신청 탭 */}
        {activeTab === "received-requests" && (
          <div className="space-y-4">
            {isLoading ? (
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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        교환 신청 #{request.tradeRequestId}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>거래 ID: {request.tradeId}</p>
                        <p>신청자 ID: {request.requesterId}</p>
                        <p>신청자 티켓 ID: {request.requesterTicketId}</p>
                        <p>신청일: {formatDate(request.createdAt)}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.status === "PENDING" && (
                    <div className="flex gap-3 pt-4 border-t">
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
                      <Link
                        href={`/trade/${request.tradeId}`}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        거래 보기
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 보낸 신청 탭 */}
        {activeTab === "sent-requests" && (
          <div className="space-y-4">
            {isLoading ? (
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
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        교환 신청 #{request.tradeRequestId}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>거래 ID: {request.tradeId}</p>
                        <p>내 티켓 ID: {request.requesterTicketId}</p>
                        <p>신청일: {formatDate(request.createdAt)}</p>
                        {request.modifiedAt !== request.createdAt && (
                          <p>수정일: {formatDate(request.modifiedAt)}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="pt-4 border-t">
                    <Link
                      href={`/trade/${request.tradeId}`}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors inline-block"
                    >
                      거래 보기
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
