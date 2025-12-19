import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

type ChangePasswordRequest = components['schemas']['PasswordChangeReq'];
type RefundAccountRequest = components['schemas']['RefundAccountReq'];

export const typedMyPageApi = {
  /**
   * 내 정보 조회
   */
  async getMyInfo() {
    return typedApiClient.get<
      '/api/mypage/me',
      'get',
      200
    >('/api/mypage/me');
  },

  /**
   * 비밀번호 변경
   */
  async changePassword(request: ChangePasswordRequest) {
    return typedApiClient.patch<
      '/api/mypage/password',
      'patch',
      200
    >('/api/mypage/password', request);
  },

  /**
   * 환불 계좌 조회
   */
  async getRefundAccount() {
    return typedApiClient.get<
      '/api/mypage/account',
      'get',
      200
    >('/api/mypage/account');
  },

  /**
   * 환불 계좌 등록/수정
   */
  async setRefundAccount(request: RefundAccountRequest) {
    return typedApiClient.post<
      '/api/mypage/account',
      'post',
      200
    >('/api/mypage/account', request);
  },
};

