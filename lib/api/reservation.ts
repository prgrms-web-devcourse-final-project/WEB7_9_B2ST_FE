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
    // typedApiClient는 이미 data 필드를 추출해서 반환
    // data가 BaseResponse 형태인 경우 data 필드 추출
    const reservations = (data && typeof data === 'object' && 'data' in data) 
      ? (data as any).data 
      : data;
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: (Array.isArray(reservations) ? reservations : []) as ReservationDetailRes[],
    };
  },
};

