import { apiClient } from './client';

// 타입 정의
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
  seatGradeId: number;
  quantity: number;
}

export interface LotteryEntry {
  lotteryEntryId: number;
  title: string;
  startAt: string;
  roundNo: number;
  gradeType: string;
  quantity: number;
  status: 'APPLIED' | 'WIN' | 'LOSE' | 'CANCELLED';
}

export interface CreateLotteryEntryResponse {
  id: number;
  memberId: number;
  performanceId: number;
  scheduleId: number;
  grade: string;
  quantity: number;
  status: string;
}

export const lotteryApi = {
  /**
   * 선택한 공연에 해당하는 공연의 구역 배치 조회
   */
  async getLotterySections(performanceId: number) {
    const response = await apiClient.get<LotterySection[]>(
      `/api/performances/${performanceId}/lottery/section`
    );
    return response;
  },

  /**
   * 선택한 추첨 응모 정보 저장
   */
  async createLotteryEntry(performanceId: number, request: CreateLotteryEntryRequest) {
    const response = await apiClient.post<CreateLotteryEntryResponse>(
      `/api/performances/${performanceId}/lottery/entry`,
      request
    );
    return response;
  },

  /**
   * 내가 응모한 공연 전체 조회
   */
  async getMyLotteryEntries() {
    const response = await apiClient.get<LotteryEntry[]>('/api/mypage/lottery/entries');
    return response;
  },
};

