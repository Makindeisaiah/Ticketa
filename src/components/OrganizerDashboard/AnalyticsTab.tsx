import React, { useState } from 'react';
import { EventItem, Order, TicketPass } from '../../types';
import { useLanguage } from '../../utils/translations';
import { useEventContext } from '../../context/EventContext';
import { formatOrganizerCurrency } from '../../utils/currency';
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

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ events = [], orders = [], allTickets = [] }) => {
  const { t } = useLanguage();
  const { currentOrganizer } = useEventContext();
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const formatNaira = (amount: number) => {
    const val = Number.isNaN(amount) || amount === undefined || amount === null ? 0 : amount;
    return formatOrganizerCurrency(val, currentOrganizer);
  };

  const safeEvents = Array.isArray(events) ? events : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeTickets = Array.isArray(allTickets) ? allTickets : [];

  const targetOrders = selectedEvent === 'all' 
    ? safeOrders 
    : safeOrders.filter(o => o && o.eventId === selectedEvent);

  const targetTickets = selectedEvent === 'all'
    ? safeTickets
    : safeTickets.filter(t => t && t.eventId === selectedEvent);

  const targetCapacity = selectedEvent === 'all'
    ? safeEvents.reduce((acc, e) => {
        const tiers = Array.isArray(e?.ticketTiers) ? e.ticketTiers : [];
        return acc + tiers.reduce((s, t) => s + (t?.availableQuantity || 0), 0);
      }, 0)
    : (() => {
        const found = safeEvents.find(e => e && e.id === selectedEvent);
        const tiers = Array.isArray(found?.ticketTiers) ? found.ticketTiers : [];
        return tiers.reduce((s, t) => s + (t?.availableQuantity || 0), 0);
      })();

  const totalRevenue = targetOrders.reduce((acc, o) => acc + (o?.totalAmount || 0), 0);
  const ticketsRemaining = Math.max(0, targetCapacity - targetTickets.length);
  const conversionRate = targetTickets.length > 0 ? ((targetTickets.length / (targetCapacity || 1)) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('analyticsOverview')}</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {t('analyticsSub')}
          </p>
        </div>

        {/* Event Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-[#00C896] text-white font-extrabold text-xs rounded-xl border-none outline-none cursor-pointer pr-8 appearance-none shadow-md shadow-[#00C896]/20"
          >
            <option value="all">{t('allEventsDropdown')}</option>
            {safeEvents.map(e => e && e.id ? (
              <option key={e.id} value={e.id}>{e.title || 'Untitled Event'}</option>
            ) : null)}
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
              {t('totalRevenue')}
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
              {t('ticketsSoldRemaining')}
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
              {t('conversionRate')}
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
              {t('refundIssued')}
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              {formatNaira(0)}
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Revenue Performance & Traffic Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
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

          <div className="h-64 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 220">
              {/* Gridlines */}
              {totalRevenue > 0 ? (
                <>
                  <line x1="60" y1="20" x2="680" y2="20" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <text x="50" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{formatNaira(totalRevenue)}</text>

                  <line x1="60" y1="80" x2="680" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <text x="50" y="84" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{formatNaira(Math.round(totalRevenue * 0.6))}</text>

                  <line x1="60" y1="140" x2="680" y2="140" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <text x="50" y="144" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{formatNaira(Math.round(totalRevenue * 0.3))}</text>

                  <line x1="60" y1="190" x2="680" y2="190" stroke="#E2E8F0" />
                  <text x="50" y="194" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>
                </>
              ) : (
                <>
                  <line x1="60" y1="20" x2="680" y2="20" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <text x="50" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{formatNaira(100000)}</text>

                  <line x1="60" y1="80" x2="680" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <text x="50" y="84" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{formatNaira(50000)}</text>

                  <line x1="60" y1="140" x2="680" y2="140" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <text x="50" y="144" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">{formatNaira(10000)}</text>

                  <line x1="60" y1="190" x2="680" y2="190" stroke="#E2E8F0" />
                  <text x="50" y="194" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">0</text>
                </>
              )}

              {/* Area */}
              <path
                d={totalRevenue > 0
                  ? "M 100 180 L 210 140 L 320 80 L 430 80 L 540 20 L 650 20 L 650 190 L 100 190 Z"
                  : "M 100 190 L 650 190 L 650 190 L 100 190 Z"
                }
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
                d={totalRevenue > 0
                  ? "M 100 180 L 210 140 L 320 80 L 430 80 L 540 20 L 650 20"
                  : "M 100 190 L 650 190"
                }
                fill="none"
                stroke="#00C896"
                strokeWidth="3"
              />

              {/* Points */}
              {[
                { x: 100, y: totalRevenue > 0 ? 180 : 190, label: 'Apr 12' },
                { x: 210, y: totalRevenue > 0 ? 140 : 190, label: 'Apr 13' },
                { x: 320, y: totalRevenue > 0 ? 80 : 190, label: 'Apr 14' },
                { x: 430, y: totalRevenue > 0 ? 80 : 190, label: 'Apr 15' },
                { x: 540, y: totalRevenue > 0 ? 20 : 190, label: 'Apr 16' },
                { x: 650, y: totalRevenue > 0 ? 20 : 190, label: 'Apr 17' },
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
          <h3 className="text-base font-extrabold text-slate-900">{t('trafficSource')}</h3>
          
          <div className="space-y-3.5 pt-1">
            {[
              { name: t('directLink'), pct: targetOrders.length > 0 ? '30%' : '0%', icon: <Globe className="w-4 h-4 text-slate-500" /> },
              { name: t('socialMedia'), pct: targetOrders.length > 0 ? '28%' : '0%', icon: <Share2 className="w-4 h-4 text-blue-500" /> },
              { name: t('qrCode'), pct: targetOrders.length > 0 ? '28%' : '0%', icon: <QrCode className="w-4 h-4 text-emerald-500" /> },
              { name: t('searchTraffic'), pct: targetOrders.length > 0 ? '28%' : '0%', icon: <Search className="w-4 h-4 text-amber-500" /> },
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
          <h3 className="text-base font-extrabold text-slate-900">{t('ticketTypeCheckIns')}</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('ticketTypeCol')}</th>
                  <th className="py-3 px-4">{t('soldCol')}</th>
                  <th className="py-3 px-4 w-48">Progress</th>
                  <th className="py-3 px-4">{t('remainingCol')}</th>
                  <th className="py-3 px-4 text-right">{t('revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const activeEvts = selectedEvent === 'all' 
                    ? safeEvents 
                    : safeEvents.filter(e => e && e.id === selectedEvent);

                  const tierMap: Record<string, { sold: number; capacity: number; revenue: number }> = {};
                  
                  activeEvts.forEach(evt => {
                    const tiers = Array.isArray(evt?.ticketTiers) ? evt.ticketTiers : [];
                    tiers.forEach(tier => {
                      if (tier && tier.name) {
                        if (!tierMap[tier.name]) {
                          tierMap[tier.name] = { sold: 0, capacity: 0, revenue: 0 };
                        }
                        tierMap[tier.name].capacity += (tier.availableQuantity || 0);
                      }
                    });
                  });

                  targetTickets.forEach(t => {
                    const tName = t?.tierName || 'Regular';
                    const tPrice = t?.price || 0;
                    if (tierMap[tName]) {
                      tierMap[tName].sold += 1;
                      tierMap[tName].revenue += tPrice;
                    } else {
                      tierMap[tName] = { sold: 1, capacity: 1, revenue: tPrice };
                    }
                  });

                  const rows = Object.entries(tierMap);
                  if (rows.length === 0) {
                    return (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          {t('noTicketTiersFound')}
                        </td>
                      </tr>
                    );
                  }

                  return rows.map(([tierName, data], idx) => {
                    const pct = data.capacity > 0 ? Math.round((data.sold / data.capacity) * 100) : 0;
                    const rem = Math.max(0, data.capacity - data.sold);

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{tierName}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{data.sold.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00C896] rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{rem.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-right font-bold text-slate-900">{formatNaira(data.revenue)}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Stack: Social Channels + Payment Method Used Donut */}
        <div className="space-y-6">
          
          {/* Orders & Buyers Social Channels */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900">{t('ordersCol')}</h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 p-2 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-2 text-pink-600">
                  <Instagram className="w-4 h-4" /> Instagram
                </span>
                <span className="font-mono text-slate-900">{targetOrders.length > 0 ? '30%' : '0%'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 p-2 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-2 text-emerald-600">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </span>
                <span className="font-mono text-slate-900">{targetOrders.length > 0 ? '25%' : '0%'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 p-2 bg-slate-50 rounded-xl">
                <span className="flex items-center gap-2 text-sky-500">
                  <Twitter className="w-4 h-4" /> X (Twitter)
                </span>
                <span className="font-mono text-slate-900">{targetOrders.length > 0 ? '10%' : '0%'}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Used Donut Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t('paymentMethod')}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Payment distribution across orders</p>
            </div>
            
            {(() => {
              const cardOrdersCount = targetOrders.filter(o => o.paymentMethod === 'Credit Card' || !o.paymentMethod).length;
              const transferOrdersCount = targetOrders.filter(o => o.paymentMethod === 'Bank Transfer').length;
              const ussdOrdersCount = targetOrders.filter(o => o.paymentMethod === 'USSD').length;

              const hasOrders = targetOrders.length > 0;
              const totalPayOrders = targetOrders.length || 1;
              const cardPct = hasOrders ? Math.round((cardOrdersCount / totalPayOrders) * 100) : 62;
              const transferPct = hasOrders ? Math.round((transferOrdersCount / totalPayOrders) * 100) : 31;
              const ussdPct = hasOrders ? Math.max(0, 100 - cardPct - transferPct) : 7;

              return (
                <div className="flex items-center justify-between gap-4 pt-1">
                  {/* Donut SVG */}
                  <div className="w-28 h-28 relative shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Segment 1: Card */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#00C896"
                        strokeWidth="4.2"
                        strokeDasharray={`${cardPct}, 100`}
                      />
                      {/* Segment 2: Bank Transfer */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="4.2"
                        strokeDasharray={`${transferPct}, 100`}
                        strokeDashoffset={`-${cardPct}`}
                      />
                      {/* Segment 3: USSD */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="4.2"
                        strokeDasharray={`${ussdPct}, 100`}
                        strokeDashoffset={`-${cardPct + transferPct}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                      <span className="text-sm font-black text-slate-900 font-mono">{cardPct}%</span>
                      <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">Card</span>
                    </div>
                  </div>

                  {/* Legend List */}
                  <div className="space-y-2.5 text-xs font-bold text-slate-700 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00C896] shrink-0"></span> Card
                      </span>
                      <span className="font-mono text-slate-900 font-extrabold">{cardPct}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span> Bank Transfer
                      </span>
                      <span className="font-mono text-slate-900 font-extrabold">{transferPct}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span> USSD
                      </span>
                      <span className="font-mono text-slate-900 font-extrabold">{ussdPct}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

      </div>

    </div>
  );
};
