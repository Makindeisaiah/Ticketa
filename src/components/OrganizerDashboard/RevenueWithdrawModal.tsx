import React, { useState } from 'react';
import { EventItem } from '../../types';
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
}

export const RevenueWithdrawModal: React.FC<RevenueWithdrawModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  if (!isOpen || !event) return null;

  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('2271662153');

  const grossSales = 2329909900;
  const platformFees = 58247747;
  const netWithdrawable = 2271662153;

  const formatNaira = (amount: number) => '₦ ' + amount.toLocaleString('en-US');

  const handleWithdraw = () => {
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
                {formatNaira(netWithdrawable)} has been scheduled for transfer to your GTBank account (****5399).
              </p>
            </div>
          ) : (
            <>
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Gross Ticket Sales</span>
                  <div className="text-sm font-black text-slate-900 font-mono">{formatNaira(grossSales)}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Platform Fee (2.5%)</span>
                  <div className="text-sm font-black text-amber-600 font-mono">-{formatNaira(platformFees)}</div>
                </div>

                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">Net Available</span>
                  <div className="text-sm font-black text-[#00C896] font-mono">{formatNaira(netWithdrawable)}</div>
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
                      <div className="font-extrabold text-slate-900">Guaranty Trust Bank (GTBank)</div>
                      <div className="text-[10px] text-slate-500 font-mono">012****5399 • Flytimefest Ltd</div>
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
                  <span>Withdraw {formatNaira(netWithdrawable)} to GTBank</span>
                </button>
              </div>

              {/* Withdrawal History */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-900 text-xs">Payout History for this Event</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">REF-8923746</div>
                      <div className="text-[10px] text-slate-400">Dec 01, 2025 • GTBank ****5399</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black font-mono text-slate-900">₦ 500,000,000</div>
                      <span className="text-[9px] text-[#00C896] font-bold">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
