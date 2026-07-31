import React, { useState } from 'react';
import { EventItem, Order, TicketPass } from '../../types';
import { useLanguage } from '../../utils/translations';
import { 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  MoreHorizontal, 
  Zap, 
  TrendingUp, 
  Flame, 
  DollarSign, 
  Ticket, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  ExternalLink,
  Eye,
  ArrowUpRight,
  Trash2
} from 'lucide-react';

interface EventsTabProps {
  events: EventItem[];
  orders?: Order[];
  allTickets?: TicketPass[];
  onCreateEventClick: () => void;
  onSelectEvent: (eventId: string) => void;
  onViewRevenue: (eventId: string) => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent?: (event: EventItem) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({
  events,
  orders = [],
  allTickets = [],
  onCreateEventClick,
  onSelectEvent,
  onViewRevenue,
  onEditEvent,
  onDeleteEvent
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const formatNaira = (amount: number) => {
    return '₦ ' + amount.toLocaleString('en-US');
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  // Status badge config
  const getSalesVelocityBadge = (index: number) => {
    if (index % 3 === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-[#00C896] border border-emerald-200">
          <Zap className="w-3 h-3 fill-[#00C896]" />
          {t('sellingFast')}
        </span>
      );
    } else if (index % 3 === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">
          <TrendingUp className="w-3 h-3" />
          {t('averageSales')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
          <Flame className="w-3 h-3" />
          {t('lowSales')}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('eventsHeader')}</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {t('eventSeatsSub')}
          </p>
        </div>

        <button
          onClick={onCreateEventClick}
          className="px-4 py-2 bg-[#00C896] hover:bg-[#00b386] text-white rounded-xl text-xs font-extrabold shadow-md shadow-[#00C896]/20 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createNewEvent')}</span>
        </button>
      </div>

      {/* Top 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('totalEvent')}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{events.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00C896] flex items-center justify-center shrink-0 font-bold border border-emerald-100">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('activeEvents')}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{events.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 font-bold border border-teal-100">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('totalTicketSold')}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">{allTickets.length.toLocaleString()}</div>
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
            <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
              {formatNaira(totalRevenue)}
            </div>
          </div>
        </div>

      </div>

      {/* Search Input Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchEventsSimple')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] focus:bg-white rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none transition"
          />
        </div>
      </div>

      {/* Events List Cards */}
      <div className="space-y-4">
        {filteredEvents.map((evt, idx) => {
          const totalTierCap = evt.ticketTiers.reduce((acc, t) => acc + t.availableQuantity, 0);
          const eventTickets = allTickets.filter(t => t.eventId === evt.id);
          const totalTierSold = eventTickets.length || evt.ticketTiers.reduce((acc, t) => acc + t.soldQuantity, 0);
          const percentage = totalTierCap > 0 ? Math.round((totalTierSold / totalTierCap) * 100) : 0;
          const eventOrders = orders.filter(o => o.eventId === evt.id);
          const eventRevenue = eventOrders.reduce((acc, o) => acc + o.totalAmount, 0);
          const displayRev = eventRevenue;

          return (
            <div 
              key={evt.id} 
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative transition hover:border-[#00C896]/50"
            >
              
              {/* Event Poster & Title */}
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <img 
                  src={evt.image} 
                  alt={evt.title} 
                  className="w-20 h-24 rounded-xl object-cover shrink-0 shadow-md"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200">
                      {t('upcoming')}
                    </span>
                    <h3 className="text-base font-black text-slate-900 truncate">
                      {evt.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 font-medium truncate">
                    {evt.venueName}
                  </p>
                  
                  <p className="text-xs text-slate-400 font-mono">
                    {evt.date} - {evt.time}
                  </p>

                  {/* Progress bar */}
                  <div className="pt-2 w-full max-w-xs">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00C896] rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1 block">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Stats & Sales Velocity Pill */}
              <div className="flex items-center space-x-6 shrink-0">
                <div>
                  {getSalesVelocityBadge(idx)}
                  <div className="mt-2 text-xs font-bold text-slate-800 space-y-0.5">
                    <div className="font-mono text-slate-900 font-extrabold">
                      {totalTierCap.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">{t('ticketsLabel')}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {totalTierSold.toLocaleString()} {t('checkInsLabel')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t('revenue')}
                  </span>
                  <span className="text-sm font-black text-[#00C896] font-mono">
                    {formatNaira(displayRev)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                <button
                  onClick={() => onViewRevenue(evt.id)}
                  className="px-4 py-2 bg-[#00C896] hover:bg-[#00b386] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {t('revenue')}
                </button>

                {/* 3 dots action menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === evt.id ? null : evt.id)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openDropdownId === evt.id && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs font-bold text-slate-700 divide-y divide-slate-100">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onSelectEvent(evt.id);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00C896]" />
                          <span>{t('manageEvent')}</span>
                        </button>
                        <button
                          onClick={() => {
                            onEditEvent(evt);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-500" />
                          <span>{t('editEvent')}</span>
                        </button>
                        <button
                          onClick={() => {
                            onViewRevenue(evt.id);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{t('withdrawEarnings')}</span>
                        </button>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            if (onDeleteEvent) onDeleteEvent(evt);
                            setOpenDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>{t('deleteEvent')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
        <span className="text-xs text-slate-500 font-semibold">
          {t('showingEventsCount').replace('{count}', String(filteredEvents.length)).replace('{total}', '12')}
        </span>

        <div className="flex items-center space-x-1.5 text-xs font-bold">
          <button className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-50 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-[#00C896] text-white flex items-center justify-center font-bold">
            1
          </button>
          <button className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer">
            2
          </button>
          <button className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer">
            3
          </button>
          <button className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer">
            4
          </button>
          <button className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
