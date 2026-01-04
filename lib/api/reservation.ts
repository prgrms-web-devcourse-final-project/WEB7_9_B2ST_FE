import { typedReservationApi } from "./typed-reservation";
import type { components } from "@/types/api";
import { ApiResponse } from "./client";

// 타입 재export (하위 호환성)
export type ReservationDetailRes =
  components["schemas"]["ReservationDetailRes"];
export type ReservationReq = components["schemas"]["ReservationReq"];

// 예매 생성 응답 타입
export interface CreateReservationRes {
  reservationId: number;
  status: string; // "PENDING"
}

export const reservationApi = {
  /**
   * 내 예매 목록 조회 (상세)
   */
  async getMyReservations(): Promise<ApiResponse<ReservationDetailRes[]>> {
    const data = await typedReservationApi.getMyReservations();
    // typedApiClient는 이미 data 필드를 추출해서 반환
    // data가 BaseResponse 형태인 경우 data 필드 추출
    const reservations =
      data && typeof data === "object" && "data" in data
        ? (data as any).data
        : data;
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: (Array.isArray(reservations)
        ? reservations
        : []) as ReservationDetailRes[],
    };
  },

  /**
   * 예매 상세 조회
   */
  async getReservationDetail(
    reservationId: number
  ): Promise<ApiResponse<ReservationDetailRes>> {
    const data = await typedReservationApi.getReservationDetail(reservationId);
    // typedApiClient는 이미 data 필드를 추출해서 반환
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: data as ReservationDetailRes,
    };
  },

  /**
   * 예매 취소
   */
  async cancelReservation(reservationId: number): Promise<ApiResponse<null>> {
    await typedReservationApi.cancelReservation(reservationId);
    return {
      code: 200,
      message: "예매가 취소되었습니다",
      data: null,
    };
  },

  /**
   * 예매 홀딩 (좌석 선점)
   * 응답: { reservationId: number, status: string }
   */
  async createReservation(
    scheduleId: number,
    seatId: number
  ): Promise<ApiResponse<CreateReservationRes>> {
    const data = await typedReservationApi.createReservation({
      scheduleId,
      seatId,
    });
    return {
      code: 201,
      message: "성공적으로 생성되었습니다",
      data: data as CreateReservationRes,
    };
  },

  /**
   * 예매 확정 (결제 완료)
   */
  async completeReservation(reservationId: number): Promise<ApiResponse<null>> {
    await typedReservationApi.completeReservation(reservationId);
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: null,
    };
  },
};
