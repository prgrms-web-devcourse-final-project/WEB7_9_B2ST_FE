import { typedLotteryApi } from "./typed-lottery";
import type { components } from "@/types/api";

// 타입 재export (하위 호환성)
type SectionLayoutRes = components["schemas"]["SectionLayoutRes"];
type AppliedLotteryInfo = components["schemas"]["AppliedLotteryInfo"];
type RegisterLotteryEntryReq = components["schemas"]["RegisterLotteryEntryReq"];
type LotteryEntryInfo = components["schemas"]["LotteryEntryInfo"];

export interface LotterySection {
  sectionName: string;
  grades: LotteryGrade[];
}

export interface LotteryGrade {
  grade: string;
  rows: string[];
}

export interface CreateLotteryEntryRequest {
  scheduleId: number;
  grade: string; // API는 grade를 요구하므로 변경
  quantity: number;
}

export interface LotteryEntry {
  lotteryEntryId: string; // UUID (String)
  title: string;
  startAt: string;
  roundNo: number;
  gradeType: string;
  quantity: number;
  status: "APPLIED" | "WIN" | "LOSE" | "CANCELLED";
}

export interface CreateLotteryEntryResponse {
  id: string; // UUID (String)
  memberId: number;
  performanceId: number;
  scheduleId: number;
  grade: string;
  quantity: number;
  status: string;
}

// 기존 인터페이스와의 호환성을 위한 래퍼
export const lotteryApi = {
  /**
   * 선택한 공연에 해당하는 공연의 구역 배치 조회
   */
  async getLotterySections(performanceId: number) {
    const data = await typedLotteryApi.getLotterySections(performanceId);

    // SectionLayoutRes[]를 LotterySection[]로 변환
    const sections: LotterySection[] = Array.isArray(data)
      ? data.map((section) => ({
          sectionName: section.sectionName || "",
          grades: (section.grades || []).map((grade: any) => ({
            grade: grade.grade || "",
            rows: grade.rows || [],
          })),
        }))
      : [];

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: sections,
    };
  },

  /**
   * 선택한 추첨 응모 정보 저장
   */
  async createLotteryEntry(performanceId: number, request: CreateLotteryEntryRequest) {
    // API는 RegisterLotteryEntryReq를 요구 (grade 사용)
    const apiRequest = {
      scheduleId: request.scheduleId,
      grade: request.grade,
      quantity: request.quantity,
    };
    const response = await typedLotteryApi.createLotteryEntry(performanceId, apiRequest);
    // API 응답의 id는 UUID (String) 타입
    // typedApiClient가 반환하는 data는 LotteryEntryInfo 타입이지만, 실제로는 id가 UUID 문자열
    const responseData = response as any;
    return {
      code: 201,
      message: "성공적으로 생성되었습니다",
      data: {
        id: String(responseData?.id || ""), // UUID는 String 타입
        memberId: responseData?.memberId || 0,
        performanceId: responseData?.performanceId || 0,
        scheduleId: responseData?.scheduleId || 0,
        grade: responseData?.grade || "",
        quantity: responseData?.quantity || 0,
        status: responseData?.status || "",
      } as CreateLotteryEntryResponse,
    };
  },

  /**
   * 내가 응모한 공연 전체 조회
   * @param page 페이지 번호 (0부터 시작, 기본값 0)
   */
  async getMyLotteryEntries(page: number = 0) {
    const response = await typedLotteryApi.getMyLotteryEntries(page);
    const data = response as any;

    // 새로운 응답 구조: { content: [...], hasNext: boolean }
    const content = data?.content || [];
    const hasNext = data?.hasNext || false;

    // AppliedLotteryInfo[]를 LotteryEntry[]로 변환
    const entries: LotteryEntry[] = Array.isArray(content)
      ? content.map((entry: any) => ({
          lotteryEntryId: entry.lotteryEntryId || "",
          title: entry.title || "",
          startAt: entry.startAt || "",
          roundNo: entry.roundNo || 0,
          gradeType: entry.gradeType || "",
          quantity: entry.quantity || 0,
          status: (entry.status || "APPLIED") as LotteryEntry["status"],
        }))
      : [];

    return {
      code: 200,
      message: "성공적으로 처리되었습니다",
      data: entries,
      hasNext,
    };
  },
};
