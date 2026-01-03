"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Perf = {
  id: string;
  title: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  posterUrl?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [list, setList] = useState<Perf[]>([]);

  useEffect(() => {
    const admin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(admin);
    if (!admin) router.push("/admin/login");

    const stored = localStorage.getItem("admin_performances");
    if (stored) setList(JSON.parse(stored));
  }, [router]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const perf: Perf = {
      id: String(Date.now()),
      title,
      venue,
      startDate,
      endDate,
      posterUrl,
    };
    const next = [perf, ...list];
    setList(next);
    localStorage.setItem("admin_performances", JSON.stringify(next));
    setTitle("");
    setVenue("");
    setStartDate("");
    setEndDate("");
    setPosterUrl("");
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-gray-200 rounded"
          >
            로그아웃
          </button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">공연 생성</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">공연장</label>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded border-gray-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">포스터 URL</label>
            <input
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300"
            />
          </div>
          <div>
            <button className="px-4 py-2 bg-red-600 text-white rounded">
              생성
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">생성된 공연 목록</h2>
        {list.length === 0 ? (
          <div className="text-sm text-gray-500">생성된 공연이 없습니다.</div>
        ) : (
          <ul className="space-y-3">
            {list.map((p) => (
              <li
                key={p.id}
                className="p-3 border rounded flex items-center gap-4"
              >
                <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.posterUrl ? (
                    <img
                      src={p.posterUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-gray-500">{p.venue}</div>
                  <div className="text-sm text-gray-400">
                    {p.startDate} {p.endDate ? `~ ${p.endDate}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
