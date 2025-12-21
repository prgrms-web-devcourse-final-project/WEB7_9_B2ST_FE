import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

export const typedPerformanceApi = {
  /**
   * 공연 목록 조회
   */
  async getPerformances(params: {
    pageable: components['schemas']['Pageable'];
  }) {
    return typedApiClient.get<
      '/api/performances',
      'get',
      200
    >('/api/performances', {
      query: params,
    });
  },

  /**
   * 공연 목록 검색
   */
  async searchPerformances(params: {
    keyword: string;
    pageable: components['schemas']['Pageable'];
  }) {
    return typedApiClient.get<
      '/api/performances/search',
      'get',
      200
    >('/api/performances/search', {
      query: params,
    });
  },

  /**
   * 공연 상세 정보 조회
   */
  async getPerformance(performanceId: number) {
    return typedApiClient.get<
      '/api/performances/{performanceId}',
      'get',
      200
    >('/api/performances/{performanceId}', {
      path: { performanceId },
    });
  },

  /**
   * 공연 일정 목록 조회
   */
  async getSchedules(performanceId: number) {
    return typedApiClient.get<
      '/api/performances/{performanceId}/schedules',
      'get',
      200
    >('/api/performances/{performanceId}/schedules', {
      path: { performanceId },
    });
  },

  /**
   * 공연 일정 상세 정보 조회
   */
  async getSchedule(performanceId: number, scheduleId: number) {
    return typedApiClient.get<
      '/api/performances/{performanceId}/schedules/{scheduleId}',
      'get',
      200
    >('/api/performances/{performanceId}/schedules/{scheduleId}', {
      path: { performanceId, scheduleId },
    });
  },

  /**
   * 좌석 배치도 조회 (추첨용)
   */
  async getSeatLayout(performanceId: number) {
    return typedApiClient.get<
      '/api/performances/{performanceId}/lottery/section',
      'get',
      200
    >('/api/performances/{performanceId}/lottery/section', {
      path: { performanceId },
    });
  },

  /**
   * 회차별 좌석 조회
   * @param scheduleId 회차 ID
   * @param status 좌석 상태 (선택, AVAILABLE, HOLD, SOLD)
   */
  async getScheduleSeats(scheduleId: number, status?: 'AVAILABLE' | 'HOLD' | 'SOLD') {
    // 타입 정의에 query 파라미터가 없지만 실제 API는 status 파라미터를 받음
    const url = `/api/schedules/${scheduleId}/seats${status ? `?status=${status}` : ''}`;
    return typedApiClient.get<
      '/api/schedules/{scheduleId}/seats',
      'get',
      200
    >(url as '/api/schedules/{scheduleId}/seats');
  },

  /**
   * 좌석 홀딩 (예매 선점)
   * @param scheduleId 회차 ID
   * @param seatId 좌석 ID
   */
  async holdSeat(scheduleId: number, seatId: number) {
    const url = `/api/schedules/${scheduleId}/seats/${seatId}/hold`;
    // 타입 정의에 해당 경로가 없으므로 post 메서드를 any로 캐스팅하여 사용
    return (typedApiClient.post as any)(
      url as any,
      undefined,
      undefined
    );
  },
};

