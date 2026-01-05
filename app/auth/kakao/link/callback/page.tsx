"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function KakaoLinkCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { linkKakao } = useAuth();
  const isProcessing = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state && !isProcessing.current) {
      isProcessing.current = true;

      const handleLink = async () => {
        try {
          console.log("🔵 카카오 연동 콜백 처리 시작");
          await linkKakao({ code, state });

          alert("카카오 계정이 성공적으로 연동되었습니다.");
          router.push("/my-page");
        } catch (err) {
          console.error("❌ 카카오 연동 실패:", err);

          let errorMessage = "카카오 연동에 실패했습니다.";
          if (err instanceof Error) {
            if (err.message.includes("409")) {
              errorMessage = "이미 다른 계정에 연동된 소셜 계정입니다.";
            } else if (err.message.includes("404")) {
              errorMessage = "해당하는 회원을 찾을 수 없습니다.";
            } else if (err.message.includes("401")) {
              errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
            } else {
              errorMessage = err.message;
            }
          }

          alert(errorMessage);
          router.push("/my-page");
        }
      };

      handleLink();
    }
  }, [searchParams, linkKakao, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">카카오 계정 연동 중...</p>
      </div>
    </div>
  );
}

export default function KakaoLinkCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <KakaoLinkCallbackContent />
    </Suspense>
  );
}
