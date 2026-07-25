import React, { useState } from 'react';
import { EventItem, TicketPass } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  QrCode, 
  UserCheck, 
  ChevronDown, 
  Filter, 
  Smartphone, 
  Scan, 
  Search,
  Sparkles
} from 'lucide-react';

interface CheckInsTabProps {
  events: EventItem[];
  allTickets: TicketPass[];
  onOpenScanner?: () => void;
  onOpenManualCheckIn?: () => void;
}

export const CheckInsTab: React.FC<CheckInsTabProps> = ({
  events,
  allTickets,
  onOpenScanner,
  onOpenManualCheckIn
}) => {
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [timeFilter, setTimeFilter] = useState('10m');
  const [tierFilter, setTierFilter] = useState('all');

  const totalTickets = 20425;
  const checkedInCount = 16692;
  const stillToCheckIn = 3308;
  const checkInRate = 83.5;

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Check-Ins</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Monitor real-time gate entry and manage guest check-ins across all entry points
          </p>
        </div>

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
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold border border-teal-100">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Tickets Sold
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
              20,425
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Checked-In
            </span>
            <div className="text-2xl font-black text-[#00C896] mt-0.5 font-mono">
              16,692
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Still to Check-In
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
              3,308
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold border border-indigo-100">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Check-In Rate
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
              83.5%
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Ticket Type Breakdown & Method Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Type Check-Ins Table (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Ticket Type Check-Ins</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket Type</th>
                  <th className="py-3 px-4">Sold</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { type: 'Regular', sold: '15,652', checked: '12,994', rem: '2,658' },
                  { type: 'VIP', sold: '3,500', checked: '3,257', rem: '243' },
                  { type: 'VVIP', sold: '848', checked: '441', rem: '407' },
                  { type: 'Premium', sold: '280', checked: '180', rem: '100' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.type}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.sold}</td>
                    <td className="py-3.5 px-4 font-mono text-[#00C896] font-bold">{row.checked}</td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-500">{row.rem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Check-In Method Breakdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Check-In Method Breakdown</h3>
          <p className="text-xs text-slate-500">How attendees are checked in</p>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="w-28 h-28 relative shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeDasharray="82, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  strokeDasharray="18, 100"
                  strokeDashoffset="-82"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900">
                82%
              </div>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-700 flex-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> QR Scan
                </span>
                <span className="font-mono text-slate-900">82% (13,680)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Manual
                </span>
                <span className="font-mono text-slate-900">18% (3,012)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Live Check-In Activity Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Live Check-In Activity</h3>
            <p className="text-xs text-slate-500">Real-time gate pass verification feed</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="10m">Last 10 minutes</option>
              <option value="1h">Last 1 hour</option>
              <option value="all">All Day</option>
            </select>

            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Ticket Types</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="VVIP">VVIP</option>
            </select>

            <button
              onClick={onOpenScanner}
              className="px-3.5 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Scan QR Code</span>
            </button>

            <button
              onClick={onOpenManualCheckIn}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manual</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Ticket Type</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Time Checked-In</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Adebayo Johnson', type: 'VIP', method: 'QR Scan', time: '5:45 PM', status: 'Checked-In' },
                { name: 'Blessing Okoro', type: 'Regular', method: 'QR Scan', time: '6:00 PM', status: 'Checked-In' },
                { name: 'Daniel Musa', type: 'VVIP', method: 'Manual', time: '6:10 PM', status: 'Checked-In' },
                { name: 'Elena Rostova', type: 'VIP', method: 'QR Scan', time: '6:12 PM', status: 'Checked-In' },
                { name: 'Chloe Bennet', type: 'Regular', method: 'QR Scan', time: '6:15 PM', status: 'Checked-In' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                  <td className="py-3 px-4 text-slate-600">{row.type}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.method}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{row.time}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-[#00C896] rounded-full text-[10px] font-extrabold uppercase">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
