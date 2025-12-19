import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

// 타입 별칭
type LoginRequest = components['schemas']['LoginReq'];
type LoginResponse = components['schemas']['BaseResponseLoginRes'];
type ReissueRequest = components['schemas']['ReissueReq'];
type ReissueResponse = components['schemas']['BaseResponseReissueRes'];

export const typedAuthApi = {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest) {
    return typedApiClient.post<
      '/api/auth/login',
      'post',
      200
    >('/api/auth/login', credentials);
  },

  /**
   * 토큰 재발급
   */
  async reissue(tokens: ReissueRequest) {
    return typedApiClient.post<
      '/api/auth/reissue',
      'post',
      200
    >('/api/auth/reissue', tokens);
  },

  /**
   * 로그아웃
   */
  async logout() {
    return typedApiClient.post<
      '/api/auth/logout',
      'post',
      200
    >('/api/auth/logout');
  },
};

