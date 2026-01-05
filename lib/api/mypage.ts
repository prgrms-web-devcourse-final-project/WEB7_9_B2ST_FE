import { typedMyPageApi } from './typed-mypage';
import { typedBanksApi } from './typed-banks';
import type { components } from '@/types/api';
import { ApiResponse } from './client';

// 타입 재export (하위 호환성)
export type MyInfoRes = components['schemas']['MyInfoRes'];
export type RefundAccountRes = components['schemas']['RefundAccountRes'];
export type RefundAccountReq = components['schemas']['RefundAccountReq'];
export type PasswordChangeReq = components['schemas']['PasswordChangeReq'];
export type BankRes = components['schemas']['BankRes'];

export const mypageApi = {
  /**
   * 내 정보 조회
   */
  async getMyInfo(): Promise<ApiResponse<MyInfoRes>> {
    const data = await typedMyPageApi.getMyInfo();
    // typedApiClient는 이미 data 필드를 추출해서 반환
    // data가 BaseResponse 형태인 경우 data 필드 추출
    const myInfo = (data && typeof data === 'object' && 'data' in data) 
      ? (data as any).data 
      : data;
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: (myInfo as MyInfoRes) || null,
    };
  },

  /**
   * 환불 계좌 조회
   * 404는 계좌가 없는 정상적인 상태이므로 null을 반환
   */
  async getRefundAccount(): Promise<ApiResponse<RefundAccountRes | null>> {
    try {
      const data = await typedMyPageApi.getRefundAccount();
      // typedApiClient는 이미 data 필드를 추출해서 반환
      // data가 BaseResponse 형태인 경우 data 필드 추출
      const refundAccount = (data && typeof data === 'object' && 'data' in data) 
        ? (data as any).data 
        : data;
      return {
        code: 200,
        message: '성공적으로 처리되었습니다',
        data: (refundAccount as RefundAccountRes) || null,
      };
    } catch (err) {
      // 404는 계좌가 없는 정상적인 상태
      if (err instanceof Error && (
        err.message.includes('404') || 
        err.message.includes('등록된 환불 계좌가 없습니다')
      )) {
        return {
          code: 404,
          message: '등록된 환불 계좌가 없습니다.',
          data: null,
        };
      }
      // 다른 에러는 그대로 throw
      throw err;
    }
  },

  /**
   * 환불 계좌 등록/수정
   */
  async setRefundAccount(request: RefundAccountReq): Promise<ApiResponse<null>> {
    await typedMyPageApi.setRefundAccount(request);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: null,
    };
  },

  /**
   * 비밀번호 변경
   */
  async changePassword(request: PasswordChangeReq): Promise<ApiResponse<null>> {
    await typedMyPageApi.changePassword(request);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: null,
    };
  },

  /**
   * 은행 목록 조회
   */
  async getBankList(): Promise<ApiResponse<BankRes[]>> {
    const data = await typedBanksApi.getBankList();
    // typedApiClient는 이미 data 필드를 추출해서 반환
    // data가 BaseResponse 형태인 경우 data 필드 추출
    const banks = (data && typeof data === 'object' && 'data' in data) 
      ? (data as any).data 
      : data;
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: (Array.isArray(banks) ? banks : []) as BankRes[],
    };
  },

  /**
   * 회원 탈퇴
   */
  async withdraw(password: string): Promise<ApiResponse<string>> {
    const data = await typedMyPageApi.withdraw({ password });
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: (data && typeof data === 'object' && 'data' in data) 
        ? (data as any).data 
        : '회원 탈퇴가 완료되었습니다',
    };
  },
};

