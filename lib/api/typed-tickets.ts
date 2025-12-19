import { typedApiClient } from './typed-client';

export const typedTicketsApi = {
  /**
   * 사용자가 소유한 티켓 목록 조회
   */
  async getMyTickets() {
    return typedApiClient.get<
      '/api/tickets/my',
      'get',
      200
    >('/api/tickets/my');
  },
};

