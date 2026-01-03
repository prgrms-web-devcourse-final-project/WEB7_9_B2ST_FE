"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  prereservationApi,
  type PrereservationSection,
} from "@/lib/api/prereservation";

interface PrereservationModalProps {
  scheduleId: number;
  onClose: () => void;
}

export default function PrereservationModal({
  scheduleId,
  onClose,
}: PrereservationModalProps) {
  const router = useRouter();
  const [sections, setSections] = useState<PrereservationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadSections();
  }, [scheduleId]);

  const loadSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await prereservationApi.getPrereservationSections(
        scheduleId
      );
      if (response.data) {
        setSections(response.data);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "구역 정보를 불러오는데 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (sectionId: number) => {
    setIsApplying(true);
    setError(null);
    try {
      await prereservationApi.createPrereservationApplication(
        scheduleId,
        sectionId
      );
      alert("신청이 완료되었습니다.");
      await loadSections();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "신청에 실패했습니다";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">예매 사전 신청</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            예매 오픈 24시간 전부터 원하는 구역을 사전 신청할 수 있습니다.
          </p>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              신청 가능한 구역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.sectionId}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {section.sectionName} 구역
                    </h3>
                    <p className="text-sm text-gray-600">
                      예매 시간: {section.bookingStartAt} ~{" "}
                      {section.bookingEndAt}
                    </p>
                  </div>
                  <div>
                    {section.applied ? (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                        신청 완료
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(section.sectionId)}
                        disabled={isApplying}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                      >
                        {isApplying ? "신청 중..." : "신청하기"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
