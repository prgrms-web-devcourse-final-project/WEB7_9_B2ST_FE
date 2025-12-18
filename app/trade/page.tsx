'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<'exchange' | 'transfer'>('exchange');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ticketCount, setTicketCount] = useState('');

  // 더미 데이터
  const tickets = [
    { id: 1, performance: '아이유 콘서트', date: '2025.01.15', section: 'VIP석', row: 'A', seat: '10', price: '250,000원', type: 'exchange' },
    { id: 2, performance: '레미제라블', date: '2025.01.20', section: 'R석', row: 'B', seat: '5', price: '200,000원', type: 'transfer' },
    { id: 3, performance: 'BTS 콘서트', date: '2025.02.01', section: 'S석', row: 'C', seat: '12', price: '180,000원', type: 'exchange' },
  ];

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'exchange' && ticket.type !== 'exchange') return false;
    if (activeTab === 'transfer' && ticket.type !== 'transfer') return false;
    if (searchQuery && !ticket.performance.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">티켓 교환/양도</h1>
            <Link
              href="/trade/register/step1"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              티켓 등록
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left: Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">필터</h2>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">공연 검색</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="공연명 검색"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">구역</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">전체</option>
                    <option value="vip">VIP석</option>
                    <option value="r">R석</option>
                    <option value="s">S석</option>
                    <option value="a">A석</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      placeholder="최소"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      placeholder="최대"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Ticket Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">매수</label>
                  <input
                    type="number"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(e.target.value)}
                    placeholder="매수"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Ticket List */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('exchange')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'exchange'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  교환 찾기
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'transfer'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  양도 구매
                </button>
              </div>
            </div>

            {/* Ticket Cards */}
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.performance}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>날짜: {ticket.date}</p>
                        <p>구역: {ticket.section}</p>
                        {activeTab === 'exchange' && (
                          <p>좌석: {ticket.row}-{ticket.seat}</p>
                        )}
                        {activeTab === 'transfer' && (
                          <p>열: {ticket.row}열</p>
                        )}
                        <p className="text-purple-600 font-semibold text-base">가격: {ticket.price}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.type === 'exchange'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.type === 'exchange' ? '교환' : '양도'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

