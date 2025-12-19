// 개발 환경에서 프록시 사용 여부 (CORS 우회)
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === 'true';

// 개발 환경에서는 HTTP/IP 사용, 프로덕션에서는 HTTPS 도메인 사용
// 프록시를 사용하는 경우 상대 경로 사용
const API_BASE_URL = USE_PROXY 
  ? '' // 프록시 사용 시 상대 경로
  : (process.env.NEXT_PUBLIC_API_BASE_URL || 
    (process.env.NODE_ENV === 'development' 
      ? 'http://15.165.115.135:8080' 
      : 'https://api.b2st.doncrytt.online'));

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

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 토큰이 있으면 헤더에 추가
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const jsonData = await response.json();

      if (!response.ok) {
        // 401 에러 시 토큰 재발급 시도 (나중에 구현)
        if (response.status === 401) {
          // TODO: 토큰 재발급 로직 추가
        }
        
        // 에러 응답 형식 처리 (code와 message가 있는 경우)
        if ('message' in jsonData) {
          throw new Error(jsonData.message || '요청에 실패했습니다.');
        }
        throw new Error('요청에 실패했습니다.');
      }

      // 성공 응답 형식 처리
      // 형식 1: { code, message, data }
      if ('code' in jsonData && 'data' in jsonData) {
        return jsonData as ApiResponse<T>;
      }
      
      // 형식 2: { data: T } (티켓 교환 API 등)
      if ('data' in jsonData) {
        return {
          code: response.status,
          message: '성공적으로 처리되었습니다',
          data: jsonData.data as T,
        };
      }

      // 형식 3: 직접 데이터 (배열 등)
      return {
        code: response.status,
        message: '성공적으로 처리되었습니다',
        data: jsonData as T,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient();

