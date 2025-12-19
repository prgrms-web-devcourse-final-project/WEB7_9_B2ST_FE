import type { paths, components } from "@/types/api";
import { reissueToken } from "./reissue";
import { tokenManager } from "@/lib/auth/token";

// 개발 환경에서 프록시 사용 여부 (CORS 우회)
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === "true";

// 개발 환경에서는 HTTP/IP 사용, 프로덕션에서는 HTTPS 도메인 사용
// 프록시를 사용하는 경우 상대 경로 사용
const API_BASE_URL = USE_PROXY
  ? "" // 프록시 사용 시 상대 경로
  : process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://15.165.115.135:8080"
      : "https://api.b2st.doncrytt.online");

// 헬퍼 타입: paths에서 특정 경로와 메서드의 타입 추출
type PathMethod<T extends keyof paths, M extends keyof paths[T]> = paths[T][M];

// 헬퍼 타입: 응답 타입 추출
type ResponseData<
  T extends keyof paths,
  M extends keyof paths[T],
  Status extends number = 200,
> = PathMethod<T, M> extends { responses: infer R }
  ? R extends { [K in Status]: { content: { "*/*": infer D } } }
    ? D
    : never
  : never;

// 헬퍼 타입: 요청 본문 타입 추출
type RequestBody<T extends keyof paths, M extends keyof paths[T]> = PathMethod<T, M> extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

// 헬퍼 타입: 쿼리 파라미터 타입 추출
type QueryParams<T extends keyof paths, M extends keyof paths[T]> = PathMethod<T, M> extends {
  parameters: { query: infer Q };
}
  ? Q
  : never;

// 헬퍼 타입: 경로 파라미터 타입 추출
type PathParams<T extends keyof paths, M extends keyof paths[T]> = PathMethod<T, M> extends {
  parameters: { path: infer P };
}
  ? P
  : never;

class TypedApiClient {
  private baseURL: string;
  private isReissuing: boolean = false;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401: boolean = true,
  ): Promise<T> {
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
    const isPublicEndpoint = publicEndpoints.some((path) => endpoint.includes(path));
    
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

      // 응답이 비어있는 경우 처리 (로그아웃 등)
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      let jsonData: any = null;
      if (isJson) {
        const text = await response.text();
        jsonData = text ? JSON.parse(text) : null;
      }

      // 401 에러 발생 시 토큰 재발급 시도
      if (!response.ok && response.status === 401 && retryOn401 && !this.isReissuing) {
        // 재발급 API 자체가 401이면 재시도하지 않음
        const isReissueEndpoint = endpoint.includes("/api/auth/reissue");
        // 로그인, 회원가입 등 인증이 필요 없는 엔드포인트는 재발급 시도하지 않음
        const isPublicEndpoint = endpoint.includes("/api/auth/login") || 
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
        // 에러 응답 처리
        if (jsonData && "message" in jsonData) {
          throw new Error(jsonData.message as string);
        }
        throw new Error(`요청에 실패했습니다. (${response.status})`);
      }

      // 성공 응답 처리
      // 응답이 없는 경우 (204 No Content 등)
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

      // data가 null이거나 없는 경우 전체 응답 반환
      return jsonData as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }

  /**
   * GET 요청
   */
  async get<TPath extends keyof paths, TMethod extends "get", TStatus extends number = 200>(
    path: TPath,
    params?: {
      query?: QueryParams<TPath, TMethod>;
      path?: PathParams<TPath, TMethod>;
    },
  ): Promise<ResponseData<TPath, TMethod, TStatus>> {
    let url = path as string;

    // 경로 파라미터 치환
    if (params?.path) {
      Object.entries(params.path).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value));
      });
    }

    // 쿼리 파라미터 추가
    if (params?.query) {
      const queryParams = new URLSearchParams();
      Object.entries(params.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, String(v)));
          } else if (typeof value === "object") {
            // Pageable 같은 객체는 JSON으로 직렬화
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<ResponseData<TPath, TMethod, TStatus>>(url, {
      method: "GET",
    });
  }

  /**
   * POST 요청
   */
  async post<TPath extends keyof paths, TMethod extends "post", TStatus extends number = 200>(
    path: TPath,
    data?: RequestBody<TPath, TMethod> extends never ? never : RequestBody<TPath, TMethod>,
    params?: {
      path?: PathParams<TPath, TMethod>;
    },
  ): Promise<ResponseData<TPath, TMethod, TStatus>> {
    let url = path as string;

    // 경로 파라미터 치환
    if (params?.path) {
      Object.entries(params.path).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value));
      });
    }

    return this.request<ResponseData<TPath, TMethod, TStatus>>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 요청
   */
  async patch<TPath extends keyof paths, TMethod extends "patch", TStatus extends number = 200>(
    path: TPath,
    data?: RequestBody<TPath, TMethod> extends never ? never : RequestBody<TPath, TMethod>,
    params?: {
      path?: PathParams<TPath, TMethod>;
    },
  ): Promise<ResponseData<TPath, TMethod, TStatus>> {
    let url = path as string;

    // 경로 파라미터 치환
    if (params?.path) {
      Object.entries(params.path).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value));
      });
    }

    return this.request<ResponseData<TPath, TMethod, TStatus>>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<TPath extends keyof paths, TMethod extends "delete", TStatus extends number = 200>(
    path: TPath,
    params?: {
      path?: PathParams<TPath, TMethod>;
    },
  ): Promise<ResponseData<TPath, TMethod, TStatus>> {
    let url = path as string;

    // 경로 파라미터 치환
    if (params?.path) {
      Object.entries(params.path).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, String(value));
      });
    }

    return this.request<ResponseData<TPath, TMethod, TStatus>>(url, {
      method: "DELETE",
    });
  }
}

export const typedApiClient = new TypedApiClient();

// 타입 재사용을 위한 헬퍼 export
export type { paths, components };
