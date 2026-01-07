"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false); // prevent duplicate handling

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      // 카카오 인증 오류 처리
      console.error("카카오 인증 오류:", error, errorDescription);

      // 연동인지 로그인인지 확인
      const isKakaoLink = sessionStorage.getItem("isKakaoLink") === "true";
      sessionStorage.removeItem("isKakaoLink");

      if (isKakaoLink) {
        router.push(`/my-page?error=${encodeURIComponent(error)}`);
      } else {
        router.push(`/login?error=${encodeURIComponent(error)}`);
      }
    } else if (code && state) {
      // 연동인지 로그인인지 확인
      const isKakaoLink = sessionStorage.getItem("isKakaoLink") === "true";

      if (isKakaoLink) {
        // 카카오 계정 연동: /auth/kakao/link/callback으로 리다이렉트
        console.log("🔗 카카오 연동 콜백 처리");
        sessionStorage.removeItem("isKakaoLink");
        router.push(`/auth/kakao/link/callback?code=${code}&state=${state}`);
      } else {
        // 카카오 로그인: 로그인 페이지로 리다이렉트
        console.log("🔑 카카오 로그인 콜백 처리");
        router.push(`/login?code=${code}&state=${state}`);
      }
    } else {
      // 필수 파라미터 누락
      const isKakaoLink = sessionStorage.getItem("isKakaoLink") === "true";
      sessionStorage.removeItem("isKakaoLink");

      if (isKakaoLink) {
        router.push("/my-page?error=invalid_callback");
      } else {
        router.push("/login?error=invalid_callback");
      }
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          카카오 인증 처리 중...
        </h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
