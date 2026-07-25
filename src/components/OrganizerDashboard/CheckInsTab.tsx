import React, { useState } from 'react';
import { EventItem, TicketPass } from '../../types';
import { useEventContext } from '../../context/EventContext';
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
  Sparkles,
  Ticket
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
  const { scanAndCheckInTicket } = useEventContext();
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute stats dynamically from allTickets
  const filteredTicketsByEvent = selectedEvent === 'all'
    ? allTickets
    : allTickets.filter(t => t.eventId === selectedEvent);

  const totalTickets = filteredTicketsByEvent.length;
  const checkedInCount = filteredTicketsByEvent.filter(t => t.status === 'CHECKED_IN').length;
  const stillToCheckIn = Math.max(0, totalTickets - checkedInCount);
  const checkInRate = totalTickets > 0 ? ((checkedInCount / totalTickets) * 100).toFixed(1) : '0.0';

  // Compute breakdown by ticket tier
  const tierBreakdownMap = new Map<string, { sold: number; checked: number }>();
  filteredTicketsByEvent.forEach(tk => {
    const tier = tk.tierName || 'Regular';
    const curr = tierBreakdownMap.get(tier) || { sold: 0, checked: 0 };
    curr.sold += 1;
    if (tk.status === 'CHECKED_IN') curr.checked += 1;
    tierBreakdownMap.set(tier, curr);
  });

  const tierRows = Array.from(tierBreakdownMap.entries()).map(([tier, data]) => ({
    type: tier,
    sold: data.sold,
    checked: data.checked,
    rem: data.sold - data.checked,
  }));

  // Filtered tickets feed
  const displayTicketsFeed = filteredTicketsByEvent.filter(tk => {
    if (tierFilter !== 'all' && tk.tierName.toLowerCase() !== tierFilter.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tk.attendeeName.toLowerCase().includes(q) ||
      tk.attendeeEmail.toLowerCase().includes(q) ||
      tk.ticketCode.toLowerCase().includes(q)
    );
  });

  const handleQuickCheckIn = (code: string) => {
    scanAndCheckInTicket(code, 'Organizer Portal');
  };

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

        <div className="flex items-center space-x-2">
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
              {totalTickets.toLocaleString()}
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
              {checkedInCount.toLocaleString()}
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
              {stillToCheckIn.toLocaleString()}
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
              {checkInRate}%
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
                  <th className="py-3 px-4">Checked-In</th>
                  <th className="py-3 px-4 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tierRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      No ticket tiers found.
                    </td>
                  </tr>
                ) : (
                  tierRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.type}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{row.sold}</td>
                      <td className="py-3.5 px-4 font-mono text-[#00C896] font-bold">{row.checked}</td>
                      <td className="py-3.5 px-4 font-mono text-right text-slate-500">{row.rem}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Check-In Method Breakdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Check-In Method Breakdown</h3>
          <p className="text-xs text-slate-500">Gate verification protocol summary</p>

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
                {checkInRate}%
              </div>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-700 flex-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> QR Scanner
                </span>
                <span className="font-mono text-slate-900">{checkedInCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Manual Search
                </span>
                <span className="font-mono text-slate-900">{stillToCheckIn} pending</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Live Check-In Activity Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Live Check-In Activity & Guest List</h3>
            <p className="text-xs text-slate-500">Real-time gate pass verification feed</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest or code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>

            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">All Ticket Tiers</option>
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
              <option value="vvip">VVIP</option>
            </select>

            <button
              onClick={onOpenScanner}
              className="px-3.5 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Scan QR Code</span>
            </button>

            <button
              onClick={onOpenManualCheckIn}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manual Check-In</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Attendee Name</th>
                <th className="py-3 px-4">Ticket Tier</th>
                <th className="py-3 px-4">Ticket Code</th>
                <th className="py-3 px-4">Gate / Time</th>
                <th className="py-3 px-4 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTicketsFeed.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    No guest tickets match the current filters.
                  </td>
                </tr>
              ) : (
                displayTicketsFeed.map((tk) => {
                  const isCheckedIn = tk.status === 'CHECKED_IN';
                  return (
                    <tr key={tk.ticketCode} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{tk.attendeeName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{tk.attendeeEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-800">
                          {tk.tierName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{tk.ticketCode}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {isCheckedIn ? (
                          <span>{tk.scannedByGate || 'Main Gate'} • {tk.checkedInAt || 'Checked-In'}</span>
                        ) : (
                          <span className="text-slate-400">Pending Gate Entry</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isCheckedIn ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-[#00C896] rounded-full text-[10px] font-extrabold uppercase inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Checked-In</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickCheckIn(tk.ticketCode)}
                            className="px-3 py-1 bg-[#00C896] hover:bg-[#00b386] text-white rounded-xl text-[11px] font-extrabold transition shadow-sm inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Check-In Now</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

