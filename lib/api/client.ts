import { reissueToken } from "./reissue";
import { tokenManager } from "@/lib/auth/token";

// 개발 환경에서 프록시 사용 여부 (CORS 우회)
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

// 개발/운영 모두 HTTPS 도메인 강제, 프록시 시 상대 경로 사용
const API_BASE_URL = USE_PROXY
  ? "" // 프록시 사용 시 상대 경로
  : process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.b2st.doncrytt.online";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

export interface LoginResponse {
  grantType: string;
  accessToken: string;
  refreshToken?: string;
}

export interface ReissueResponse {
  grantType: string;
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private baseURL: string;
  private isReissuing: boolean = false;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // 인증이 필요 없는 엔드포인트 목록
    const publicEndpoints = [
      "/api/auth/login",
      "/api/auth/reissue",
      "/api/members/signup",
      "/api/email/verification",
      "/api/email/verify",
      "/api/email/check-duplicate",
    ];

    // 인증이 필요한 엔드포인트에만 토큰 추가
    const isPublicEndpoint = publicEndpoints.some((path) =>
      endpoint.includes(path)
    );

    if (!isPublicEndpoint && typeof window !== "undefined") {
      const accessToken = tokenManager.getAccessToken();
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const jsonData = await response.json();

      // 401 에러 발생 시 토큰 재발급 시도
      if (
        !response.ok &&
        response.status === 401 &&
        retryOn401 &&
        !this.isReissuing
      ) {
        // 재발급 API 자체가 401이면 재시도하지 않음
        const isReissueEndpoint = endpoint.includes("/api/auth/reissue");
        // 로그인, 회원가입 등 인증이 필요 없는 엔드포인트는 재발급 시도하지 않음
        const isPublicEndpoint =
          endpoint.includes("/api/auth/login") ||
          endpoint.includes("/api/members/signup");

        if (!isReissueEndpoint && !isPublicEndpoint) {
          this.isReissuing = true;
          const reissueSuccess = await reissueToken();
          this.isReissuing = false;

          if (reissueSuccess) {
            // 재발급 성공 시 원래 요청 재시도
            return this.request<T>(endpoint, options, false); // 재시도는 한 번만
          } else {
            // 재발급 실패 시 토큰 제거하고 에러 throw
            tokenManager.clearTokens();
            // 페이지 리로드하여 로그인 페이지로 이동
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
          }
        }
      }

      if (!response.ok) {
        // 에러 응답 형식 처리 (code와 message가 있는 경우)
        if ("message" in jsonData) {
          throw new Error(jsonData.message || "요청에 실패했습니다.");
        }
        throw new Error("요청에 실패했습니다.");
      }

      // 성공 응답 형식 처리
      // 형식 1: { code, message, data }
      if ("code" in jsonData && "data" in jsonData) {
        return jsonData as ApiResponse<T>;
      }

      // 형식 2: { data: T } (티켓 교환 API 등)
      if ("data" in jsonData) {
        return {
          code: response.status,
          message: "성공적으로 처리되었습니다",
          data: jsonData.data as T,
        };
      }

      // 형식 3: 직접 데이터 (배열 등)
      return {
        code: response.status,
        message: "성공적으로 처리되었습니다",
        data: jsonData as T,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
