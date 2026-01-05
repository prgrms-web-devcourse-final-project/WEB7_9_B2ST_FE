import { typedApiClient } from "./typed-client";

// 대기열 상태
export type QueueStatus =
  | "WAITING"
  | "ENTERABLE"
  | "EXPIRED"
  | "COMPLETED"
  | "NOT_IN_QUEUE";

// 대기열 진입 정보
export interface QueueEntry {
  queueId: number;
  performanceId: number;
  scheduleId: number;
  userId: number;
  status: QueueStatus;
  aheadCount: number;
  myRank: number;
}

// 대기열 생성 응답
export interface QueueStartBookingResponse {
  queueId: number;
  performanceId: number;
  scheduleId: number;
  entry: QueueEntry;
}

// 대기열 위치 조회 응답
export interface QueuePositionResponse {
  queueId: number;
  userId: number;
  status: QueueStatus;
  aheadCount: number | null;
  myRank: number | null;
}

export const typedQueueApi = {
  /**
   * 대기열 진입 (예매 시작)
   * POST /api/queues/start-booking/{scheduleId}
   */
  async startBooking(scheduleId: number): Promise<QueueStartBookingResponse> {
    return typedApiClient.post<
      "/api/queues/start-booking/{scheduleId}",
      "post",
      201
    >(`/api/queues/start-booking/${scheduleId}`, {}, { path: { scheduleId } });
  },

  /**
   * 대기열 위치 조회 (폴링용)
   * GET /api/queues/{queueId}/position
   */
  async getPosition(queueId: number): Promise<QueuePositionResponse> {
    return typedApiClient.get<"/api/queues/{queueId}/position", "get", 200>(
      `/api/queues/${queueId}/position`,
      { path: { queueId } }
    );
  },

  /**
   * 대기열 완료 (예매 완료 후 권한 소진)
   * POST /api/queues/{queueId}/complete
   */
  async complete(queueId: number): Promise<void> {
    return typedApiClient.post<"/api/queues/{queueId}/complete", "post", 200>(
      `/api/queues/${queueId}/complete`,
      {},
      { path: { queueId } }
    );
  },

  /**
   * 대기열 나가기 (대기 취소)
   * POST /api/queues/{queueId}/exit
   */
  async exit(queueId: number): Promise<void> {
    return typedApiClient.post<"/api/queues/{queueId}/exit", "post", 200>(
      `/api/queues/${queueId}/exit`,
      {},
      { path: { queueId } }
    );
  },
};
