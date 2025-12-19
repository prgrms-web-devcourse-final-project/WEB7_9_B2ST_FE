import { typedApiClient } from './typed-client';
import type { components } from '@/types/api';

// 타입 별칭
type CreateTradeRequest = components['schemas']['CreateTradeReq'];
type CreateTradeResponse = components['schemas']['BaseResponseListCreateTradeRes'];
type TradeListResponse = components['schemas']['BaseResponsePageTradeRes'];
type TradeDetailResponse = components['schemas']['BaseResponseTradeRes'];
type CreateTradeRequestReq = components['schemas']['CreateTradeRequestReq'];
type TradeRequestResponse = components['schemas']['BaseResponseTradeRequestRes'];
type TradeRequestListResponse = components['schemas']['BaseResponseListTradeRequestRes'];
type TradeRequestDetailResponse = components['schemas']['BaseResponseTradeRequestRes'];
// UpdateTradePriceReq 타입이 없으므로 직접 정의
type UpdateTradePriceRequest = { price: number };

export const typedTradeApi = {
  /**
   * 티켓 양도/교환 게시글 목록 조회
   */
  async getTradeList(params?: {
    type?: 'EXCHANGE' | 'TRANSFER';
    status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    page?: number;
    size?: number;
    sort?: string;
  }) {
    return typedApiClient.get<
      '/api/trades',
      'get',
      200
    >('/api/trades', {
      query: params as any,
    });
  },

  /**
   * 특정 거래 게시글의 상세 정보 조회
   */
  async getTradeDetail(tradeId: number) {
    return typedApiClient.get<
      '/api/trades/{tradeId}',
      'get',
      200
    >('/api/trades/{tradeId}', {
      path: { tradeId },
    });
  },

  /**
   * 티켓 양도/교환 게시글 등록
   */
  async createTrade(request: CreateTradeRequest) {
    return typedApiClient.post<
      '/api/trades',
      'post',
      200
    >('/api/trades', request);
  },

  /**
   * 교환 게시글에 교환 신청
   */
  async createTradeRequest(tradeId: number, request: CreateTradeRequestReq) {
    return typedApiClient.post<
      '/api/trades/{tradeId}/requests',
      'post',
      200
    >('/api/trades/{tradeId}/requests', request, {
      path: { tradeId },
    });
  },

  /**
   * 거래 신청 목록 조회
   */
  async getTradeRequestList(params: {
    tradeId?: number;
    requesterId?: number;
  }) {
    return typedApiClient.get<
      '/api/trade-requests',
      'get',
      200
    >('/api/trade-requests', {
      query: params as any,
    });
  },

  /**
   * 특정 교환 신청의 상세 정보 조회
   */
  async getTradeRequestDetail(tradeRequestId: number) {
    return typedApiClient.get<
      '/api/trade-requests/{tradeRequestId}',
      'get',
      200
    >('/api/trade-requests/{tradeRequestId}', {
      path: { tradeRequestId },
    });
  },

  /**
   * 교환 신청 거절
   */
  async rejectTradeRequest(tradeRequestId: number) {
    return typedApiClient.patch<
      '/api/trade-requests/{tradeRequestId}/reject',
      'patch',
      200
    >('/api/trade-requests/{tradeRequestId}/reject', undefined, {
      path: { tradeRequestId },
    });
  },

  /**
   * 교환 신청 수락
   */
  async acceptTradeRequest(tradeRequestId: number) {
    return typedApiClient.patch<
      '/api/trade-requests/{tradeRequestId}/accept',
      'patch',
      200
    >('/api/trade-requests/{tradeRequestId}/accept', undefined, {
      path: { tradeRequestId },
    });
  },

  /**
   * 양도 게시글 가격 수정
   */
  async updateTradePrice(tradeId: number, request: UpdateTradePriceRequest) {
    return typedApiClient.patch<
      '/api/trades/{tradeId}',
      'patch',
      200
    >('/api/trades/{tradeId}', request, {
      path: { tradeId },
    });
  },

  /**
   * 거래 게시글 삭제
   */
  async deleteTrade(tradeId: number) {
    return typedApiClient.delete<
      '/api/trades/{tradeId}',
      'delete',
      200
    >('/api/trades/{tradeId}', {
      path: { tradeId },
    });
  },
};

