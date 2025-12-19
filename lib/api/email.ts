import { typedEmailApi } from './typed-email';
import type { components } from '@/types/api';

// 타입 재export (하위 호환성)
export type SendVerificationCodeRequest = components['schemas']['SenderVerificationReq'];
export type VerifyCodeRequest = components['schemas']['VerifyCodeReq'];
export type CheckDuplicateRequest = components['schemas']['CheckDuplicateReq'];
export type CheckDuplicateResponse = components['schemas']['CheckDuplicateRes'];

// 기존 인터페이스와의 호환성을 위한 래퍼
export const emailApi = {
  /**
   * 이메일 인증 코드 발송
   */
  async sendVerificationCode(request: SendVerificationCodeRequest) {
    await typedEmailApi.sendVerificationCode(request);
    return {
      code: 200,
      message: '인증 코드가 발송되었습니다',
      data: null,
    };
  },

  /**
   * 이메일 인증 코드 검증
   */
  async verifyCode(request: VerifyCodeRequest) {
    await typedEmailApi.verifyCode(request);
    return {
      code: 200,
      message: '인증이 완료되었습니다',
      data: null,
    };
  },

  /**
   * 이메일 중복 체크
   */
  async checkDuplicate(request: CheckDuplicateRequest) {
    const data = await typedEmailApi.checkDuplicate(request);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as CheckDuplicateResponse,
    };
  },
};

