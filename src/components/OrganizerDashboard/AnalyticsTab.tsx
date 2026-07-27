import React, { useState } from 'react';
import { EventItem, Order, TicketPass } from '../../types';
import { 
  DollarSign, 
  Ticket, 
  TrendingUp, 
  RefreshCw, 
  ChevronDown, 
  Share2, 
  Globe, 
  Smartphone, 
  QrCode, 
  Search,
  Instagram,
  MessageCircle,
  Twitter,
  CreditCard
} from 'lucide-react';

interface AnalyticsTabProps {
  events: EventItem[];
  orders?: Order[];
  allTickets?: TicketPass[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ events, orders = [], allTickets = [] }) => {
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-US');
  };

  const targetOrders = selectedEvent === 'all' 
    ? orders 
    : orders.filter(o => o.eventId === selectedEvent);

  const targetTickets = selectedEvent === 'all'
    ? allTickets
    : allTickets.filter(t => t.eventId === selectedEvent);

  const targetCapacity = selectedEvent === 'all'
    ? events.reduce((acc, e) => acc + e.ticketTiers.reduce((s, t) => s + t.availableQuantity, 0), 0)
    : (events.find(e => e.id === selectedEvent)?.ticketTiers.reduce((s, t) => s + t.availableQuantity, 0) || 0);

  const totalRevenue = targetOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const ticketsRemaining = Math.max(0, targetCapacity - targetTickets.length);
  const conversionRate = targetTickets.length > 0 ? ((targetTickets.length / (targetCapacity || 1)) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics Overview</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Track your event performance, sales, and buyer traffic sources
          </p>
        </div>

        {/* Event Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-[#00C896] text-white font-extrabold text-xs rounded-xl border-none outline-none cursor-pointer pr-8 appearance-none shadow-md shadow-[#00C896]/20"
          >
            <option value="all">All Events</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Revenue
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              {formatNaira(totalRevenue)}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold border border-teal-100">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Tickets Sold / Remaining
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              {targetTickets.length.toLocaleString()} / {ticketsRemaining.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold border border-indigo-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Conversion Rate
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {conversionRate}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold border border-rose-100">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Refund Issued
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              ₦ 0
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Revenue Performance & Traffic Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-900">Revenue Performance</h3>
            <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200/60">
              {(['daily', 'weekly', 'monthly'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg capitalize transition ${
                    timeframe === tf
                      ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 220">
              {/* Gridlines */}
              <line x1="60" y1="20" x2="680" y2="20" stroke="#E2E8F0" strokeDasharray="4 4" />
              <text x="50" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">3,000,000,000</text>

              <line x1="60" y1="80" x2="680" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
              <text x="50" y="84" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">1,200,000,000</text>

              <line x1="60" y1="140" x2="680" y2="140" stroke="#E2E8F0" strokeDasharray="4 4" />
              <text x="50" y="144" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">500,000,000</text>

              <line x1="60" y1="190" x2="680" y2="190" stroke="#E2E8F0" />
              <text x="50" y="194" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>

              {/* Area */}
              <path
                d="M 100 180 L 210 140 L 320 80 L 430 80 L 540 20 L 650 20 L 650 190 L 100 190 Z"
                fill="url(#revGrad2)"
              />
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C896" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00C896" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Line */}
              <path
                d="M 100 180 L 210 140 L 320 80 L 430 80 L 540 20 L 650 20"
                fill="none"
                stroke="#00C896"
                strokeWidth="3"
              />

              {/* Points */}
              {[
                { x: 100, y: 180, label: 'Apr 12' },
                { x: 210, y: 140, label: 'Apr 13' },
                { x: 320, y: 80, label: 'Apr 14' },
                { x: 430, y: 80, label: 'Apr 15' },
                { x: 540, y: 20, label: 'Apr 16' },
                { x: 650, y: 20, label: 'Apr 17' },
              ].map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#00C896" stroke="#FFFFFF" strokeWidth="2" />
                  <text x={p.x} y="210" textAnchor="middle" className="text-[10px] fill-slate-500 font-semibold">{p.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right Traffic Source Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Traffic Source</h3>
          
          <div className="space-y-3.5 pt-1">
            {[
              { name: 'Direct Link', pct: '30%', icon: <Globe className="w-4 h-4 text-slate-500" /> },
              { name: 'Social Media', pct: '28%', icon: <Share2 className="w-4 h-4 text-blue-500" /> },
              { name: 'QR Code', pct: '28%', icon: <QrCode className="w-4 h-4 text-emerald-500" /> },
              { name: 'Search', pct: '28%', icon: <Search className="w-4 h-4 text-amber-500" /> },
            ].map((ts, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2.5">
                  {ts.icon}
                  <span>{ts.name}</span>
                </div>
                <span className="font-mono text-[#00C896]">{ts.pct}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Ticket Performance by Type & Social/Payment Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Performance by Type Table (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Ticket Performance by Type</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket Type</th>
                  <th className="py-3 px-4">Sold</th>
                  <th className="py-3 px-4 w-48">Progress</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { type: 'Regular', sold: '13,600', pct: 85, rem: '2,400', rev: '#535,000.00' },
                  { type: 'VIP', sold: '3,797', pct: 75, rem: '203', rev: '#252,000.00' },
                  { type: 'VVIP', sold: '1,235', pct: 60, rem: '65', rev: '#150,000.00' },
                  { type: 'Premium', sold: '100', pct: 95, rem: '10', rev: '#180,000.00' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.type}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{row.sold}</td>
                    <td className="py-3 px-4">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00C896] rounded-full" style={{ width: `${row.pct}%` }}></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{row.rem}</td>
                    <td className="py-3 px-4 font-mono text-right font-bold text-slate-900">{row.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Stack: Social Channels + Payment Method Used Donut */}
        <div className="space-y-6">
          
          {/* Orders & Buyers Social Channels */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900">Orders & Buyers</h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 p-2 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-2 text-pink-600">
                  <Instagram className="w-4 h-4" /> Instagram
                </span>
                <span className="font-mono text-slate-900">30%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 p-2 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-2 text-emerald-600">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </span>
                <span className="font-mono text-slate-900">25%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 p-2 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-2 text-sky-500">
                  <Twitter className="w-4 h-4" /> X (Twitter)
                </span>
                <span className="font-mono text-slate-900">10%</span>
              </div>
            </div>
          </div>

          {/* Payment Method Used Donut Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Payment Method Used</h3>
            
            <div className="flex items-center justify-between gap-4">
              {/* Donut SVG */}
              <div className="w-28 h-28 relative shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Segment 1: Card 55% */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#00C896"
                    strokeWidth="4"
                    strokeDasharray="55, 100"
                  />
                  {/* Segment 2: Bank Transfer 38% */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    strokeDasharray="38, 100"
                    strokeDashoffset="-55"
                  />
                  {/* Segment 3: USSD */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="4"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-93"
                  />
                </svg>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs font-bold text-slate-700 flex-1">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C896]"></span> Card
                  </span>
                  <span className="font-mono text-slate-900">55%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Bank Transfer
                  </span>
                  <span className="font-mono text-slate-900">38%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> USSD
                  </span>
                  <span className="font-mono text-slate-900">65%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
