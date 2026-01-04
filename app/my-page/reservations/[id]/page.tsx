"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import {
  reservationApi,
  type ReservationDetailWithSeatsRes,
} from "@/lib/api/reservation";

export default function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const reservationId = parseInt(id, 10);

  const [reservation, setReservation] =
    useState<ReservationDetailWithSeatsRes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // 예매 상세 조회
  useEffect(() => {
    if (isNaN(reservationId)) {
      setError("유효하지 않은 예매번호입니다.");
      setIsLoading(false);
      return;
    }

    const fetchReservation = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await reservationApi.getReservationDetail(
          reservationId
        );
        if (response.data) {
          setReservation(response.data);
        } else {
          setError("예매 정보를 찾을 수 없습니다.");
        }
      } catch (err) {
        if (err instanceof Error) {
          // API에서 전달된 에러 메시지 사용
          // 403: "해당 예매에 대한 권한이 없습니다."
          // 404: "예매내역이 없습니다."
          setError(err.message || "예매 정보를 불러오는데 실패했습니다.");
        } else {
          setError("예매 정보를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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

  // 상태 라벨 및 색상
  const getStatusLabel = (status?: string) => {
    if (!status) return "알 수 없음";
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "예매 대기";
      case "HOLD":
      case "CREATED":
        return "예매 확정 대기";
      case "CONFIRMED":
        return "예매 확정";
      case "COMPLETED":
        return "예매 완료";
      case "CANCELLED":
      case "CANCELED":
        return "취소됨";
      default:
        return status || "알 수 없음";
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "HOLD":
      case "CREATED":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
      case "CANCELED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 취소 가능한 상태인지 확인
  const canCancel = (status?: string) => {
    if (!status) return false;
    const statusUpper = status.toUpperCase();
    // PENDING, HOLD, CREATED, CONFIRMED, COMPLETED 상태 취소 가능 (CANCELLED 제외)
    return (
      statusUpper === "PENDING" ||
      statusUpper === "HOLD" ||
      statusUpper === "CREATED" ||
      statusUpper === "CONFIRMED" ||
      statusUpper === "COMPLETED"
    );
  };

  // 예매 확정 대기 상태인지 확인
  const isPendingConfirmation = (status?: string) => {
    if (!status) return false;
    const statusUpper = status.toUpperCase();
    // HOLD, CREATED 상태는 예매 확정 대기
    return statusUpper === "HOLD" || statusUpper === "CREATED";
  };

  // 예매 취소
  const handleCancel = async () => {
    if (!reservation) return;

    if (!confirm("정말 예매를 취소하시겠습니까?")) {
      return;
    }

    setIsCancelling(true);
    try {
      await reservationApi.cancelReservation(reservationId);
      alert("예매가 취소되었습니다.");
      // 예매 정보 다시 조회하여 상태 업데이트
      const response = await reservationApi.getReservationDetail(reservationId);
      if (response.data) {
        setReservation(response.data);
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "예매 취소에 실패했습니다.");
      } else {
        alert("예매 취소에 실패했습니다.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600 mb-4">
              {error || "예매 정보를 찾을 수 없습니다."}
            </p>
            <Link
              href="/my-page"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              예매내역으로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link
            href="/my-page"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            예매내역으로 돌아가기
          </Link>
        </div>

        {/* 예매 상세 정보 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  예매 상세 정보
                </h1>
                <p className="text-red-100">
                  예매번호: {reservation.reservation.reservationId}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  reservation.reservation.status
                )}`}
              >
                {getStatusLabel(reservation.reservation.status)}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* 공연 정보 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                공연 정보
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">
                    공연명
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {reservation.reservation.performance?.title ||
                      "공연 정보 없음"}
                  </p>
                </div>
                {reservation.reservation.performance?.category && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">
                      카테고리
                    </span>
                    <p className="text-gray-900">
                      {reservation.reservation.performance.category}
                    </p>
                  </div>
                )}
                {reservation.reservation.performance?.startDate && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">
                      공연 기간
                    </span>
                    <p className="text-gray-900">
                      {formatDate(
                        reservation.reservation.performance.startDate
                      )}
                    </p>
                  </div>
                )}
                {reservation.reservation.performance?.startAt && (
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">
                      관람일시
                    </span>
                    <p className="text-gray-900">
                      {formatDateTime(
                        reservation.reservation.performance.startAt
                      )}
                    </p>
                  </div>
                )}
                {reservation.reservation.performance?.performanceId && (
                  <div className="pt-4">
                    <Link
                      href={`/performance/${reservation.reservation.performance.performanceId}`}
                      className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                    >
                      공연 상세 보기
                      <svg
                        className="w-4 h-4 ml-1"
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
                )}
              </div>
            </section>

            {/* 좌석 정보 */}
            {reservation.seats && reservation.seats.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                  좌석 정보
                </h2>
                <div className="space-y-3">
                  {reservation.seats.map((seat, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            구역
                          </span>
                          <p className="text-lg font-semibold text-gray-900">
                            {seat.sectionName || "-"}구역
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            열
                          </span>
                          <p className="text-lg font-semibold text-gray-900">
                            {seat.rowLabel || "-"}열
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-500 block mb-1">
                            좌석 번호
                          </span>
                          <p className="text-lg font-semibold text-gray-900">
                            {seat.seatNumber || "-"}번
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 예매 확정 및 취소 버튼 */}
            {(isPendingConfirmation(reservation.reservation.status) ||
              canCancel(reservation.reservation.status)) && (
              <section>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  {isPendingConfirmation(reservation.reservation.status) && (
                    <Link
                      href={`/performance/${reservation.reservation.performance?.performanceId}/booking/payment?scheduleId=${reservation.reservation.performance?.performanceScheduleId}&reservationIds=${reservationId}`}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      예매 확정
                    </Link>
                  )}
                  {canCancel(reservation.reservation.status) && (
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCancelling ? "취소 중..." : "예매 취소"}
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
