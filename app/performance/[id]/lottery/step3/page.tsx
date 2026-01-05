"use client";

import { useEffect, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// 결제 단계는 제거되었으므로 접근 시 2단계로 리다이렉트
export default function LotteryStep3({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryString = searchParams.toString();

  useEffect(() => {
    router.replace(
      `/performance/${id}/lottery/step2${queryString ? `?${queryString}` : ""}`
    );
  }, [id, router, queryString]);

  return null;
}
