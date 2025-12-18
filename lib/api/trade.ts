import { apiClient } from './client';

// 타입 정의
export type TradeType = 'EXCHANGE' | 'TRANSFER';
export type TradeStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type TradeRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type TicketStatus = 'ISSUED' | 'USED' | 'CANCELLED';

export interface Trade {
  tradeId: number;
  memberId: number;
  performanceId: number;
  scheduleId: number;
  ticketId: number;
  type: TradeType;
  status: TradeStatus;
  price: number | null;
  totalCount: number;
  section: string;
  row: string;
  seatNumber: string;
  createdAt: string;
}

export interface TradeListResponse {
  content: Trade[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface TradeRequest {
  tradeRequestId: number;
  tradeId: number;
  requesterId: number;
  requesterTicketId: number;
  status: TradeRequestStatus;
  createdAt: string;
  modifiedAt: string;
}

export interface Ticket {
  ticketId: number;
  reservationId: number;
  memberId: number;
  seatId: number;
  status: TicketStatus;
  createdAt: string;
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

export interface CreateExchangeTradeRequest {
  ticketId: number;
  type: 'EXCHANGE';
  totalCount: number;
}

export interface CreateTransferTradeRequest {
  ticketIds: number[];
  type: 'TRANSFER';
  price: number;
}

export type CreateTradeRequest = CreateExchangeTradeRequest | CreateTransferTradeRequest;

export interface CreateTradeResponse {
  tradeId: number;
  type: TradeType;
  status: string;
  section: string;
  row: string;
  seatNumber: string;
  totalCount: number;
  price: number | null;
}

export interface CreateTradeRequestRequest {
  requesterTicketId: number;
}

export const tradeApi = {
  /**
   * 티켓 양도/교환 게시글 목록 조회 (필터링 + 페이징)
   */
  async getTradeList(params: TradeListParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const endpoint = `/api/trades${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<TradeListResponse>(endpoint);
    return response;
  },

  /**
   * 특정 거래 게시글의 상세 정보 조회
   */
  async getTradeDetail(tradeId: number) {
    const response = await apiClient.get<Trade>(`/api/trades/${tradeId}`);
    return response;
  },

  /**
   * 거래 신청 목록 조회
   * tradeId 또는 requesterId 중 하나는 필수
   */
  async getTradeRequestList(params: TradeRequestListParams) {
    if (!params.tradeId && !params.requesterId) {
      throw new Error('tradeId 또는 requesterId 중 하나는 필수입니다.');
    }

    const queryParams = new URLSearchParams();
    if (params.tradeId) queryParams.append('tradeId', params.tradeId.toString());
    if (params.requesterId) queryParams.append('requesterId', params.requesterId.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/trade-requests?${queryString}`;
    
    const response = await apiClient.get<TradeRequest[]>(endpoint);
    return response;
  },

  /**
   * 특정 교환 신청의 상세 정보 조회
   */
  async getTradeRequestDetail(tradeRequestId: number) {
    const response = await apiClient.get<TradeRequest>(`/api/trade-requests/${tradeRequestId}`);
    return response;
  },

  /**
   * 사용자가 소유한 티켓 목록 조회
   */
  async getMyTickets() {
    const response = await apiClient.get<Ticket[]>('/api/tickets');
    return response;
  },

  /**
   * 티켓 양도/교환 게시글 등록
   */
  async createTrade(request: CreateTradeRequest) {
    const response = await apiClient.post<CreateTradeResponse | CreateTradeResponse[]>('/api/trades', request);
    return response;
  },

  /**
   * 교환 게시글에 교환 신청
   */
  async createTradeRequest(tradeId: number, request: CreateTradeRequestRequest) {
    const response = await apiClient.post<TradeRequest>(`/api/trades/${tradeId}/requests`, request);
    return response;
  },
};

