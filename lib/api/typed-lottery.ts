import { typedApiClient } from "./typed-client";
import type { components } from "@/types/api";

type RegisterLotteryEntryRequest =
  components["schemas"]["RegisterLotteryEntryReq"];

export const typedLotteryApi = {
  /**
   * 선택한 공연에 해당하는 공연의 구역 배치 조회
   */
  async getLotterySections(performanceId: number) {
    return typedApiClient.get<
      "/api/performances/{performanceId}/lottery/section",
      "get",
      200
    >("/api/performances/{performanceId}/lottery/section", {
      path: { performanceId },
    });
  },

  /**
   * 선택한 추첨 응모 정보 저장
   */
  async createLotteryEntry(
    performanceId: number,
    request: RegisterLotteryEntryRequest
  ) {
    return typedApiClient.post<
      "/api/performances/{performanceId}/lottery/entry",
      "post",
      201
    >("/api/performances/{performanceId}/lottery/entry", request, {
      path: { performanceId },
    });
  },

  /**
   * 내가 응모한 공연 전체 조회
   */
  async getMyLotteryEntries(page: number = 0) {
    const url = `/api/mypage/lottery/entries?page=${page}`;
    return typedApiClient.get<"/api/mypage/lottery/entries", "get", 200>(
      url as "/api/mypage/lottery/entries"
    );
  },
};
