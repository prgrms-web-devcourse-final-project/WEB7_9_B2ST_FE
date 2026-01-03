import { typedPerformanceApi } from "./typed-performance";
import type { components } from "@/types/api";

// 타입 재export (하위 호환성)
export type PerformanceListRes = components["schemas"]["PerformanceListRes"];
export type PagePerformanceListRes =
  components["schemas"]["PagePerformanceListRes"];
export type PerformanceDetailRes =
  components["schemas"]["PerformanceDetailRes"] & {
    gradePrices?: Array<{
      gradeType: string;
      price: number;
    }>;
    bookingOpenAt?: string | null;
    bookingCloseAt?: string | null;
    isBookable?: boolean;
  };
export type PerformanceScheduleListRes =
  components["schemas"]["PerformanceScheduleListRes"];
export type ScheduleSeatViewRes = components["schemas"]["ScheduleSeatViewRes"];
export type Pageable = components["schemas"]["Pageable"];

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
      sort: params.sort ?? ["createdAt,desc"],
    };

    const data = await typedPerformanceApi.getPerformances({ pageable });

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: data as PagePerformanceListRes,
    };
  },

  /**
   * 공연 목록 검색
   */
  async searchPerformances(
    keyword: string,
    params: PerformanceListParams = {}
  ) {
    const pageable: Pageable = {
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? ["createdAt,desc"],
    };

    const data = await typedPerformanceApi.searchPerformances({
      keyword,
      pageable,
    });

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
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
      message: "성공적으로 처리되었습니다",
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
        message: "성공적으로 처리되었습니다",
        data: data as PerformanceScheduleListRes[],
      };
    }

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: [data] as PerformanceScheduleListRes[],
    };
  },

  /**
   * 회차별 좌석 조회
   * @param scheduleId 회차 ID
   * @param status 좌석 상태 (선택, AVAILABLE, HOLD, SOLD)
   */
  async getScheduleSeats(
    scheduleId: number,
    status?: "AVAILABLE" | "HOLD" | "SOLD"
  ) {
    const data = await typedPerformanceApi.getScheduleSeats(scheduleId, status);

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: Array.isArray(data) ? (data as ScheduleSeatViewRes[]) : [],
    };
  },

  /**
   * 좌석 홀딩 (예매 선점)
   * @param scheduleId 회차 ID
   * @param seatId 좌석 ID
   */
  async holdSeat(scheduleId: number, seatId: number) {
    await typedPerformanceApi.holdSeat(scheduleId, seatId);
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: null,
    };
  },

  /**
   * 공연 생성 (관리자)
   */
  async createPerformance(request: {
    venueId: number;
    title: string;
    category: string;
    posterUrl: string;
    description: string;
    startDate: string;
    endDate: string;
  }) {
    const data = await typedPerformanceApi.createPerformance(request);
    return {
      code: 201,
      message: "성공적으로 생성되었습니다",
      data: data as PerformanceDetailRes,
    };
  },
  /**
   * 관리자 공연 검색 (전체 목록 포함)
   */
  async searchAdminPerformances(
    params: {
      keyword?: string;
      cursor?: number;
      size?: number;
    } = {}
  ) {
    const data = await typedPerformanceApi.searchAdminPerformances(params);
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: data as {
        content: PerformanceListRes[];
        nextCursor: number | null;
        hasNext: boolean;
      },
    };
  },

  /**
   * 관리자 공연 목록 조회
   */
  async getAdminPerformances(
    params: {
      cursor?: number;
      size?: number;
    } = {}
  ) {
    const data = await typedPerformanceApi.getAdminPerformances(params);
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: data as {
        content: PerformanceListRes[];
        nextCursor: number | null;
        hasNext: boolean;
      },
    };
  },

  /**
   * 관리자 공연 상세 조회
   */
  async getAdminPerformance(performanceId: number) {
    const data = await typedPerformanceApi.getAdminPerformance(performanceId);
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: data as PerformanceDetailRes,
    };
  },

  /**
   * 공연 예매 정책 수정 (관리자)
   */
  async updateBookingPolicy(
    performanceId: number,
    request: {
      bookingOpenAt: string;
      bookingCloseAt: string;
    }
  ) {
    await typedPerformanceApi.updateBookingPolicy(performanceId, request);
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: null,
    };
  },
};
