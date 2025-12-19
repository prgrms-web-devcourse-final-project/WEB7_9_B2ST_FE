import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

export const typedPerformanceApi = {
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
   * 좌석 배치도 조회
   */
  async getSeatLayout(performanceId: number) {
    return typedApiClient.get<
      '/api/performances/{performanceId}/seat-layout',
      'get',
      200
    >('/api/performances/{performanceId}/seat-layout', {
      path: { performanceId },
    });
  },
};

