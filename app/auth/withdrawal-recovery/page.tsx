"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";

export default function WithdrawalRecoveryPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      await authApi.sendWithdrawalRecoveryEmail(email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("탈퇴 복구 이메일 전송 실패:", err);

      let errorMessage = "탈퇴 복구 이메일 전송에 실패했습니다.";
      if (err?.message) {
        if (err.message.includes("탈퇴 상태가 아닌")) {
          errorMessage = "탈퇴 상태가 아닌 회원입니다.";
        } else if (err.message.includes("복구 가능 기간")) {
          errorMessage = "복구 가능 기간(30일)이 만료되었습니다.";
        } else if (err.message.includes("찾을 수 없습니다")) {
          errorMessage = "해당하는 회원을 찾을 수 없습니다.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-6">
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
                이메일 전송 완료
              </h2>
              <p className="text-gray-600">
                입력하신 이메일로 탈퇴 복구 링크를 전송했습니다.
                <br />
                이메일을 확인해주세요.
              </p>
            </div>

            <button
              onClick={() => router.push("/login")}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              탈퇴 복구하기
            </h1>
            <p className="text-gray-600 text-sm">
              탈퇴 후 30일 이내라면 계정을 복구할 수 있습니다.
              <br />
              가입 시 사용한 이메일을 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "전송 중..." : "복구 이메일 전송"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← 로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
