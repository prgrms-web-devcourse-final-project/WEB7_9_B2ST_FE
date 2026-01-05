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

// 예매 타입
export type ReservationStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELED"
  | "EXPIRED";

export interface AdminReservation {
  reservationId: number;
  scheduleId: number;
  memberId: number;
  status: ReservationStatus;
  seatCount: number;
  createdAt: string;
  expiresAt: string;
}

export interface AdminReservationPageResponse {
  content: AdminReservation[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
}

export interface ReservationQueryParams {
  scheduleId?: number;
  memberId?: number;
  page?: number;
  status?: ReservationStatus;
}

// 예매 상세 타입
export interface ReservationDetailPerformance {
  performanceId: number;
  performanceScheduleId: number;
  title: string;
  category: string;
  startDate: string;
  startAt: string;
}

export interface ReservationDetailReservation {
  reservationId: number;
  status: ReservationStatus;
  performance: ReservationDetailPerformance;
}

export interface ReservationDetailSeat {
  seatId: number;
  sectionId: number;
  sectionName: string;
  rowLabel: string;
  seatNumber: number;
}

export interface ReservationDetailPayment {
  paymentId: number;
  orderId: string;
  amount: number;
  status: string;
  paidAt: string;
}

export interface AdminReservationDetail {
  reservation: ReservationDetailReservation;
  seats: ReservationDetailSeat[];
  payment: ReservationDetailPayment;
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

  /**
   * 관리자 예매 조회 (상태별)
   */
  async getReservations(params?: ReservationQueryParams): Promise<{
    code: number;
    message: string;
    data: AdminReservationPageResponse;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.scheduleId)
      queryParams.append("scheduleId", String(params.scheduleId));
    if (params?.memberId)
      queryParams.append("memberId", String(params.memberId));
    if (params?.page !== undefined)
      queryParams.append("page", String(params.page));
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = `/api/admin/reservations${
      queryString ? `?${queryString}` : ""
    }`;

    const data = await adminApiClient.get<AdminReservationPageResponse>(url);

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data,
    };
  },

  /**
   * 관리자 예매 상세 조회
   */
  async getReservationDetail(reservationId: number): Promise<{
    code: number;
    message: string;
    data: AdminReservationDetail;
  }> {
    const url = `/api/admin/reservations/${reservationId}`;

    const data = await adminApiClient.get<AdminReservationDetail>(url);

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data,
    };
  },

  /**
   * 관리자 예매 취소
   */
  async cancelReservation(reservationId: number): Promise<{
    code: number;
    message: string;
    data: null;
  }> {
    const url = `/api/admin/reservations/${reservationId}/cancel`;

    const data = await adminApiClient.post<null>(url);

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data,
    };
  },
};
