import React, { useState } from 'react';
import { EventItem, Order, TicketPass } from '../../types';
import { useLanguage } from '../../utils/translations';
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
  const { t } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const formatNaira = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('ticketSalesHeader')}</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {t('ticketSalesSub')}
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-[#00C896] text-white font-extrabold text-xs rounded-xl border-none outline-none cursor-pointer pr-8 appearance-none shadow-md shadow-[#00C896]/20"
          >
            <option value="all">{t('allEventsDropdown')}</option>
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
              {t('totalTicketSold')}
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
              {t('totalRevenue')}
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
              {t('platformFees')}
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
              {t('netRevenue')}
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
          <h3 className="text-base font-extrabold text-slate-900">{t('revenuePerformance')}</h3>
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200/60">
            {(['daily', 'weekly', 'monthly'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-amber-400 text-slate-900 font-extrabold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t(tf)}
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
        <h3 className="text-base font-extrabold text-slate-900">{t('ticketTypeCheckIns')}</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('ticketTypeCol')}</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">{t('soldCol')}</th>
                <th className="py-3 px-4">{t('remainingCol')}</th>
                <th className="py-3 px-4 text-right">{t('revenue')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(() => {
                const relevantEvents = selectedEvent === 'all' 
                  ? events 
                  : events.filter(e => e.id === selectedEvent);

                const tierPerformanceMap = new Map<string, { price: number; sold: number; available: number; rev: number }>();

                relevantEvents.forEach(evt => {
                  evt.ticketTiers.forEach(tier => {
                    const existing = tierPerformanceMap.get(tier.name) || { price: tier.price, sold: 0, available: 0, rev: 0 };
                    const tierTickets = targetTickets.filter(t => t.tierName.toLowerCase() === tier.name.toLowerCase());
                    const soldCount = tierTickets.length || tier.soldQuantity;
                    const rev = soldCount * tier.price;
                    tierPerformanceMap.set(tier.name, {
                      price: tier.price,
                      sold: existing.sold + soldCount,
                      available: existing.available + tier.availableQuantity,
                      rev: existing.rev + rev
                    });
                  });
                });

                const tierRows = Array.from(tierPerformanceMap.entries()).map(([type, data]) => ({
                  type,
                  price: formatNaira(data.price),
                  sold: data.sold.toLocaleString(),
                  left: data.available.toLocaleString(),
                  rev: formatNaira(data.rev)
                }));

                if (tierRows.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold text-xs">
                        {t('noTicketTiersFound')}
                      </td>
                    </tr>
                  );
                }

                return tierRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.type}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{row.price}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">{row.sold}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{row.left}</td>
                    <td className="py-3.5 px-4 font-mono text-right font-black text-[#00C896]">{row.rev}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders & Buyers Transactions Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{t('ordersCol')}</h3>
            <p className="text-xs text-slate-500">{t('ticketSalesSub')}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchAttendeePlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-xs text-slate-900 outline-none"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('exportCsv')}</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('refundIdCol')}</th>
                <th className="py-3 px-4">{t('userCustomerCol')}</th>
                <th className="py-3 px-4">{t('ticketTypeCol')}</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">{t('amountCol')}</th>
                <th className="py-3 px-4">{t('paymentMethod')}</th>
                <th className="py-3 px-4">{t('statusCol')}</th>
                <th className="py-3 px-4">{t('dateRegisteredCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold text-xs">
                    {t('noOrdersYet')}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#00C896]">{ord.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{ord.customerName}</td>
                    <td className="py-3 px-4 text-slate-600">{ord.tickets[0]?.tierName || 'Regular'}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">{ord.tickets.length}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatNaira(ord.totalAmount)}</td>
                    <td className="py-3 px-4 text-slate-600">{ord.paymentMethod || 'Card'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-[#00C896]">
                        PAID
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">{ord.purchaseDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-xs font-bold pt-2">
          <span className="text-slate-500">
            {filteredOrders.length === 0 
              ? 'Showing 0 of 0 transactions' 
              : `Showing 1 to ${filteredOrders.length} of ${filteredOrders.length}`}
          </span>
          {filteredOrders.length > 0 && (
            <div className="flex space-x-1">
              <button className="w-7 h-7 rounded-lg bg-[#00C896] text-white flex items-center justify-center">1</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
