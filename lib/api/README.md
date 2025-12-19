# API 클라이언트 사용 가이드

이 프로젝트는 Swagger에서 생성된 타입을 기반으로 타입 안전한 API 클라이언트를 제공합니다.

## 타입 안전한 API 사용 (권장)

Swagger에서 생성된 타입을 기반으로 자동 완성과 타입 체크를 제공합니다.

```typescript
import { typedAuthApi, typedTradeApi } from '@/lib/api';

// 로그인
const loginResponse = await typedAuthApi.login({
  email: 'user@example.com',
  password: 'password123'
});
// loginResponse는 자동으로 LoginResponse 타입으로 추론됩니다

// 거래 목록 조회
const trades = await typedTradeApi.getTradeList({
  type: 'EXCHANGE',
  status: 'ACTIVE',
  page: 0,
  size: 10
});
// trades는 자동으로 TradeListResponse 타입으로 추론됩니다
```

## 사용 가능한 API

### 인증 (typedAuthApi)
- `login()` - 로그인
- `reissue()` - 토큰 재발급
- `logout()` - 로그아웃

### 거래 (typedTradeApi)
- `getTradeList()` - 거래 목록 조회
- `getTradeDetail()` - 거래 상세 조회
- `createTrade()` - 거래 등록
- `createTradeRequest()` - 교환 신청
- `getTradeRequestList()` - 신청 목록 조회
- `getTradeRequestDetail()` - 신청 상세 조회
- `rejectTradeRequest()` - 신청 거절
- `acceptTradeRequest()` - 신청 수락
- `updateTradePrice()` - 가격 수정
- `deleteTrade()` - 거래 삭제

### 공연 (typedPerformanceApi)
- `searchPerformances()` - 공연 검색
- `getPerformance()` - 공연 상세 조회
- `getSchedules()` - 일정 목록 조회
- `getSchedule()` - 일정 상세 조회
- `getSeatLayout()` - 좌석 배치도 조회

### 예매 (typedReservationApi)
- `createReservation()` - 예매 생성
- `completeReservation()` - 예매 확정

### 추첨 (typedLotteryApi)
- `getLotterySections()` - 구역 배치 조회
- `createLotteryEntry()` - 응모 정보 저장
- `getMyLotteryEntries()` - 내 응모 내역 조회

### 마이페이지 (typedMyPageApi)
- `getMyInfo()` - 내 정보 조회
- `changePassword()` - 비밀번호 변경
- `updateAccount()` - 계정 정보 수정

### 티켓 (typedTicketsApi)
- `getMyTickets()` - 내 티켓 목록 조회

### 공연장 (typedVenuesApi)
- `getVenue()` - 공연장 정보 조회

### 은행 (typedBanksApi)
- `getBankList()` - 은행 목록 조회

## 타입 직접 사용하기

필요한 경우 타입을 직접 import하여 사용할 수 있습니다:

```typescript
import type { components, paths } from '@/types/api';

// 스키마 타입 사용
type LoginRequest = components['schemas']['LoginReq'];
type LoginResponse = components['schemas']['BaseResponseLoginRes'];

// API 경로 타입 사용
type LoginPath = paths['/api/auth/login']['post'];
```

## 기존 API 클라이언트

하위 호환성을 위해 기존 API 클라이언트도 계속 사용할 수 있습니다:

```typescript
import { authApi, tradeApi } from '@/lib/api';

// 기존 방식
const response = await authApi.login({ email, password });
```

