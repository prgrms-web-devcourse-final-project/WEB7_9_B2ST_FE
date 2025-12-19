import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

type VerifyCodeRequest = components['schemas']['VerifyCodeReq'];
type SenderVerificationRequest = components['schemas']['SenderVerificationReq'];
type CheckDuplicateRequest = components['schemas']['CheckDuplicateReq'];

export const typedEmailApi = {
  /**
   * 이메일 인증 코드 발송
   */
  async sendVerificationCode(request: SenderVerificationRequest) {
    return typedApiClient.post<
      '/api/email/verification',
      'post',
      200
    >('/api/email/verification', request);
  },

  /**
   * 이메일 인증 코드 검증
   */
  async verifyCode(request: VerifyCodeRequest) {
    return typedApiClient.post<
      '/api/email/verify',
      'post',
      200
    >('/api/email/verify', request);
  },

  /**
   * 이메일 중복 체크
   */
  async checkDuplicate(request: CheckDuplicateRequest) {
    return typedApiClient.post<
      '/api/email/check-duplicate',
      'post',
      200
    >('/api/email/check-duplicate', request);
  },
};

