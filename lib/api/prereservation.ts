import { typedPrereservationApi } from "./typed-prereservation";

export interface PrereservationSection {
  sectionId: number;
  sectionName: string;
  bookingStartAt: string;
  bookingEndAt: string;
  applied: boolean;
}

export const prereservationApi = {
  /**
   * 신청 예매 구역 목록 조회
   */
  async getPrereservationSections(scheduleId: number) {
    const data = await typedPrereservationApi.getPrereservationSections(
      scheduleId
    );
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: data as PrereservationSection[],
    };
  },

  /**
   * 신청 예매 신청하기
   */
  async createPrereservationApplication(scheduleId: number, sectionId: number) {
    await typedPrereservationApi.createPrereservationApplication(
      scheduleId,
      sectionId
    );
    return {
      code: 201,
      message: "성공적으로 생성되었습니다",
      data: null,
    };
  },
};
