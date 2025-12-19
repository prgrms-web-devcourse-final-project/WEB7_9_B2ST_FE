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
};

