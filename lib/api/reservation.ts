import { typedReservationApi } from './typed-reservation';
import type { components } from '@/types/api';
import { ApiResponse } from './client';

// 타입 재export (하위 호환성)
export type ReservationDetailRes = components['schemas']['ReservationDetailRes'];
export type ReservationReq = components['schemas']['ReservationReq'];

export const reservationApi = {
  /**
   * 내 예매 목록 조회 (상세)
   */
  async getMyReservations(): Promise<ApiResponse<ReservationDetailRes[]>> {
    const data = await typedReservationApi.getMyReservations();
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data || [],
    };
  },
};

