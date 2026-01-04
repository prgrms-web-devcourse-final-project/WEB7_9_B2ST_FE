"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { tokenManager } from "@/lib/auth/token";
import {
  authApi,
  type LoginRequest,
  type KakaoLoginRequest,
  type KakaoAuthorizeUrlResponse,
} from "@/lib/api/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  getKakaoAuthorizeUrl: () => Promise<KakaoAuthorizeUrlResponse>;
  kakaoLogin: (request: KakaoLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 인증 상태 확인
    setIsAuthenticated(tokenManager.isAuthenticated());
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);

      if (response.data && response.data.accessToken) {
        tokenManager.setAccessToken(response.data.accessToken);
        const refreshToken =
          "refreshToken" in response.data
            ? response.data.refreshToken
            : undefined;
        if (refreshToken && typeof refreshToken === "string") {
          tokenManager.setRefreshToken(refreshToken);
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const kakaoLogin = async (request: KakaoLoginRequest) => {
    try {
      const response = await authApi.kakaoLogin(request);

      if (response.data && response.data.accessToken) {
        tokenManager.setAccessToken(response.data.accessToken);
        const refreshToken =
          "refreshToken" in response.data
            ? response.data.refreshToken
            : undefined;
        if (refreshToken && typeof refreshToken === "string") {
          tokenManager.setRefreshToken(refreshToken);
        }
        // 토큰 저장 후 상태 업데이트
        setIsAuthenticated(true);
        console.log("카카오 로그인 성공, 토큰 저장됨");
      } else {
        throw new Error("응답에 accessToken이 없습니다");
      }
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      throw error;
    }
  };

  const getKakaoAuthorizeUrl = async () => {
    try {
      const response = await authApi.getKakaoAuthorizeUrl();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logout API 호출 시작");
      await authApi.logout();
      console.log("Logout API 호출 성공");
    } catch (error) {
      // 로그아웃 API 실패해도 클라이언트에서는 토큰 제거
      console.error("Logout error:", error);
    } finally {
      tokenManager.clearTokens();
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        getKakaoAuthorizeUrl,
        kakaoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
