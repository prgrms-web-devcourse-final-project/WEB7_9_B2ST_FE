import { typedLotteryApi } from './typed-lottery';
import type { components } from '@/types/api';

// 타입 재export (하위 호환성)
type SectionLayoutRes = components['schemas']['SectionLayoutRes'];
type AppliedLotteryInfo = components['schemas']['AppliedLotteryInfo'];
type CreateLotteryEntryReq = components['schemas']['CreateLotteryEntryReq'];
type LotteryEntryInfo = components['schemas']['LotteryEntryInfo'];

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
          sectionName: section.sectionName || '',
          grades: (section.grades || []).map((grade) => ({
            grade: grade.grade || '',
            rows: grade.rows || [],
          })),
        }))
      : [];
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: sections,
    };
  },

  /**
   * 선택한 추첨 응모 정보 저장
   */
  async createLotteryEntry(performanceId: number, request: CreateLotteryEntryRequest) {
    const data = await typedLotteryApi.createLotteryEntry(performanceId, request);
    return {
      code: 201,
      message: '성공적으로 생성되었습니다',
      data: data as CreateLotteryEntryResponse,
    };
  },

  /**
   * 내가 응모한 공연 전체 조회
   */
  async getMyLotteryEntries() {
    const data = await typedLotteryApi.getMyLotteryEntries();
    
    // AppliedLotteryInfo[]를 LotteryEntry[]로 변환
    const entries: LotteryEntry[] = Array.isArray(data)
      ? data.map((entry) => ({
          lotteryEntryId: entry.lotteryEntryId || 0,
          title: entry.title || '',
          startAt: entry.startAt || '',
          roundNo: entry.roundNo || 0,
          gradeType: entry.gradeType || '',
          quantity: entry.quantity || 0,
          status: (entry.status || 'APPLIED') as LotteryEntry['status'],
        }))
      : [];
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: entries,
    };
  },
};
