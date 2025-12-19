import { typedPerformanceApi } from './typed-performance';
import type { components } from '@/types/api';

// 타입 재export (하위 호환성)
export type PerformanceListRes = components['schemas']['PerformanceListRes'];
export type PagePerformanceListRes = components['schemas']['PagePerformanceListRes'];
export type PerformanceDetailRes = components['schemas']['PerformanceDetailRes'];
export type PerformanceScheduleListRes = components['schemas']['PerformanceScheduleListRes'];
export type Pageable = components['schemas']['Pageable'];

export interface PerformanceListParams {
  page?: number;
  size?: number;
  sort?: string[];
}

// 기존 인터페이스와의 호환성을 위한 래퍼
export const performanceApi = {
  /**
   * 공연 목록 조회
   */
  async getPerformances(params: PerformanceListParams = {}) {
    const pageable: Pageable = {
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? ['createdAt,desc'],
    };

    const data = await typedPerformanceApi.getPerformances({ pageable });
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as PagePerformanceListRes,
    };
  },

  /**
   * 공연 목록 검색
   */
  async searchPerformances(keyword: string, params: PerformanceListParams = {}) {
    const pageable: Pageable = {
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? ['createdAt,desc'],
    };

    const data = await typedPerformanceApi.searchPerformances({
      keyword,
      pageable,
    });
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as PagePerformanceListRes,
    };
  },

  /**
   * 공연 상세 정보 조회
   */
  async getPerformance(performanceId: number) {
    const data = await typedPerformanceApi.getPerformance(performanceId);
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as PerformanceDetailRes,
    };
  },

  /**
   * 공연 일정 목록 조회
   */
  async getSchedules(performanceId: number) {
    const data = await typedPerformanceApi.getSchedules(performanceId);
    
    // 배열인 경우 그대로 반환
    if (Array.isArray(data)) {
      return {
        code: 200,
        message: '성공적으로 처리되었습니다',
        data: data as PerformanceScheduleListRes[],
      };
    }
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: [data] as PerformanceScheduleListRes[],
    };
  },
};
