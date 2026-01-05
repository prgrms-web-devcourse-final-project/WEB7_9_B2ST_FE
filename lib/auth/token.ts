/**
 * 토큰 관리 유틸리티
 */

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ADMIN_ACCESS_TOKEN_KEY = "adminAccessToken";
const ADMIN_REFRESH_TOKEN_KEY = "adminRefreshToken";

export const tokenManager = {
  /**
   * Access Token 저장
   */
  setAccessToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Refresh Token 저장
   */
  setRefreshToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Access Token 조회
   */
  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Refresh Token 조회
   */
  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * 모든 토큰 제거
   */
  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  /**
   * 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  },
};

/**
 * 관리자 토큰 관리 유틸리티 (일반 사용자와 분리)
 */
export const adminTokenManager = {
  /**
   * Admin Access Token 저장
   */
  setAccessToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Admin Refresh Token 저장
   */
  setRefreshToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Admin Access Token 조회
   */
  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Admin Refresh Token 조회
   */
  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * 모든 관리자 토큰 제거
   */
  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
      localStorage.removeItem("isAdmin");
    }
  },

  /**
   * 관리자 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    return (
      this.getAccessToken() !== null &&
      localStorage.getItem("isAdmin") === "true"
    );
  },
};
