"use client";

import { Suspense } from "react";
import SignupContent from "@/app/signup/SignupContent";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
