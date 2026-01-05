"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginContent() {
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

  // 카카오 로그인 중복 호출 방지
  const isProcessingKakaoLogin = useRef(false);

  const handleKakaoCallback = useCallback(
    async (code: string, state: string) => {
      setError("");
      setIsKakaoLoading(true);

      try {
        await kakaoLogin({ code, state });

        setTimeout(() => {
          const redirectTo = searchParams.get("from") || "/";
          router.push(redirectTo);
        }, 100);
      } catch (err) {
        console.error("❌ 카카오 로그인 오류", err);
        setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsKakaoLoading(false);
        isProcessingKakaoLogin.current = false;
      }
    },
    [kakaoLogin, router, searchParams]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
      const redirectTo = searchParams.get("from") || "/";
      router.push(redirectTo);
    } catch (err) {
      console.error("❌ 로그인 실패", err);
      setError("이메일 또는 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLoginClick = async () => {
    if (isProcessingKakaoLogin.current) return;

    setError("");
    setIsKakaoLoading(true);
    isProcessingKakaoLogin.current = true;

    try {
      const response = await getKakaoAuthorizeUrl();
      window.location.href = response.authorizeUrl;
    } catch (err) {
      console.error("❌ 카카오 로그인 URL 생성 실패", err);
      setError("카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      isProcessingKakaoLogin.current = false;
      setIsKakaoLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state && !isProcessingKakaoLogin.current) {
      isProcessingKakaoLogin.current = true;
      handleKakaoCallback(code, state);
    }
  }, [handleKakaoCallback, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10 items-start">
        {/* 서비스 소개 패널 */}
        <div className="lg:col-span-2 bg-gray-900 text-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
          <div>
            <p className="text-sm text-gray-300 mb-2">
              Doncrytt Ticket Platform
            </p>
            <h2 className="text-3xl font-bold leading-tight">
              일반 · 추첨 · 사전신청을 한 번에 지원하는 공연 플랫폼
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-semibold">비로그인 탐색 가능</p>
                <p className="text-sm text-gray-300">
                  서비스 소개와 공연 목록은 누구나 볼 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-semibold">로그인 후 기능 해제</p>
                <p className="text-sm text-gray-300">
                  양도/교환, 마이페이지, 응모/사전신청 관리에 접근합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-semibold">이전 페이지로 복귀</p>
                <p className="text-sm text-gray-300">
                  로그인 완료 후 직전 경로로 돌아가 작업을 이어갑니다.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <p className="text-xs text-gray-300 mb-1">예매 타입</p>
              <p className="font-semibold">일반 · 추첨 · 사전신청</p>
              <p className="text-xs text-gray-400 mt-1">각 타입별 안내 제공</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <p className="text-xs text-gray-300 mb-1">양도/교환</p>
              <p className="font-semibold">로그인 후 이용</p>
              <p className="text-xs text-gray-400 mt-1">
                마이페이지에서 상태 확인
              </p>
            </div>
          </div>
        </div>

        {/* 로그인 폼 */}
        <div className="lg:col-span-3">
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

            <div className="mt-4 text-center">
              <Link
                href="/auth/withdrawal-recovery"
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                탈퇴 복구하기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
