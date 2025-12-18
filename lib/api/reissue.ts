import { authApi } from './auth';
import { tokenManager } from '@/lib/auth/token';

/**
 * 토큰 재발급 로직
 * Access Token이 만료되었을 때 자동으로 재발급
 */
export async function reissueToken(): Promise<boolean> {
  const accessToken = tokenManager.getAccessToken();
  const refreshToken = tokenManager.getRefreshToken();

  if (!accessToken || !refreshToken) {
    return false;
  }

  try {
    const response = await authApi.reissue({
      accessToken,
      refreshToken,
    });

    if (response.data) {
      tokenManager.setAccessToken(response.data.accessToken);
      tokenManager.setRefreshToken(response.data.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    // 재발급 실패 시 토큰 제거
    tokenManager.clearTokens();
    return false;
  }
}

