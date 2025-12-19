# API 타입 정의

이 디렉토리는 Swagger 문서에서 자동 생성된 TypeScript 타입 정의를 저장합니다.

## 타입 생성 방법

```bash
# IP 주소 사용
pnpm generate:types

# 도메인 사용
pnpm generate:types:domain
```

또는 스크립트 직접 실행:

```bash
bash scripts/generate-types.sh
```

## 사용 방법

생성된 타입은 `types/api.d.ts`에 저장되며, 다음과 같이 사용할 수 있습니다:

```typescript
import type { paths, components } from '@/types/api';

// API 경로 타입 사용
type LoginPath = paths['/api/auth/login']['post'];

// 컴포넌트 타입 사용
type LoginRequest = components['schemas']['LoginRequest'];
type LoginResponse = components['schemas']['LoginResponse'];
```

## 주의사항

- 타입 파일은 Swagger 스펙이 변경될 때마다 재생성해야 합니다.
- 생성된 타입 파일은 Git에 커밋하는 것을 권장합니다 (팀원들과 타입 동기화).

