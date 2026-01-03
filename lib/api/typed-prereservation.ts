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
};
