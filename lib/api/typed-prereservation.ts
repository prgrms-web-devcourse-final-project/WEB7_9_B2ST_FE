import { typedApiClient } from "./typed-client";

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
};
