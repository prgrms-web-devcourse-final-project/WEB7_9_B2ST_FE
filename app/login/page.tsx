"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, getKakaoAuthorizeUrl, kakaoLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

  const handleKakaoCallback = useCallback(
    async (code: string, state: string) => {
      setError("");
      setIsKakaoLoading(true);

      try {
        await kakaoLogin({ code });
        router.push("/");
      } catch (err) {
        if (err instanceof Error) {
          // 이메일 정보 미동의 시 처리
          if (err.message.includes("이메일 정보 제공에 동의")) {
            setError(
              "이메일 정보 제공에 동의해주세요. 카카오 계정 설정에서 동의 후 다시 시도해주세요."
            );
          } else {
            setError(err.message);
          }
        } else {
          setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
        }
        setIsKakaoLoading(false);
      }
    },
    [kakaoLogin, router]
  );

  // 카카오 로그인 콜백 처리
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      handleKakaoCallback(code, state);
    }
  }, [searchParams, handleKakaoCallback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData);
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
      setIsLoading(false);
      // 에러 발생 시 새로고침하지 않고 에러 상태 유지
    }
  };

  const handleKakaoLoginClick = async () => {
    setError("");
    setIsKakaoLoading(true);

    try {
      // 백엔드에서 카카오 로그인 URL 조회
      const urlResponse = await getKakaoAuthorizeUrl();
      // 카카오 로그인 페이지로 리다이렉트
      window.location.href = urlResponse.authorizeUrl;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("카카오 로그인 처리 중 오류가 발생했습니다.");
      }
      setIsKakaoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/doncrytt-logo2.png"
              alt="doncrytt 로고"
              width={200}
              height={80}
              className="h-16 w-auto mx-auto"
              priority
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
          <p className="mt-2 text-sm text-gray-600">
            또는{" "}
            <Link
              href="/signup"
              className="font-semibold text-red-600 hover:text-red-700"
            >
              회원가입
            </Link>
          </p>
        </div>
        <form
          className="bg-white rounded-xl shadow-lg p-8"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="이메일 주소"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="비밀번호"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || isKakaoLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleKakaoLoginClick}
              disabled={isLoading || isKakaoLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-yellow-400 text-sm font-bold rounded-lg text-gray-800 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isKakaoLoading ? "카카오 로그인 중..." : "카카오로 로그인"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
