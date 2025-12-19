# B2ST - 공연 예약 및 양도 서비스

공연 티켓 예약과 양도를 한 곳에서 간편하고 안전하게 이용할 수 있는 서비스입니다.

## 기술 스택

- **Next.js 15** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **ESLint** - 코드 품질 관리

## 시작하기

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

**옵션 1: 프록시 사용 (CORS 에러 해결, 개발 환경 권장)**
```bash
NEXT_PUBLIC_USE_PROXY=true
NEXT_PUBLIC_API_BASE_URL=http://15.165.115.135:8080
```

**옵션 2: 직접 연결 (서버에서 CORS 설정된 경우)**
```bash
NEXT_PUBLIC_USE_PROXY=false
NEXT_PUBLIC_API_BASE_URL=http://15.165.115.135:8080
```

**프로덕션 환경:**
```bash
NEXT_PUBLIC_USE_PROXY=false
NEXT_PUBLIC_API_BASE_URL=https://api.b2st.doncrytt.online
```

**참고:** 
- `NEXT_PUBLIC_USE_PROXY=true`로 설정하면 Next.js 프록시를 통해 API를 호출하여 CORS 에러를 우회할 수 있습니다.
- 개발 환경에서는 기본값으로 `http://15.165.115.135:8080`이 사용됩니다.
- 프로덕션 환경에서는 기본값으로 `https://api.b2st.doncrytt.online`이 사용됩니다.
- **권장:** 프로덕션 환경에서는 서버 측에서 CORS를 설정하는 것이 좋습니다.

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:1216](http://localhost:1216)을 열어 확인하세요.

### 빌드

```bash
pnpm build
```

### 프로덕션 실행

```bash
pnpm start
```

### Swagger 타입 생성

Swagger 문서에서 TypeScript 타입을 자동으로 생성할 수 있습니다:

```bash
# openapi-typescript 패키지 설치 (처음 한 번만)
pnpm add -D openapi-typescript

# 타입 생성 (IP 주소 사용)
pnpm generate:types

# 또는 도메인 사용
pnpm generate:types:domain
```

생성된 타입은 `types/api.d.ts`에 저장되며, 프로젝트에서 다음과 같이 사용할 수 있습니다:

```typescript
import type { paths } from '@/types/api';

// API 응답 타입 사용 예시
type LoginResponse = paths['/api/auth/login']['post']['responses']['200']['content']['application/json'];
```

## 프로젝트 구조

```
WEB7_9_B2ST_FE/
├── app/              # Next.js App Router
│   ├── layout.tsx    # 루트 레이아웃
│   ├── page.tsx      # 메인 페이지
│   └── globals.css   # 전역 스타일
├── components/       # 재사용 가능한 컴포넌트
├── public/          # 정적 파일
└── package.json     # 프로젝트 의존성
```

## 주요 기능

- 🎭 공연 티켓 예약
- 🔄 티켓 양도
- 🔍 공연 검색
- 👤 사용자 인증
- 💳 안전한 결제 시스템

## 라이선스

이 프로젝트는 개인 프로젝트입니다.

