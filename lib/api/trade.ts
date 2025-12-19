import { typedTradeApi } from './typed-trade';
import { typedTicketsApi as ticketsApi } from './typed-tickets';
import type { components } from '@/types/api';

// 타입 재export (하위 호환성)
export type TradeType = 'EXCHANGE' | 'TRANSFER';
export type TradeStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type TradeRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type TicketStatus = 'ISSUED' | 'USED' | 'CANCELLED';

// Swagger 타입에서 추출
type TradeRes = components['schemas']['TradeRes'];
type TradeRequestRes = components['schemas']['TradeRequestRes'];
type TicketRes = components['schemas']['TicketRes'];
type PageTradeRes = components['schemas']['PageTradeRes'];
type CreateTradeRes = components['schemas']['CreateTradeRes'];
type CreateTradeReq = components['schemas']['CreateTradeReq'];
type CreateTradeRequestReq = components['schemas']['CreateTradeRequestReq'];
type UpdateTradePriceReq = components['schemas']['UpdateTradePriceReq'];

// 하위 호환성을 위한 타입
export type Trade = TradeRes;
export type TradeRequest = TradeRequestRes;
export type Ticket = TicketRes;

export interface TradeListResponse {
  content: Trade[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface TradeListParams {
  type?: TradeType;
  status?: TradeStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface TradeRequestListParams {
  tradeId?: number;
  requesterId?: number;
}

export type CreateTradeRequest = CreateTradeReq;
export type CreateTradeResponse = CreateTradeRes;
export type CreateTradeRequestRequest = CreateTradeRequestReq;

// 기존 인터페이스와의 호환성을 위한 래퍼
export const tradeApi = {
  /**
   * 티켓 양도/교환 게시글 목록 조회 (필터링 + 페이징)
   */
  async getTradeList(params: TradeListParams = {}) {
    const data = await typedTradeApi.getTradeList(params);
    
    // PageTradeRes를 TradeListResponse 형태로 변환
    if (data && 'content' in data) {
      return {
        code: 200,
        message: '성공적으로 처리되었습니다',
        data: data as TradeListResponse,
      };
    }
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as any,
    };
  },

  /**
   * 특정 거래 게시글의 상세 정보 조회
   */
  async getTradeDetail(tradeId: number) {
    const data = await typedTradeApi.getTradeDetail(tradeId);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as Trade,
    };
  },

  /**
   * 거래 신청 목록 조회
   * tradeId 또는 requesterId 중 하나는 필수
   */
  async getTradeRequestList(params: TradeRequestListParams) {
    if (!params.tradeId && !params.requesterId) {
      throw new Error('tradeId 또는 requesterId 중 하나는 필수입니다.');
    }

    const data = await typedTradeApi.getTradeRequestList(params);
    
    // 배열인 경우 그대로 반환
    if (Array.isArray(data)) {
      return {
        code: 200,
        message: '성공적으로 처리되었습니다',
        data: data as TradeRequest[],
      };
    }
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: [data] as TradeRequest[],
    };
  },

  /**
   * 특정 교환 신청의 상세 정보 조회
   */
  async getTradeRequestDetail(tradeRequestId: number) {
    const data = await typedTradeApi.getTradeRequestDetail(tradeRequestId);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as TradeRequest,
    };
  },

  /**
   * 사용자가 소유한 티켓 목록 조회
   */
  async getMyTickets() {
    const data = await ticketsApi.getMyTickets();
    
    // 배열인 경우 그대로 반환
    if (Array.isArray(data)) {
      return {
        code: 200,
        message: '성공적으로 처리되었습니다',
        data: data as Ticket[],
      };
    }
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: [data] as Ticket[],
    };
  },

  /**
   * 티켓 양도/교환 게시글 등록
   */
  async createTrade(request: CreateTradeRequest) {
    const data = await typedTradeApi.createTrade(request);
    
    // 배열인 경우 그대로 반환
    if (Array.isArray(data)) {
      return {
        code: 200,
        message: '성공적으로 처리되었습니다',
        data: data as CreateTradeResponse[],
      };
    }
    
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: [data] as CreateTradeResponse[],
    };
  },

  /**
   * 교환 게시글에 교환 신청
   */
  async createTradeRequest(tradeId: number, request: CreateTradeRequestRequest) {
    const data = await typedTradeApi.createTradeRequest(tradeId, request);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: data as TradeRequest,
    };
  },

  /**
   * 교환 신청 거절
   */
  async rejectTradeRequest(tradeRequestId: number) {
    await typedTradeApi.rejectTradeRequest(tradeRequestId);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: null,
    };
  },

  /**
   * 교환 신청 수락
   */
  async acceptTradeRequest(tradeRequestId: number) {
    await typedTradeApi.acceptTradeRequest(tradeRequestId);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: null,
    };
  },

  /**
   * 양도 게시글 가격 수정
   */
  async updateTradePrice(tradeId: number, price: number) {
    await typedTradeApi.updateTradePrice(tradeId, { price });
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: null,
    };
  },

  /**
   * 거래 게시글 삭제
   */
  async deleteTrade(tradeId: number) {
    await typedTradeApi.deleteTrade(tradeId);
    return {
      code: 200,
      message: '성공적으로 처리되었습니다',
      data: null,
    };
  },
};
