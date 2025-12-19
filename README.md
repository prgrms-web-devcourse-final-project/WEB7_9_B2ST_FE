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

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.b2st.doncrytt.online
```

또는 IP 주소를 사용할 경우:

```bash
NEXT_PUBLIC_API_BASE_URL=http://15.165.115.135
```

**참고:** API 기본 URL은 `lib/api/client.ts`에서 기본값으로 설정되어 있습니다. 환경 변수를 설정하지 않으면 기본값이 사용됩니다.

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

