import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "doncrytt - 공연 예약 및 양도 서비스",
  description: "공연 티켓 예약과 양도를 한 곳에서 간편하게",
  icons: {
    icon: "/doncrytt-logo2.png",
    apple: "/doncrytt-logo2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
