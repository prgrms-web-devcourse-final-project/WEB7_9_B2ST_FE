"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminTokenManager } from "@/lib/auth/token";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) {
      router.push("/admin/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    // 관리자 토큰 및 상태 모두 제거
    adminTokenManager.clearTokens();
    router.push("/");
  };

  if (!isAdmin) return null;

  const menuItems = [
    {
      title: "공연 관리",
      description: "공연 생성, 조회, 수정",
      icon: "🎭",
      path: "/admin/performances",
    },
    {
      title: "로그인 로그",
      description: "로그인 시도 내역 조회",
      icon: "📊",
      path: "/admin/login-logs",
    },
    {
      title: "구역 등록",
      description: "공연장 구역 정보 등록",
      icon: "🏛️",
      path: "/admin/venues/sections",
    },
    {
      title: "좌석 등록",
      description: "공연장 좌석 정보 등록",
      icon: "🎟️",
      path: "/admin/venues/seats",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              관리자 대시보드
            </h1>
            <p className="mt-2 text-gray-600">시스템 관리 기능</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            로그아웃
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-gray-200 hover:border-red-300"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
