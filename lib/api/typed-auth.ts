import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

// 타입 별칭
type LoginRequest = components['schemas']['LoginReq'];
type ReissueRequest = components['schemas']['TokenReissueReq'];

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
    >('/api/auth/reissue', tokens as any);
  },

  /**
   * 로그아웃
   */
  async logout() {
    return typedApiClient.post<
      '/api/auth/logout',
      'post',
      200
    >('/api/auth/logout', undefined);
  },

  /**
   * 회원가입
   */
  async signup(request: components['schemas']['SignupReq']) {
    return typedApiClient.post<
      '/api/members/signup',
      'post',
      200
    >('/api/members/signup', request);
  },
};

