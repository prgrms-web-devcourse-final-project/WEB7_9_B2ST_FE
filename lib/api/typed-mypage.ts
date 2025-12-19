import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

type ChangePasswordRequest = components['schemas']['ChangePasswordReq'];
type UpdateAccountRequest = components['schemas']['UpdateAccountReq'];

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
   * 계정 정보 수정
   */
  async updateAccount(request: UpdateAccountRequest) {
    return typedApiClient.patch<
      '/api/mypage/account',
      'patch',
      200
    >('/api/mypage/account', request);
  },
};

