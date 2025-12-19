import { typedAuthApi } from './typed-auth';
import type { components } from '@/types/api';

// 타입 재export (하위 호환성)
export type LoginRequest = components['schemas']['LoginReq'];
export type LoginResponse = components['schemas']['TokenInfo'];
export type ReissueRequest = components['schemas']['TokenReissueReq'];
export type ReissueResponse = components['schemas']['TokenInfo'];
export type SignupRequest = components['schemas']['SignupReq'];
export type SignupResponse = number; // memberId

// 기존 인터페이스와의 호환성을 위한 래퍼
export const authApi = {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest) {
    const data = await typedAuthApi.login(credentials);
    // TokenInfo 타입을 LoginResponse로 변환
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as LoginResponse,
    };
  },

  /**
   * 토큰 재발급
   */
  async reissue(tokens: ReissueRequest) {
    const data = await typedAuthApi.reissue(tokens);
    // TokenInfo 타입을 ReissueResponse로 변환
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as ReissueResponse,
    };
  },

  /**
   * 로그아웃
   */
  async logout() {
    await typedAuthApi.logout();
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: null,
    };
  },

  /**
   * 회원가입
   */
  async signup(request: SignupRequest) {
    const data = await typedAuthApi.signup(request);
    // BaseResponseLong의 data는 number (memberId)
    return {
      code: 200,
      message: '성공적으로 생성되었습니다',
      data: data as SignupResponse,
    };
  },
};
