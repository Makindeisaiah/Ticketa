import React, { useState } from 'react';
import { Search, Download, CheckCircle2, XCircle, Clock, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../utils/translations';

export const RefundsTab: React.FC = () => {
  const { t } = useLanguage();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [refunds, setRefunds] = useState<any[]>([]);

  const pendingCount = refunds.filter(r => r.status === 'Pending').length;
  const approvedCount = refunds.filter(r => r.status === 'Approved' || r.status === 'Processed').length;
  const totalRefundedSum = refunds
    .filter(r => r.status === 'Approved' || r.status === 'Processed')
    .reduce((sum, r) => {
      const num = parseInt(r.amount.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + num;
    }, 0);

  const handleCancelRefund = (id: string) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'Canceled' } : r));
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('refundRequestsHeader')}</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">{t('refundRequestsSub')}</p>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{t('pendingRefunds')}</span>
            <span className="text-xl font-black text-slate-900">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600/70 block mb-1">{t('approvedRefunds')}</span>
            <span className="text-xl font-black text-emerald-600">{approvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#00C896]/70 block mb-1">{t('totalRefunded')}</span>
            <span className="text-xl font-black text-[#00C896] font-mono">₦{totalRefundedSum.toLocaleString()}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00C896]/10 flex items-center justify-center text-[#00C896]">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('searchRefundsPlaceholder')}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl text-xs shadow-sm hover:bg-[#00b386] transition cursor-pointer">
            {t('markAllAsRead')}
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl text-xs shadow-sm hover:bg-[#00b386] transition flex items-center justify-center gap-2 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            {t('exportCsv')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#00C896] text-white text-[10px] uppercase tracking-wider">
                <th className="px-4 py-3 font-extrabold">{t('refundIdCol')}</th>
                <th className="px-4 py-3 font-extrabold">{t('attendeeCol')}</th>
                <th className="px-4 py-3 font-extrabold">{t('eventCol')}</th>
                <th className="px-4 py-3 font-extrabold">{t('ticketTypeCol')}</th>
                <th className="px-4 py-3 font-extrabold">{t('amountCol')}</th>
                <th className="px-4 py-3 font-extrabold">{t('reasonCol')}</th>
                <th className="px-4 py-3 font-extrabold">{t('statusCol')}</th>
                <th className="px-4 py-3 font-extrabold">{t('requestedOnCol')}</th>
                <th className="px-4 py-3 font-extrabold text-center">{t('actionCol')}</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
              {/* Sample Rows */}
              {refunds.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-slate-500 font-mono">{row.id}</td>
                  <td className="px-4 py-3">{row.attendee}</td>
                  <td className="px-4 py-3">{row.event}</td>
                  <td className="px-4 py-3">{row.ticketType}</td>
                  <td className="px-4 py-3 font-mono">{row.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      row.reason.includes('Canceled') ? 'bg-cyan-100 text-cyan-700' : 
                      row.reason.includes('Scheduling') ? 'bg-indigo-100 text-indigo-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {row.reason}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        row.status === 'Pending' ? 'bg-amber-400' :
                        row.status === 'Approved' ? 'bg-[#00C896]' :
                        row.status === 'Rejected' ? 'bg-rose-500' :
                        row.status === 'Processed' ? 'bg-blue-500' :
                        row.status === 'Canceled' ? 'bg-slate-400' :
                        'bg-slate-500'
                      }`} />
                      <span>{row.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.requestedOn}</td>
                  <td className="px-4 py-3 text-center relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mx-auto hover:bg-slate-200 transition cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    
                    {openMenuId === row.id && (
                      <div className="absolute right-8 top-10 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden text-left">
                        {row.status === 'Pending' && (
                          <button 
                            onClick={() => handleCancelRefund(row.id)}
                            className="w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-slate-50 transition border-b border-slate-100 cursor-pointer"
                          >
                            Cancel Refund
                          </button>
                        )}
                        <button 
                          onClick={() => setOpenMenuId(null)}
                          className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500">Showing 1 to 8 of 36</span>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded flex items-center justify-center bg-amber-400 text-white cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-6 h-6 rounded flex items-center justify-center bg-[#00C896] text-white font-bold text-[10px] cursor-pointer">1</button>
            <button className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-[10px] hover:bg-slate-300 transition cursor-pointer">2</button>
            <button className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-[10px] hover:bg-slate-300 transition cursor-pointer">3</button>
            <button className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-[10px] hover:bg-slate-300 transition cursor-pointer">4</button>
            <button className="w-6 h-6 rounded flex items-center justify-center bg-amber-400 text-white cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
