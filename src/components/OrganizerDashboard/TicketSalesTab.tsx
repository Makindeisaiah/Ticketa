import React, { useState } from 'react';
import { EventItem, Order, TicketPass } from '../../types';
import { 
  DollarSign, 
  Ticket, 
  CreditCard, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface TicketSalesTabProps {
  events: EventItem[];
  orders: Order[];
  allTickets: TicketPass[];
}

export const TicketSalesTab: React.FC<TicketSalesTabProps> = ({
  events,
  orders,
  allTickets
}) => {
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-US');
  };

  // Mock export handler
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Order ID,Buyer,Ticket Type,Qty,Amount Paid,Payment Method,Status,Purchase Date\n"
      + orders.map(o => `${o.id},${o.customerName},${o.tickets[0]?.tierName || 'Regular'},${o.tickets.length},${o.totalAmount},${o.paymentMethod},Paid,${o.purchaseDate}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ticket_sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  const platformFees = Math.round(totalRevenue * 0.025);
  const netRevenue = totalRevenue - platformFees;

  const filteredOrders = targetOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ticket Sales</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Track and manage your ticket sales, order breakdown, and net earnings
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
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Tickets Sold
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              {targetTickets.length.toLocaleString()} / {targetCapacity.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Revenue
            </span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {formatNaira(totalRevenue)}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold border border-amber-100">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Platform Fees
            </span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {formatNaira(platformFees)}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Net Revenue
            </span>
            <div className="text-lg font-black text-[#00C896] mt-0.5 font-mono">
              {formatNaira(netRevenue)}
            </div>
          </div>
        </div>

      </div>

      {/* Revenue Performance Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
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

        <div className="h-56 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
            <line x1="60" y1="20" x2="780" y2="20" stroke="#E2E8F0" strokeDasharray="4 4" />
            <line x1="60" y1="80" x2="780" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
            <line x1="60" y1="140" x2="780" y2="140" stroke="#E2E8F0" strokeDasharray="4 4" />
            <line x1="60" y1="180" x2="780" y2="180" stroke="#E2E8F0" />

            <path
              d="M 100 160 L 200 120 L 300 60 L 400 60 L 500 20 L 600 20 L 700 120 L 700 180 L 100 180 Z"
              fill="url(#revGrad3)"
            />
            <defs>
              <linearGradient id="revGrad3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C896" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00C896" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <path
              d="M 100 160 L 200 120 L 300 60 L 400 60 L 500 20 L 600 20 L 700 120"
              fill="none"
              stroke="#00C896"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>

      {/* Ticket Type Performance Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Ticket Type Performance</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket Type</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Tickets Sold</th>
                <th className="py-3 px-4">Tickets Left</th>
                <th className="py-3 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { type: 'Regular', price: '#10,000', sold: '23,530', left: '1,750', rev: '#450,000,000' },
                { type: 'VIP', price: '#30,000', sold: '12,095', left: '405', rev: '#350,000,000' },
                { type: 'VVIP', price: '#100,000', sold: '2,100', left: '0', rev: '#350,000,000' },
                { type: 'Premium', price: '#3,500,000', sold: '250', left: '0', rev: '#369,000,000' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.type}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{row.price}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">{row.sold}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{row.left}</td>
                  <td className="py-3.5 px-4 font-mono text-right font-black text-[#00C896]">{row.rev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders & Buyers Transactions Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Orders & Buyers</h3>
            <p className="text-xs text-slate-500">Manage and oversee all ticket orders and transactions</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order ID, buyer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-xs text-slate-900 outline-none"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Ticket Type</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: 'ORD-362782', buyer: 'Makinde Isaiah', tier: 'VIP', qty: 2, amount: '#200,000', method: 'Card', status: 'Pending', date: 'Dec 10, 2025 - 10:25' },
                { id: 'ORD-362437', buyer: 'Taofeek Alabi', tier: 'Regular', qty: 1, amount: '#30,000', method: 'Transfer', status: 'Paid', date: 'Dec 11, 2025 - 11:50' },
                { id: 'ORD-362290', buyer: 'Mary Alexander', tier: 'VVIP', qty: 1, amount: '#1,500,000', method: 'USSD', status: 'Failed', date: 'Dec 11, 2025 - 12:00' },
                { id: 'ORD-362111', buyer: 'Tokunbo Popoola', tier: 'Premium', qty: 2, amount: '#6,000,000', method: 'Card', status: 'Paid', date: 'Dec 11, 2025 - 12:30' },
                { id: 'ORD-362202', buyer: 'Shina Alade', tier: 'Regular', qty: 3, amount: '#90,000', method: 'Transfer', status: 'Paid', date: 'Dec 12, 2025 - 10:00' },
                { id: 'ORD-366552', buyer: 'Pedro Alex', tier: 'VIP', qty: 1, amount: '#100,000', method: 'Card', status: 'Paid', date: 'Dec 12, 2025 - 11:45' },
                { id: 'ORD-361823', buyer: 'John Olanrewaju', tier: 'Regular', qty: 2, amount: '#60,000', method: 'USSD', status: 'Paid', date: 'Dec 12, 2025 - 14:39' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-[#00C896]">{row.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{row.buyer}</td>
                  <td className="py-3 px-4 text-slate-600">{row.tier}</td>
                  <td className="py-3 px-4 font-mono text-slate-800">{row.qty}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.amount}</td>
                  <td className="py-3 px-4 text-slate-600">{row.method}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      row.status === 'Paid'
                        ? 'bg-emerald-100 text-[#00C896]'
                        : row.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-xs font-bold pt-2">
          <span className="text-slate-500">Showing 1 to 10 of 40</span>
          <div className="flex space-x-1">
            <button className="w-7 h-7 rounded-lg bg-[#00C896] text-white flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center">2</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center">3</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center">4</button>
          </div>
        </div>
      </div>

    </div>
  );
};
