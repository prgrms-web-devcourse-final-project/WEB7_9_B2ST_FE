"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { tradeApi, type TradeRequest, type Trade, type Ticket } from "@/lib/api/trade";
import { performanceApi, type PerformanceDetailRes } from "@/lib/api/performance";

export default function TradeRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const tradeRequestId = Number(id);

  const [tradeRequest, setTradeRequest] = useState<TradeRequest | null>(null);
  const [trade, setTrade] = useState<Trade | null>(null);
  const [performance, setPerformance] = useState<PerformanceDetailRes | null>(null);
  const [requesterTicket, setRequesterTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // 교환 신청 상세 정보 조회
        const requestResponse = await tradeApi.getTradeRequestDetail(tradeRequestId);
        if (!requestResponse.data) {
          setError("교환 신청 정보를 찾을 수 없습니다.");
          return;
        }

        setTradeRequest(requestResponse.data);

        // 거래 정보 조회
        if (requestResponse.data.tradeId) {
          try {
            const tradeResponse = await tradeApi.getTradeDetail(requestResponse.data.tradeId);
            if (tradeResponse.data) {
              setTrade(tradeResponse.data);

              // 공연 정보 조회
              if (tradeResponse.data.performanceId) {
                try {
                  const perfResponse = await performanceApi.getPerformance(
                    tradeResponse.data.performanceId,
                  );
                  if (perfResponse.data) {
                    setPerformance(perfResponse.data);
                  }
                } catch (err) {
                  console.error("공연 정보 조회 실패:", err);
                }
              }
            }
          } catch (err) {
            console.error("거래 정보 조회 실패:", err);
          }
        }

        // 신청자 티켓 정보 조회
        if (requestResponse.data.requesterTicketId) {
          try {
            const ticketsResponse = await tradeApi.getMyTickets();
            if (ticketsResponse.data) {
              const foundTicket = ticketsResponse.data.find(
                (t) => t.ticketId === requestResponse.data.requesterTicketId,
              );
              if (foundTicket) {
                setRequesterTicket(foundTicket);
              }
            }
          } catch (err) {
            console.error("티켓 정보 조회 실패:", err);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("데이터를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (tradeRequestId) {
      fetchData();
    }
  }, [tradeRequestId]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !tradeRequest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/my-page"
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              마이페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!tradeRequest) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/my-page"
          className="text-red-600 hover:text-red-700 font-medium mb-6 inline-block"
        >
          ← 마이페이지로
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">교환 신청 상세</h1>
            {getStatusBadge(tradeRequest.status)}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* 신청 정보 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">신청 정보</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">신청 ID</p>
                    <p className="font-semibold text-gray-900">{tradeRequest.tradeRequestId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">상태</p>
                    <p className="font-semibold text-gray-900">
                      {tradeRequest.status === "PENDING"
                        ? "대기중"
                        : tradeRequest.status === "ACCEPTED"
                          ? "수락됨"
                          : tradeRequest.status === "REJECTED"
                            ? "거절됨"
                            : "취소됨"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">신청일</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(tradeRequest.createdAt)}
                    </p>
                  </div>
                  {tradeRequest.modifiedAt !== tradeRequest.createdAt && (
                    <div>
                      <p className="text-gray-600 mb-1">수정일</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(tradeRequest.modifiedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 거래 정보 */}
            {trade && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">거래 정보</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {performance && performance.posterUrl && (
                    <div className="flex gap-4 mb-4">
                      <img
                        src={performance.posterUrl}
                        alt={performance.title || "공연 포스터"}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {performance.title}
                        </h3>
                        {performance.venue?.name && (
                          <p className="text-sm text-gray-600 mb-1">장소: {performance.venue.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {trade.section && (
                        <div>
                          <p className="text-gray-600 mb-1">구역</p>
                          <p className="font-semibold text-gray-900">{trade.section}</p>
                        </div>
                      )}
                      {trade.row && (
                        <div>
                          <p className="text-gray-600 mb-1">열</p>
                          <p className="font-semibold text-gray-900">{trade.row}</p>
                        </div>
                      )}
                      {trade.seatNumber && (
                        <div>
                          <p className="text-gray-600 mb-1">좌석</p>
                          <p className="font-semibold text-gray-900">{trade.seatNumber}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600 mb-1">매수</p>
                        <p className="font-semibold text-gray-900">{trade.totalCount || 0}매</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/trade/${trade.tradeId}`}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      거래 상세 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 신청자 티켓 정보 */}
            {requesterTicket && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">신청자 티켓 정보</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="bg-white rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      {requesterTicket.sectionName && (
                        <p>
                          <span className="font-semibold text-gray-700">구역:</span>{" "}
                          <span className="text-gray-900">{requesterTicket.sectionName}</span>
                        </p>
                      )}
                      {requesterTicket.rowLabel && (
                        <p>
                          <span className="font-semibold text-gray-700">열:</span>{" "}
                          <span className="text-gray-900">{requesterTicket.rowLabel}</span>
                        </p>
                      )}
                      {requesterTicket.seatNumber && (
                        <p>
                          <span className="font-semibold text-gray-700">좌석:</span>{" "}
                          <span className="text-gray-900">{requesterTicket.seatNumber}번</span>
                        </p>
                      )}
                      {requesterTicket.reservationId && (
                        <p>
                          <span className="font-semibold text-gray-700">예약번호:</span>{" "}
                          <span className="text-gray-900">{requesterTicket.reservationId}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

