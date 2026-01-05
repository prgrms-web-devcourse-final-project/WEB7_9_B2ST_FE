import { typedApiClient } from "./typed-client";

// 대기열 상태
export type QueueStatus = "WAITING" | "ENTERABLE" | "EXPIRED" | "COMPLETED";

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
  status: QueueStatus;
  position: number;
  estimatedWaitTimeMinutes: number;
  updatedAt: string;
}

// 대기열 완료 요청 (예매 완료 후 권한 소진)
export interface QueueCompleteRequest {
  queueId: number;
}

// 대기열 완료 응답
export interface QueueCompleteResponse {
  queueId: number;
  status: QueueStatus;
  completedAt: string;
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
   */
  async getPosition(queueId: number): Promise<QueuePositionResponse> {
    // TODO: API 연동 시 실제 구현
    // return typedApiClient.get<'/api/queues/{queueId}/position', 'get', 200>(
    //   `/api/queues/${queueId}/position`
    // );

    // 임시 목업 데이터 (위치가 점점 줄어들도록)
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentPosition = Math.max(0, Math.floor(Math.random() * 50));
        resolve({
          queueId,
          status: currentPosition === 0 ? "ENTERABLE" : "WAITING",
          position: currentPosition,
          estimatedWaitTimeMinutes: Math.max(
            0,
            Math.floor(currentPosition / 5)
          ),
          updatedAt: new Date().toISOString(),
        });
      }, 300);
    });
  },

  /**
   * 대기열 완료 (예매 완료 후 권한 소진)
   */
  async complete(queueId: number): Promise<QueueCompleteResponse> {
    // TODO: API 연동 시 실제 구현
    // return typedApiClient.post<'/api/queues/{queueId}/complete', 'post', 200>(
    //   `/api/queues/${queueId}/complete`,
    //   {}
    // );

    // 임시 목업 데이터
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          queueId,
          status: "COMPLETED",
          completedAt: new Date().toISOString(),
        });
      }, 300);
    });
  },
};
