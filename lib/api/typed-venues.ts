import { typedApiClient } from './typed-client';

export const typedVenuesApi = {
  /**
   * 공연장 정보 조회
   */
  async getVenue(venueId: number) {
    return typedApiClient.get<
      '/api/venues/{venueId}',
      'get',
      200
    >('/api/venues/{venueId}', {
      path: { venueId },
    });
  },
};

