import { typedApiClient } from "./typed-client";
import type { components } from "@/types/api";

// 타입 별칭
type LoginRequest = components["schemas"]["LoginReq"];
type ReissueRequest = components["schemas"]["TokenReissueReq"];

// 카카오 관련 타입
export interface KakaoAuthorizeUrlResponse {
  authorizeUrl: string;
  state: string;
  nonce: string;
}

export const typedAuthApi = {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest) {
    return typedApiClient.post<"/api/auth/login", "post", 200>(
      "/api/auth/login",
      credentials
    );
  },

  /**
   * 토큰 재발급
   */
  async reissue(tokens: ReissueRequest) {
    return typedApiClient.post<"/api/auth/reissue", "post", 200>(
      "/api/auth/reissue",
      tokens as any
    );
  },

  /**
   * 로그아웃
   */
  async logout() {
    return typedApiClient.post<"/api/auth/logout", "post", 200>(
      "/api/auth/logout",
      undefined
    );
  },

  /**
   * 회원가입
   */
  async signup(request: components["schemas"]["SignupReq"]) {
    return typedApiClient.post<"/api/members/signup", "post", 200>(
      "/api/members/signup",
      request
    );
  },

  /**
   * 카카오 로그인 URL 조회
   */
  async getKakaoAuthorizeUrl(): Promise<KakaoAuthorizeUrlResponse> {
    const apiBaseURL = process.env.NEXT_PUBLIC_USE_PROXY
      ? ""
      : process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://api.b2st.doncrytt.online";

    const url = `${apiBaseURL}/api/auth/kakao/authorize-url`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`카카오 로그인 URL 조회 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * 카카오 로그인
   */
  async kakaoLogin(kakaoCode: string, kakaoState?: string) {
    try {
      console.log("🔵 카카오 로그인 API 호출:", {
        code: kakaoCode,
        state: kakaoState,
        endpoint: "/api/auth/kakao",
      });
      const response = await typedApiClient.post<any, any, any>(
        "/api/auth/kakao",
        {
          code: kakaoCode,
          ...(kakaoState && { state: kakaoState }),
        }
      );
      console.log("✅ 카카오 로그인 API 응답 성공:", response);
      return response;
    } catch (error: any) {
      console.error("❌ 카카오 로그인 API 에러 상세:", {
        error,
        message: error?.message,
        status: error?.status,
        response: error?.response,
        stack: error?.stack,
      });
      throw error;
    }
  },

  /**
   * 카카오 계정 연동
   */
  async linkKakao(kakaoCode: string, kakaoState?: string) {
    try {
      console.log("🔵 카카오 연동 API 호출:", {
        code: kakaoCode,
        state: kakaoState,
        endpoint: "/api/auth/link/kakao",
      });
      const response = await typedApiClient.post<any, any, any>(
        "/api/auth/link/kakao",
        {
          code: kakaoCode,
          ...(kakaoState && { state: kakaoState }),
        }
      );
      console.log("✅ 카카오 연동 API 응답 성공:", response);
      return response;
    } catch (error: any) {
      console.error("❌ 카카오 연동 API 에러 상세:", {
        error,
        message: error?.message,
        status: error?.status,
        response: error?.response,
        stack: error?.stack,
      });
      throw error;
    }
  },

  /**
   * 회원 탈퇴 복구 이메일 전송
   */
  async sendWithdrawalRecoveryEmail(email: string) {
    return typedApiClient.post<any, any, any>("/api/auth/withdrawal-recovery", {
      email,
    });
  },

  /**
   * 회원 탈퇴 복구 확인
   */
  async confirmRecovery(token: string) {
    return typedApiClient.post<any, any, any>("/api/auth/confirm-recovery", {
      token,
    });
  },
};
