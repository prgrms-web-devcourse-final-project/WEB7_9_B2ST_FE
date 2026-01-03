"use client";

import { Suspense } from "react";
import KakaoCallbackContent from "@/app/auth/kakao/callback/KakaoCallbackContent";

/**
 * 카카오 로그인 콜백 페이지
 * 카카오 OAuth에서 리다이렉트되는 페이지입니다.
 */
export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              카카오 로그인 처리 중...
            </h1>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </div>
        </div>
      }
    >
      <KakaoCallbackContent />
    </Suspense>
  );
}
