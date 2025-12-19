import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

type ReservationRequest = components['schemas']['ReservationReq'];

export const typedReservationApi = {
  /**
   * 예매 생성
   */
  async createReservation(request: ReservationRequest) {
    return typedApiClient.post<
      '/api/reservations',
      'post',
      201
    >('/api/reservations', request);
  },

  /**
   * 예매 확정 (결제 완료)
   */
  async completeReservation(reservationId: number) {
    return typedApiClient.post<
      '/api/reservations/{reservationId}/complete',
      'post',
      200
    >('/api/reservations/{reservationId}/complete', undefined, {
      path: { reservationId },
    });
  },

  /**
   * 내 예매 목록 조회 (상세)
   */
  async getMyReservations() {
    return typedApiClient.get<
      '/api/reservations/me',
      'get',
      200
    >('/api/reservations/me');
  },
};

