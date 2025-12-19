/**
 * 타입 안전한 API 클라이언트
 * Swagger에서 생성된 타입을 기반으로 자동 완성과 타입 체크를 제공합니다.
 */

// Typed API 클라이언트 (Swagger 타입 기반)
export { typedApiClient } from './typed-client';
export { typedAuthApi } from './typed-auth';
export { typedEmailApi } from './typed-email';
export { typedTradeApi } from './typed-trade';
export { typedPerformanceApi } from './typed-performance';
export { typedReservationApi } from './typed-reservation';
export { typedLotteryApi } from './typed-lottery';
export { typedMyPageApi } from './typed-mypage';
export { typedTicketsApi } from './typed-tickets';
export { typedVenuesApi } from './typed-venues';
export { typedBanksApi } from './typed-banks';

// 기존 API 클라이언트 (하위 호환성)
export { apiClient } from './client';
export { authApi } from './auth';
export { emailApi } from './email';
export { tradeApi } from './trade';
export { lotteryApi } from './lottery';

// 타입 export
export type { paths, components } from '@/types/api';

