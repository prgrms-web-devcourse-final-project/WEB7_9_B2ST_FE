# 카카오 로그인 설정 가이드

## 개요

프론트엔드에서 카카오 로그인을 위해 백엔드 API를 이용합니다. 클라이언트 ID나 리다이렉트 URI 등의 설정은 백엔드에서 관리합니다.

## 플로우

1. **사용자가 카카오 로그인 버튼 클릭**

   - 프론트에서 백엔드 API `GET /api/auth/kakao/authorize-url` 호출

2. **백엔드에서 카카오 로그인 URL 반환**

   ```json
   {
     "code": 200,
     "message": "성공적으로 처리되었습니다",
     "data": {
       "authorizeUrl": "https://kauth.kakao.com/oauth/authorize?...",
       "state": "string",
       "nonce": "string"
     }
   }
   ```

3. **프론트에서 카카오 로그인 페이지로 리다이렉트**

   - 사용자가 카카오에서 인증

4. **카카오에서 리다이렉트 URI로 리다이렉트**

   - code 파라미터 포함
   - `/login` 또는 `/signup` 페이지로 리다이렉트

5. **프론트에서 백엔드 API 호출**

   ```
   POST /api/auth/kakao
   {
     "code": "..."
   }
   ```

6. **JWT 토큰 발급**
   - 토큰 저장
   - 메인 페이지로 리다이렉트

## 환경 변수 설정

**불필요** - 클라이언트 키를 사용하지 않으므로 환경 변수 설정이 필요 없습니다.

## 백엔드 API

### 1. 카카오 로그인 URL 조회

```
GET /api/auth/kakao/authorize-url
```

**응답:**

```json
{
  "code": 200,
  "message": "성공적으로 처리되었습니다",
  "data": {
    "authorizeUrl": "https://kauth.kakao.com/oauth/authorize?client_id=96d58ea89f8d7084e8029372bee77381&redirect_uri=https://b2st.doncrytt.online/api/auth/kakao/callback&response_type=code&scope=openid%20profile_nickname%20account_email&nonce=71804ce9-f394-4194-828c-50798a9d525c&state=f2ab21c9-0c38-47bd-af59-c030fe69106e",
    "state": "f2ab21c9-0c38-47bd-af59-c030fe69106e",
    "nonce": "71804ce9-f394-4194-828c-50798a9d525c"
  }
}
```

### 2. 카카오 로그인

```
POST /api/auth/kakao
{
  "code": "string"
}
```

**정상 응답 (200):**

```json
{
  "code": 200,
  "message": "성공적으로 처리되었습니다",
  "data": {
    "grantType": "Bearer",
    "accessToken": "string"
  }
}
```

**이메일 미동의 (400):**

```json
{
  "code": 400,
  "message": "이메일 정보 제공에 동의해주세요.",
  "data": null
}
```

**인증 실패 (401):**

```json
{
  "code": 401,
  "message": "소셜 로그인 인증에 실패했습니다.",
  "data": null
}
```

## 에러 처리

### 이메일 정보 미동의

사용자가 이메일 정보 제공에 동의하지 않으면:

1. 프론트에서 에러 메시지 표시
2. 사용자에게 카카오 계정 설정에서 동의하도록 안내
3. 재시도 옵션 제공

### 인증 실패

- 네트워크 오류
- 유효하지 않은 code
- 기타 인증 오류

모든 경우 사용자 친화적인 에러 메시지 표시

## 테스트

### 로그인 페이지에서 테스트

```
http://localhost:3000/login
```

### 회원가입 페이지에서 테스트

```
http://localhost:3000/signup
```

## 구현 상태

- ✅ 프론트엔드 카카오 로그인 UI 추가 (완료)
- ✅ 백엔드 API 연동 (완료)
- ✅ 에러 처리 (완료)
