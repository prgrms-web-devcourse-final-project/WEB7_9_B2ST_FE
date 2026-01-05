import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 환경에서 CORS 우회를 위한 rewrites 설정
  async rewrites() {
    // 개발 환경에서만 프록시 사용
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: `${
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            "https://api.b2st.doncrytt.online"
          }/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
