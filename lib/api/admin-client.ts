import type { paths } from "@/types/api";
import { adminTokenManager } from "@/lib/auth/token";

// 개발 환경에서 프록시 사용 여부 (CORS 우회)
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

// API Base URL
const API_BASE_URL = USE_PROXY
  ? ""
  : process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://15.165.115.135:8080"
      : "https://api.b2st.doncrytt.online");

/**
 * 관리자 전용 API 클라이언트
 * adminTokenManager의 토큰을 사용합니다
 */
class AdminApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 관리자 토큰 가져오기
    if (typeof window !== "undefined") {
      const adminToken = adminTokenManager.getAccessToken();
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
    }

    console.log("[AdminApiClient] Request:", {
      url,
      method: options.method || "GET",
      hasAdminToken: !!headers["Authorization"],
      tokenPreview: headers["Authorization"]
        ? `${headers["Authorization"].substring(0, 30)}...`
        : "none",
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      let jsonData: any = null;
      if (isJson) {
        const text = await response.text();
        jsonData = text ? JSON.parse(text) : null;
      }

      if (!response.ok) {
        // 관리자 API 에러 처리 - 자동 리다이렉트하지 않음
        if (jsonData && "message" in jsonData) {
          throw new Error(jsonData.message as string);
        }
        throw new Error(`요청에 실패했습니다. (${response.status})`);
      }

      // 성공 응답 처리
      if (!jsonData) {
        return null as T;
      }

      // BaseResponse 형태인 경우 data 필드 추출
      if (
        jsonData &&
        typeof jsonData === "object" &&
        "data" in jsonData &&
        jsonData.data !== null &&
        jsonData.data !== undefined
      ) {
        return jsonData.data as T;
      }

      return jsonData as T;
    } catch (error) {
      console.error("[AdminApiClient] Error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }

  /**
   * GET 요청
   */
  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: "GET",
    });
  }

  /**
   * POST 요청
   */
  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, {
      method: "DELETE",
    });
  }
}

export const adminApiClient = new AdminApiClient();
