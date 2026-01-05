import { typedApiClient } from "./typed-client";

// 신청 예매 예매 생성 응답
export interface PrereservationBookingResponse {
  prereservationBookingId: number;
  expiresAt: string;
}

export const typedPrereservationApi = {
  /**
   * 신청 예매 구역 목록 조회
   */
  async getPrereservationSections(scheduleId: number) {
    return (typedApiClient.get as any)(
      `/api/prereservations/schedules/${scheduleId}/applications/sections`
    );
  },

  /**
   * 신청 예매 신청하기
   */
  async createPrereservationApplication(scheduleId: number, sectionId: number) {
    return (typedApiClient.post as any)(
      `/api/prereservations/schedules/${scheduleId}/applications`,
      { sectionId }
    );
  },

  /**
   * 사전 예매 좌석 hold
   */
  async holdPrereservationSeat(scheduleId: number, seatId: number) {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://api.b2st.doncrytt.online"
      }/api/prereservations/schedules/${scheduleId}/seats/${seatId}/hold`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            typeof window !== "undefined"
              ? localStorage.getItem("accessToken") || ""
              : ""
          }`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "사전 예매 좌석 hold에 실패했습니다."
      );
    }

    return response.json();
  },

  /**
   * 신청 예매 예매 생성 (결제 도메인 ID 생성)
   * POST /api/prereservations/schedules/{scheduleId}/seats/{seatId}/bookings
   */
  async createPrereservationBooking(
    scheduleId: number,
    seatId: number
  ): Promise<PrereservationBookingResponse> {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://api.b2st.doncrytt.online"
      }/api/prereservations/schedules/${scheduleId}/seats/${seatId}/bookings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            typeof window !== "undefined"
              ? localStorage.getItem("accessToken") || ""
              : ""
          }`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.message || "신청 예매 예매 생성에 실패했습니다.";
      const error = new Error(message) as any;
      error.code = errorData.code;
      error.errorCode = errorData.data?.errorCode;
      throw error;
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * 나의 사전 신청 내역 조회
   */
  async getMyPrereservationApplications() {
    return (typedApiClient.get as any)(`/api/prereservations/applications/me`);
  },
};
