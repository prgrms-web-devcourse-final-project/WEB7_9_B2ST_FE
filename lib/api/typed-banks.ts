import { typedApiClient } from './typed-client';

export const typedBanksApi = {
  /**
   * 은행 목록 조회
   */
  async getBankList() {
    return typedApiClient.get<
      '/api/banks',
      'get',
      200
    >('/api/banks');
  },
};

