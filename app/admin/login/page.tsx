"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { adminTokenManager } from "@/lib/auth/token";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      console.log("[Admin Login] 로그인 응답:", response);

      // authApi.login()은 { code, message, data } 구조로 반환됨
      const tokenData = response.data;

      console.log("[Admin Login] 토큰 데이터:", {
        hasAccessToken: !!tokenData?.accessToken,
        accessTokenPreview: tokenData?.accessToken
          ? `${tokenData.accessToken.substring(0, 20)}...`
          : "none",
      });

      // 관리자 전용 토큰 저장소에 저장
      if (tokenData?.accessToken) {
        adminTokenManager.setAccessToken(tokenData.accessToken);
        console.log("[Admin Login] adminAccessToken 저장됨");
      }

      // 저장 확인
      const savedToken = adminTokenManager.getAccessToken();
      console.log("[Admin Login] 저장된 토큰 확인:", {
        hasSavedToken: !!savedToken,
        savedTokenPreview: savedToken
          ? `${savedToken.substring(0, 20)}...`
          : "none",
      });

      localStorage.setItem("isAdmin", "true");
      router.push("/admin");
    } catch (err: any) {
      setError(err?.response?.data?.message || "로그인에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-4">관리자 로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border"
            required
            disabled={isLoading}
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </form>
    </div>
  );
}
