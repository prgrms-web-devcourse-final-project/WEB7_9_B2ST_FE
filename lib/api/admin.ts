import { adminApiClient } from "./admin-client";
import { adminTokenManager } from "@/lib/auth/token";

// 로그인 로그 타입
export interface LoginLog {
  id: number;
  email: string;
  clientIp: string;
  success: boolean;
  failReason?: "INVALID_PASSWORD" | "INVALID_EMAIL" | "ACCOUNT_LOCKED" | string;
  attemptedAt: string;
}

export interface LoginLogPageResponse {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: LoginLog[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
  };
  empty: boolean;
}

export interface LoginLogQueryParams {
  email?: string;
  clientIp?: string;
  success?: boolean;
  hours?: number;
  page?: number;
  size?: number;
}

// 구역 타입
export interface VenueSection {
  sectionId: number;
  venueId: number;
  sectionName: string;
}

export interface CreateVenueSectionRequest {
  sectionName: string;
}

// 좌석 타입
export interface VenueSeat {
  seatId: number;
  venueId: number;
  sectionId: number;
  sectionName: string;
  rowLabel: string;
  seatNumber: number;
}

export interface CreateVenueSeatRequest {
  sectionId: number;
  rowLabel: string;
  seatNumber: number;
}

export const adminApi = {
  /**
   * 로그인 로그 조회
   */
  async getLoginLogs(
    params?: LoginLogQueryParams
  ): Promise<{ code: number; message: string; data: LoginLogPageResponse }> {
    const queryParams = new URLSearchParams();

    if (params?.email) queryParams.append("email", params.email);
    if (params?.clientIp) queryParams.append("clientIp", params.clientIp);
    if (params?.success !== undefined)
      queryParams.append("success", String(params.success));
    if (params?.hours) queryParams.append("hours", String(params.hours));
    if (params?.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params?.size !== undefined)
      queryParams.append("size", String(params.size));

    const queryString = queryParams.toString();
    const url = `/api/admin/auth/logs/login${
      queryString ? `?${queryString}` : ""
    }`;

    const data = await adminApiClient.get<LoginLogPageResponse>(url);

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data,
    };
  },

  /**
   * 공연장 구역 등록
   */
  async createVenueSection(
    venueId: number,
    request: CreateVenueSectionRequest
  ): Promise<{ code: number; message: string; data: VenueSection }> {
    const url = `/api/admin/venues/${venueId}/sections`;

    const data = await adminApiClient.post<VenueSection>(url, request);

    return {
      code: 201,
      message: "성공적으로 생성되었습니다",
      data,
    };
  },

  /**
   * 공연장 좌석 등록
   */
  async createVenueSeat(
    venueId: number,
    request: CreateVenueSeatRequest
  ): Promise<{ code: number; message: string; data: VenueSeat }> {
    const url = `/api/admin/venues/${venueId}/seats`;

    const data = await adminApiClient.post<VenueSeat>(url, request);

    return {
      code: 201,
      message: "성공적으로 생성되었습니다",
      data,
    };
  },
};
