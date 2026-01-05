"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminApi, type AdminReservationDetail } from "@/lib/api/admin";

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export default function AdminReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params?.id as string;

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<AdminReservationDetail | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
      return;
    }

    if (reservationId) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await adminApi.getReservationDetail(
        parseInt(reservationId, 10)
      );
      setDetail(response.data);
    } catch (err: any) {
      console.error("예매 상세 조회 실패:", err);
      const msg =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    setIsCanceling(true);
    setError("");

    try {
      await adminApi.cancelReservation(parseInt(reservationId, 10));
      setCancelSuccess(true);
      setShowCancelModal(false);
      // 상세 정보 다시 로드하여 상태 업데이트
      await fetchDetail();
    } catch (err: any) {
      console.error("예매 취소 실패:", err);
      const msg =
        err instanceof Error ? err.message : "예매 취소에 실패했습니다.";
      setError(msg);
      setShowCancelModal(false);
    } finally {
      setIsCanceling(false);
    }
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">예매 상세</h1>
            <button
              onClick={() => router.push("/admin/reservations")}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← 목록으로
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">예매 상세</h1>
            <button
              onClick={() => router.push("/admin/reservations")}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← 목록으로
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600">데이터를 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const { reservation, seats, payment } = detail;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">예매 상세</h1>
          <div className="flex gap-2">
            {reservation.status !== "CANCELED" && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isCanceling}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? "취소 중..." : "예매 취소"}
              </button>
            )}
            <button
              onClick={() => router.push("/admin/reservations")}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← 목록으로
            </button>
          </div>
        </div>

        {cancelSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-600 font-semibold">
              예매가 성공적으로 취소되었습니다.
            </p>
          </div>
        )}

        {/* 예매 정보 */}
        <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            예매 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">예매 ID</div>
              <div className="font-semibold text-gray-900">
                {reservation.reservationId}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">예매 상태</div>
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded text-sm font-semibold ${
                    reservation.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : reservation.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : reservation.status === "CANCELED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {reservation.status}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 공연 정보 */}
        <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            공연 정보
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">공연명</div>
              <div className="font-semibold text-gray-900">
                {reservation.performance.title}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">카테고리</div>
                <div className="text-gray-900">
                  {reservation.performance.category}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">공연 ID</div>
                <div className="text-gray-900">
                  {reservation.performance.performanceId}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">공연 일정 ID</div>
                <div className="text-gray-900">
                  {reservation.performance.performanceScheduleId}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">공연 시작일</div>
                <div className="text-gray-900">
                  {formatDateTime(reservation.performance.startDate)}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">회차 시작 시간</div>
              <div className="text-gray-900">
                {formatDateTime(reservation.performance.startAt)}
              </div>
            </div>
          </div>
        </section>

        {/* 좌석 정보 */}
        <section className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            좌석 정보 ({seats.length}석)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    좌석 ID
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    구역 ID
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    구역명
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    행
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    좌석번호
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {seats.map((seat) => (
                  <tr key={seat.seatId}>
                    <td className="px-4 py-2 text-gray-900">{seat.seatId}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {seat.sectionId}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {seat.sectionName}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{seat.rowLabel}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {seat.seatNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 결제 정보 */}
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            결제 정보
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">결제 ID</div>
                <div className="text-gray-900">{payment.paymentId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">주문 ID</div>
                <div className="text-gray-900 font-mono text-xs">
                  {payment.orderId}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">결제 금액</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatAmount(payment.amount)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">결제 상태</div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded text-sm font-semibold ${
                      payment.status === "DONE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">결제 완료 시간</div>
              <div className="text-gray-900">
                {formatDateTime(payment.paidAt)}
              </div>
            </div>
          </div>
        </section>

        {/* 취소 확인 모달 */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">예매 취소 확인</h3>
              <p className="text-gray-700 mb-6">
                예매 ID {reservation.reservationId}번을 취소하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCanceling}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  아니오
                </button>
                <button
                  onClick={handleCancelReservation}
                  disabled={isCanceling}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {isCanceling ? "취소 중..." : "예, 취소합니다"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
