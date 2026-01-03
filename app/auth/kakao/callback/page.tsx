"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * 카카오 로그인 콜백 페이지
 * 카카오 OAuth에서 리다이렉트되는 페이지입니다.
 * 이 페이지는 로그인/회원가입 페이지로 다시 리다이렉트합니다.
 */
export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      // 카카오 인증 오류 처리
      console.error("카카오 로그인 오류:", error, errorDescription);
      router.push(`/login?error=${encodeURIComponent(error)}`);
    } else if (code && state) {
      // 정상적인 콜백: 로그인 페이지로 리다이렉트
      router.push(`/login?code=${code}&state=${state}`);
    } else {
      // 필수 파라미터 누락
      router.push("/login?error=invalid_callback");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          카카오 로그인 처리 중...
        </h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
