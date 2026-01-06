"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header activeTab="landing" />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"
            style={{ animation: "blob 7s infinite" }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"
            style={{ animation: "blob 7s infinite 2s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            티켓팅 이제 울지 마세요
          </h1>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-300 mb-6">
            모두에게 공정한 예매서비스
          </p>
          <div className="text-6xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-500 mb-8">
            TT
          </div>
          <p className="text-base sm:text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            추첨 응모와 구역별 사전 등록, 선착순 예매로
            <br />
            모두에게 공정한 티켓팅 서비스를 제공합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("service")}
              className="px-8 py-4 rounded-full font-bold text-white bg-slate-700/50 backdrop-blur hover:bg-slate-600 transition-colors border border-slate-500/50"
            >
              서비스 소개
            </button>
            <Link
              href="/ticket"
              className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg text-center"
            >
              예매하러 가기
            </Link>
            <button
              onClick={() => scrollToSection("booking-methods")}
              className="px-8 py-4 rounded-full font-bold text-white bg-slate-700/50 backdrop-blur hover:bg-slate-600 transition-colors border border-slate-500/50"
            >
              예매방식안내
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <svg
            className="w-6 h-6 text-gray-400 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Service Introduction Section */}
      <section id="service" className="py-20 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              서비스 소개
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors group">
              <h3 className="text-2xl font-bold text-white mb-4">
                공정한 티켓팅
              </h3>
              <p className="text-gray-300 leading-relaxed">
                추첨 예매/구역별 사전 등록/일반 선착순 예매 3가지 경험을
                제공합니다.
                <br />
                <br />
                공연 특성과 수요에 맞는 방식으로 기회를 분산하고, 규칙을
                투명하게 공개해 납득 가능한 예매를 만듭니다.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-pink-500/50 transition-colors group">
              <h3 className="text-2xl font-bold text-white mb-4">
                교환/양도 서비스
              </h3>
              <p className="text-gray-300 leading-relaxed">
                예매 후 일정 변경, 동행 취소 등으로 티켓을 사용하기 어려워졌을
                때 외부 플랫폼을 거치지 않고 서비스 내에서 정가로 교환·양도를 한
                번에 진행할 수 있도록 지원합니다.
                <br />
                <br />
                프리미엄 거래를 차단해 가격 왜곡과 불공정 거래를 줄이고, 필요한
                사람에게 티켓이 정상적으로 돌아가도록 돕습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Methods Section */}
      <section
        id="booking-methods"
        className="py-20 bg-gradient-to-b from-slate-900 to-slate-950"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              예매 방식 3가지
            </h2>
          </div>

          <div className="space-y-8">
            {/* Method 1 */}
            <div className="flex flex-col lg:flex-row gap-8 items-center bg-slate-900/30 backdrop-blur p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  일반 예매
                </h3>
                <p className="text-gray-300">
                  오픈 시간에 선착순으로 좌석을 선택·결제하는 가장 익숙한
                  방식입니다.
                  <br />
                  대기열/트래픽 제어로 접속 폭주 상황에서도 안정적인 예매 경험을
                  제공합니다.
                </p>
              </div>
            </div>

            {/* Method 2 */}
            <div className="flex flex-col lg:flex-row-reverse gap-8 items-center bg-slate-900/30 backdrop-blur p-8 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  추첨 예매
                </h3>
                <p className="text-gray-300">
                  클릭 경쟁 대신, 정해진 응모 기간 동안 신청하고 무작위 추첨으로
                  당첨자를 선정합니다.
                  <br />
                  매크로·순간 트래픽 영향을 줄여 기회를 더 공정하게 분배합니다.
                </p>
              </div>
            </div>

            {/* Method 3 */}
            <div className="flex flex-col lg:flex-row gap-8 items-center bg-slate-900/30 backdrop-blur p-8 rounded-2xl border border-slate-700/50 hover:border-pink-500/50 transition-colors">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  구역별 사전 신청 예매
                </h3>
                <p className="text-gray-300">
                  예매 전에 원하는 구역을 미리 등록해두고, 특정 시간에 해당 구역
                  기준으로 예매가 진행됩니다.
                  <br />
                  좌석 탐색 시간을 줄이고, 인기 구역 경쟁에서도 혼선을
                  최소화합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            공정한 티켓팅, 지금 시작하세요
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            더 이상 티켓팅에 울지 않아도 됩니다.
            <br />
            TT와 함께 새로운 예매 경험을 만나보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg"
            >
              회원가입
            </Link>
            <Link
              href="/ticket"
              className="px-8 py-4 rounded-full font-bold text-white bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600"
            >
              공연 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">TT</h4>
              <p className="text-gray-400 text-sm">
                모두에게 공정한 티켓팅 서비스를 제공합니다.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/ticket"
                    className="text-gray-400 hover:text-white"
                  >
                    공연 찾기
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trade"
                    className="text-gray-400 hover:text-white"
                  >
                    티켓 양도
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    공지사항
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">법적사항</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © 2026 TT - Fair Ticketing Service. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
