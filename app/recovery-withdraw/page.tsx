"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";

function RecoveryWithdrawContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("복구 토큰이 없습니다.");
      return;
    }

    const confirmRecovery = async () => {
      try {
        console.log("탈퇴 복구 확인 시작:", token);
        await authApi.confirmRecovery(token);
        setStatus("success");
        setMessage("계정이 성공적으로 복구되었습니다!");
      } catch (err: any) {
        console.error("탈퇴 복구 확인 실패:", err);

        let errorMessage = "계정 복구에 실패했습니다.";
        if (err?.message) {
          if (err.message.includes("유효하지 않거나 만료")) {
            errorMessage = "복구 토큰이 유효하지 않거나 만료되었습니다.";
          } else if (err.message.includes("찾을 수 없습니다")) {
            errorMessage = "해당하는 회원을 찾을 수 없습니다.";
          } else {
            errorMessage = err.message;
          }
        }

        setStatus("error");
        setMessage(errorMessage);
      }
    };

    confirmRecovery();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {status === "loading" && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                계정 복구 중...
              </h2>
              <p className="text-gray-600">잠시만 기다려주세요.</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                복구 완료!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push("/login")}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                로그인하기
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                복구 실패
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/auth/withdrawal-recovery")}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  다시 시도하기
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  로그인 페이지로
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecoveryWithdrawPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <RecoveryWithdrawContent />
    </Suspense>
  );
}
