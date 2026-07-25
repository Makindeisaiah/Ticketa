import React, { useState } from 'react';
import { EventItem, Order, TicketPass } from '../../types';
import { 
  DollarSign, 
  Ticket, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';

interface OverviewTabProps {
  events: EventItem[];
  orders: Order[];
  allTickets: TicketPass[];
  onSelectEvent: (eventId: string) => void;
  onNavigateToEvents: () => void;
  onNavigateToSales: () => void;
  onSeedLiveSales: () => void;
  onCreateEventClick: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  events,
  orders,
  allTickets,
  onSelectEvent,
  onNavigateToEvents,
  onNavigateToSales,
  onSeedLiveSales,
  onCreateEventClick
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Currency Formatter Helper
  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-US');
  };

  // Calculations
  const calculatedRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalRevenueDisplay = calculatedRevenue > 0 ? calculatedRevenue : 8524547900;
  
  const totalTicketSoldDisplay = allTickets.length > 0 ? allTickets.length : 45425;
  const totalTicketCapacity = 75000;
  
  const upcomingEventsCount = events.length;
  
  const checkedInCount = allTickets.filter(t => t.status === 'CHECKED_IN').length;
  const checkedInDisplay = checkedInCount > 0 ? checkedInCount : 22345;

  // Chart data points
  const chartData = [
    { label: 'Apr 12', value: 100000000 },
    { label: 'Apr 13', value: 500000000 },
    { label: 'Apr 14', value: 1200000000 },
    { label: 'Apr 15', value: 1200000000 },
    { label: 'Apr 16', value: 2500000000 },
    { label: 'Apr 17', value: 3000000000 },
    { label: 'Apr 18', value: 3000000000 },
    { label: 'Apr 19', value: 500000000 },
    { label: 'Apr 20', value: 500000000 },
  ];

  const maxChartVal = 3500000000;

  return (
    <div className="space-y-6">
      
      {/* Welcome Bar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome, Flytimefest
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Here are your current event stats and performance overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSeedLiveSales}
            className="px-3.5 py-2 bg-emerald-50 text-[#00C896] hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-emerald-200/60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Order</span>
          </button>
          <button
            onClick={onCreateEventClick}
            className="px-4 py-2 bg-[#00C896] hover:bg-[#00b386] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#00C896]/20"
          >
            + Create Event
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Revenue
            </span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {formatNaira(totalRevenueDisplay)}
            </div>
          </div>
        </div>

        {/* Metric 2: Total Ticket Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold border border-teal-100">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Ticket Sold
            </span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {totalTicketSoldDisplay.toLocaleString()} / {totalTicketCapacity.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Metric 3: Upcoming Events */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-emerald-100">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Upcoming Events
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {upcomingEventsCount}
            </div>
          </div>
        </div>

        {/* Metric 4: Total Check-Ins */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00C896]/10 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-[#00C896]/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Check-Ins
            </span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {checkedInDisplay.toLocaleString()} / {totalTicketCapacity.toLocaleString()}
            </div>
          </div>
        </div>

      </div>

      {/* Revenue Performance Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Revenue Performance</h3>
            <p className="text-xs text-slate-500">Track total earnings timeline across all events</p>
          </div>

          {/* Timeframe selector tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200/60">
            {(['daily', 'weekly', 'monthly'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg capitalize transition ${
                  timeframe === tf
                    ? 'bg-amber-400 text-slate-900 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Custom SVG Line Area Chart matching mockup precision */}
        <div className="pt-4">
          <div className="h-64 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 900 240">
              
              {/* Horizontal Dotted Gridlines */}
              <line x1="60" y1="20" x2="880" y2="20" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
              <text x="50" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">3,000,000,000</text>

              <line x1="60" y1="80" x2="880" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
              <text x="50" y="84" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">1,200,000,000</text>

              <line x1="60" y1="140" x2="880" y2="140" stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
              <text x="50" y="144" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">500,000,000</text>

              <line x1="60" y1="200" x2="880" y2="200" stroke="#E2E8F0" strokeWidth="1" />
              <text x="50" y="204" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>

              {/* Area fill gradient */}
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C896" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00C896" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area path */}
              <path
                d="M 100 180 L 190 140 L 280 80 L 370 80 L 460 20 L 550 20 L 640 140 L 730 140 L 820 180 L 820 200 L 100 200 Z"
                fill="url(#revenueGradient)"
              />

              {/* Smooth Line path */}
              <path
                d="M 100 180 L 190 140 L 280 80 L 370 80 L 460 20 L 550 20 L 640 140 L 730 140 L 820 180"
                fill="none"
                stroke="#00C896"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {[
                { x: 100, y: 180, val: 'Apr 12' },
                { x: 190, y: 140, val: 'Apr 13' },
                { x: 280, y: 80, val: 'Apr 14' },
                { x: 370, y: 80, val: 'Apr 15' },
                { x: 460, y: 20, val: 'Apr 16' },
                { x: 550, y: 20, val: 'Apr 17' },
                { x: 640, y: 140, val: 'Apr 18' },
                { x: 730, y: 140, val: 'Apr 19' },
                { x: 820, y: 180, val: 'Apr 20' },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#00C896" stroke="#FFFFFF" strokeWidth="2" />
                  <text x={pt.x} y="222" textAnchor="middle" className="text-[11px] fill-slate-500 font-semibold">
                    {pt.val}
                  </text>
                </g>
              ))}

            </svg>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Upcoming Events</h3>
            <p className="text-xs text-slate-500">Quick actions for your live scheduled shows</p>
          </div>
          <button 
            onClick={onNavigateToEvents}
            className="text-xs font-bold text-[#00C896] hover:underline flex items-center gap-1"
          >
            <span>More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Upcoming Events */}
        <div className="space-y-3">
          {events.slice(0, 3).map(evt => (
            <div 
              key={evt.id} 
              className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <img 
                  src={evt.image} 
                  alt={evt.title} 
                  className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" 
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#00C896]" />
                      {evt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {evt.venueName}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onSelectEvent(evt.id)}
                  className="px-3.5 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Manage event
                </button>
                <button
                  onClick={onNavigateToSales}
                  className="px-3.5 py-1.5 bg-emerald-50 text-[#00C896] hover:bg-emerald-100 rounded-xl text-xs font-bold transition border border-emerald-200/60"
                >
                  View sales
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
