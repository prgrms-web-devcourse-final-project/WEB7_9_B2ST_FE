# CORS 에러 해결 방법

## 문제 상황
브라우저에서 다른 도메인으로 API 요청을 보낼 때 CORS(Cross-Origin Resource Sharing) 에러가 발생합니다.

## 해결 방법

### 1. 서버 측 해결 (권장) ⭐

**백엔드 서버에서 CORS 설정을 추가해야 합니다.**

Spring Boot의 경우:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:1216",  // 개발 환경
                    "https://your-production-domain.com"  // 프로덕션 환경
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

또는 `@CrossOrigin` 어노테이션 사용:

```java
@RestController
@CrossOrigin(origins = {"http://localhost:1216", "https://your-production-domain.com"})
public class AuthController {
    // ...
}
```

### 2. 클라이언트 측 임시 해결 (개발 환경만)

Next.js의 `rewrites` 기능을 사용하여 프록시를 설정했습니다.

**이미 설정됨:**
- `next.config.ts`에 rewrites 설정 추가
- 개발 환경에서 `/api/*` 요청을 백엔드 서버로 프록시

**사용 방법:**
1. API 클라이언트가 상대 경로를 사용하도록 수정 필요
2. 또는 환경 변수로 프록시 사용 여부 제어

### 3. 환경 변수 설정

`.env.local` 파일에 다음을 추가:

```bash
# 프록시 사용 (개발 환경)
NEXT_PUBLIC_USE_PROXY=true
NEXT_PUBLIC_API_BASE_URL=http://15.165.115.135:8080
```

## 권장 사항

**프로덕션 환경에서는 반드시 서버 측에서 CORS를 설정해야 합니다.**

클라이언트 측 프록시는 개발 환경에서만 사용하고, 프로덕션에서는 서버의 CORS 설정을 사용하세요.

