import { typedPrereservationApi } from "./typed-prereservation";

export interface PrereservationSection {
  sectionId: number;
  sectionName: string;
  bookingStartAt: string;
  bookingEndAt: string;
  applied: boolean;
}

export interface PrereservationApplication {
  scheduleId: number;
  sectionIds: number[];
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

  /**
   * 사전 예매 좌석 hold
   */
  async holdPrereservationSeat(scheduleId: number, seatId: number) {
    const data = await typedPrereservationApi.holdPrereservationSeat(
      scheduleId,
      seatId
    );
    return {
      code: 201,
      message: "성공적으로 생성되었습니다",
      data: null,
    };
  },

  /**
   * 나의 사전 신청 내역 조회
   */
  async getMyPrereservationApplications() {
    const data = await typedPrereservationApi.getMyPrereservationApplications();
    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: data as PrereservationApplication[],
    };
  },
};
