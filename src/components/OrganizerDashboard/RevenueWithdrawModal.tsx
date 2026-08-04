import React, { useState } from 'react';
import { EventItem, Order } from '../../types';
import { useEventContext } from '../../context/EventContext';
import { formatOrganizerCurrency } from '../../utils/currency';
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  ArrowUpRight, 
  History, 
  Clock, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface RevenueWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  orders?: Order[];
}

export const RevenueWithdrawModal: React.FC<RevenueWithdrawModalProps> = ({
  isOpen,
  onClose,
  event,
  orders = []
}) => {
  const { currentOrganizer } = useEventContext();
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  if (!isOpen || !event) return null;

  const eventOrders = orders.filter(o => o.eventId === event.id);
  const grossSales = eventOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const platformFees = Math.round(grossSales * 0.025);
  const netWithdrawable = Math.max(0, grossSales - platformFees);

  const formatCfa = (amount: number) => formatOrganizerCurrency(amount, currentOrganizer);

  const handleWithdraw = () => {
    if (netWithdrawable <= 0) return;
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-[#00C896] uppercase tracking-wider block">
              Event Financials & Payout
            </span>
            <h2 className="text-xl font-black text-slate-900">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs font-semibold">
          
          {withdrawSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00C896] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Withdrawal Request Initiated</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {formatCfa(netWithdrawable)} has been scheduled for transfer to your Ecobank Côte d'Ivoire account (****5399).
              </p>
            </div>
          ) : (
            <>
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Gross Ticket Sales</span>
                  <div className="text-sm font-black text-slate-900 font-mono">{formatCfa(grossSales)}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Platform Fee (2.5%)</span>
                  <div className="text-sm font-black text-amber-600 font-mono">-{formatCfa(platformFees)}</div>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">Net Available</span>
                  <div className="text-sm font-black text-[#00C896] font-mono">{formatCfa(netWithdrawable)}</div>
                </div>
              </div>

              {/* Destination Bank Account */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Payout Bank Destination</span>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5 text-[#00C896]" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900">Ecobank Côte d'Ivoire</div>
                      <div className="text-[10px] text-slate-500 font-mono">012****5399 • Event Organizer</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#00C896] rounded-full text-[10px] font-extrabold">Verified</span>
                </div>
              </div>

              {/* Withdrawal Action Box */}
              <div className="pt-2">
                <button
                  onClick={handleWithdraw}
                  className="w-full py-3.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#00C896]/20 transition"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Withdraw {formatCfa(netWithdrawable)} to Ecobank</span>
                </button>
              </div>

              {/* Withdrawal History */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-900 text-xs">Payout History for this Event</h4>
                <div className="space-y-2 text-[11px]">
                  {grossSales > 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">REF-8923746</div>
                        <div className="text-[10px] text-slate-400">Dec 01, 2025 • Ecobank ****5399</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black font-mono text-slate-900">{formatCfa(netWithdrawable)}</div>
                        <span className="text-[9px] text-[#00C896] font-bold">Completed</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center text-slate-400">
                      No payouts processed yet for this event.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
