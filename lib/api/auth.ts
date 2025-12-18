import { apiClient, type LoginResponse, type ReissueResponse } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ReissueRequest {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest) {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    return response;
  },

  /**
   * 토큰 재발급
   */
  async reissue(tokens: ReissueRequest) {
    const response = await apiClient.post<ReissueResponse>('/api/auth/reissue', tokens);
    return response;
  },

  /**
   * 로그아웃
   */
  async logout() {
    const response = await apiClient.post<null>('/api/auth/logout');
    return response;
  },
};

