# B2ST - 공연 예약 및 양도 서비스

공연 티켓 예약과 양도를 한 곳에서 간편하고 안전하게 이용할 수 있는 서비스입니다.

## 기술 스택

- **Next.js 15** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **ESLint** - 코드 품질 관리

## 시작하기

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

