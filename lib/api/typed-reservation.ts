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

  /**
   * 예매 상세 조회
   */
  async getReservationDetail(reservationId: number) {
    return typedApiClient.get<
      '/api/reservations/{reservationId}',
      'get',
      200
    >('/api/reservations/{reservationId}', {
      path: { reservationId },
    });
  },

  /**
   * 예매 취소
   */
  async cancelReservation(reservationId: number) {
    return typedApiClient.delete<
      '/api/reservations/{reservationId}',
      'delete',
      200
    >('/api/reservations/{reservationId}', {
      path: { reservationId },
    });
  },
};

