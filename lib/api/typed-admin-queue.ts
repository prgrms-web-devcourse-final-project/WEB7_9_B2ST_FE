import { typedApiClient } from "./typed-client";

// 대기열 타입
export type QueueType = "BOOKING_ORDER" | "LOTTERY" | "PROMOTION";

// 어드민 대기열 생성 요청
export interface AdminQueueCreateRequest {
  performanceId: number;
  queueType: QueueType;
  maxActiveUsers: number;
  entryTtlMinutes: number;
}

// 어드민 대기열 생성 응답
export interface AdminQueueCreateResponse {
  queueId: number;
  performanceId: number;
  queueType: QueueType;
  maxActiveUsers: number;
  entryTtlMinutes: number;
  currentWaiting: number;
  currentEnterable: number;
}

// 어드민 대기열 조회 응답
export interface AdminQueueDetailResponse {
  queueId: number;
  performanceId: number;
  queueType: QueueType;
  maxActiveUsers: number;
  entryTtlMinutes: number;
  currentWaiting: number;
  currentEnterable: number;
}

// 어드민 대기열 목록 응답 (필터링 가능)
export interface AdminQueueListItemResponse {
  queueId: number;
  performanceId: number;
  queueType: QueueType;
  maxActiveUsers: number;
  entryTtlMinutes: number;
  currentWaiting: number;
  currentEnterable: number;
}

// 어드민 대기열 목록 조회 파라미터
export interface AdminQueueListParams {
  performanceId?: number;
  queueType?: QueueType;
}

// 어드민 대기열 수정 요청
export interface AdminQueueUpdateRequest {
  maxActiveUsers?: number;
  entryTtlMinutes?: number;
}

// 대기열 상태 타입
export type QueueStatusType = "WAITING" | "ENTERABLE" | "EXPIRED" | "COMPLETED";

// 대기열 상태 통계
export interface QueueStatusCount {
  status: QueueStatusType;
  count: number;
}

// 대기열 통계 응답
export interface AdminQueueStatisticsResponse {
  queueId: number;
  totalWaiting: number;
  totalEnterable: number;
  maxActiveUsers: number;
  statusCounts: QueueStatusCount[];
}

export const typedAdminQueueApi = {
  /**
   * 대기열 목록 조회 (필터링)
   * GET /api/admin/queues?performanceId={performanceId}&queueType={queueType}
   */
  async listQueues(
    params?: AdminQueueListParams
  ): Promise<AdminQueueListItemResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.performanceId) {
      queryParams.append("performanceId", params.performanceId.toString());
    }
    if (params?.queueType) {
      queryParams.append("queueType", params.queueType);
    }

    const url = `/api/admin/queues${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return typedApiClient.get(url as any);
  },

  /**
   * 대기열 생성 (수동 생성)
   * POST /api/admin/queues
   */
  async createQueue(
    request: AdminQueueCreateRequest
  ): Promise<AdminQueueCreateResponse> {
    return typedApiClient.post("/api/admin/queues" as any, request);
  },

  /**
   * 대기열 조회 (scheduleId로)
   * GET /api/admin/queues/schedule/{scheduleId}
   */
  async getQueueBySchedule(
    scheduleId: number
  ): Promise<AdminQueueDetailResponse> {
    return typedApiClient.get(
      `/api/admin/queues/schedule/${scheduleId}` as any
    );
  },

  /**
   * 대기열 상세 조회
   * GET /api/admin/queues/{queueId}
   */
  async getQueue(queueId: number): Promise<AdminQueueDetailResponse> {
    return typedApiClient.get(`/api/admin/queues/${queueId}` as any);
  },

  /**
   * 대기열 삭제
   * DELETE /api/admin/queues/{queueId}
   */
  async deleteQueue(queueId: number): Promise<void> {
    return typedApiClient.delete(`/api/admin/queues/${queueId}` as any);
  },

  /**
   * 대기열 리셋 (Redis 초기화)
   * POST /api/admin/queues/{queueId}/reset
   */
  async resetQueue(queueId: number): Promise<AdminQueueDetailResponse> {
    return typedApiClient.post(`/api/admin/queues/${queueId}/reset` as any, {});
  },

  /**
   * 대기열 설정 수정
   * PATCH /api/admin/queues/{queueId}
   */
  async updateQueue(
    queueId: number,
    request: AdminQueueUpdateRequest
  ): Promise<AdminQueueDetailResponse> {
    return typedApiClient.patch(`/api/admin/queues/${queueId}` as any, request);
  },

  /**
   * 대기열 통계 조회
   * GET /api/admin/queues/{queueId}/statistics
   */
  async getQueueStatistics(
    queueId: number
  ): Promise<AdminQueueStatisticsResponse> {
    return typedApiClient.get(`/api/admin/queues/${queueId}/statistics` as any);
  },
};
