import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { NotificationLog } from '../types';
import { 
  Mail, Smartphone, CheckCircle2, Clock, RefreshCw, X, 
  Search, Send, Sparkles, Filter, ShieldCheck, QrCode, FileText, ArrowRight 
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({ isOpen, onClose }) => {
  const { notificationLogs, sendTicketEmail, sendTicketSms, clearNotificationLogs, allTickets } = useEventContext();
  
  const [activeTab, setActiveTab] = useState<'ALL' | 'EMAIL' | 'SMS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewLog, setPreviewLog] = useState<NotificationLog | null>(null);

  // Dispatch Test Modal state
  const [testMode, setTestMode] = useState(false);
  const [customRecipient, setCustomRecipient] = useState('');
  const [selectedCode, setSelectedCode] = useState(allTickets[0]?.ticketCode || 'TKT-1049-A1');
  const [dispatchType, setDispatchType] = useState<'EMAIL' | 'SMS'>('EMAIL');

  if (!isOpen) return null;

  const filteredLogs = notificationLogs.filter(log => {
    if (activeTab === 'EMAIL' && log.type !== 'EMAIL') return false;
    if (activeTab === 'SMS' && log.type !== 'SMS') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.recipient.toLowerCase().includes(q) ||
        log.subject.toLowerCase().includes(q) ||
        log.orderId.toLowerCase().includes(q) ||
        (log.ticketCode && log.ticketCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleManualDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const tkt = allTickets.find(t => t.ticketCode === selectedCode) || allTickets[0];
    if (!tkt) return;

    if (dispatchType === 'EMAIL') {
      sendTicketEmail(tkt, customRecipient || tkt.attendeeEmail);
    } else {
      sendTicketSms(tkt, customRecipient || tkt.attendeePhone);
    }
    setTestMode(false);
    setCustomRecipient('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Email & SMS Pass Dispatch Center</h2>
              <p className="text-xs text-slate-400">
                Track automated ticket deliveries, view dispatch logs, and re-issue pass notifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'ALL' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notificationLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('EMAIL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition ${
                activeTab === 'EMAIL' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email ({notificationLogs.filter(l => l.type === 'EMAIL').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('SMS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition ${
                activeTab === 'SMS' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS ({notificationLogs.filter(l => l.type === 'SMS').length})</span>
            </button>
          </div>

          {/* Search & Action */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipient or code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setTestMode(true)}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition whitespace-nowrap cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Pass</span>
            </button>
          </div>
        </div>

        {/* Dispatch Logs List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 scrollbar-none">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-300">No notification logs found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Notifications will automatically log here whenever tickets are purchased or re-sent.
              </p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition group"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                    log.type === 'EMAIL' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {log.type === 'EMAIL' ? <Mail className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">{log.subject}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {log.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate">{log.bodyPreview}</p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                      <span>Recipient: <strong className="text-slate-300 font-sans">{log.recipient}</strong></span>
                      {log.ticketCode && <span>• Code: <strong className="text-emerald-400 font-mono">{log.ticketCode}</strong></span>}
                      <span>• {log.sentAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setPreviewLog(log)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => {
                      const tkt = allTickets.find(t => t.ticketCode === log.ticketCode);
                      if (tkt) {
                        if (log.type === 'EMAIL') sendTicketEmail(tkt, log.recipient);
                        else sendTicketSms(tkt, log.recipient);
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                    title="Resend this notification"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automated Ticketa Mail & SMS Gateway Active</span>
          </span>

          <button
            onClick={clearNotificationLogs}
            className="text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
          >
            Clear Log History
          </button>
        </div>

      </div>

      {/* Manual Send Modal */}
      {testMode && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Issue Ticket Pass Notification</span>
              </h3>
              <button onClick={() => setTestMode(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Dispatch Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchType('EMAIL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer ${
                      dispatchType === 'EMAIL' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Ticket Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDispatchType('SMS')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer ${
                      dispatchType === 'SMS' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>SMS Pass Link</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Select Ticket Pass</label>
                <select
                  value={selectedCode}
                  onChange={e => setSelectedCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {allTickets.map(t => (
                    <option key={t.ticketCode} value={t.ticketCode}>
                      {t.eventTitle} - {t.ticketCode} ({t.attendeeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  {dispatchType === 'EMAIL' ? 'Recipient Email Address' : 'Recipient Phone Number'}
                </label>
                <input
                  type={dispatchType === 'EMAIL' ? 'email' : 'tel'}
                  placeholder={dispatchType === 'EMAIL' ? 'e.g. attendee@gmail.com' : 'e.g. +234 812 345 6789'}
                  value={customRecipient}
                  onChange={e => setCustomRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTestMode(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Dispatch Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Content Preview Drawer/Modal */}
      {previewLog && (
        <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                {previewLog.type === 'EMAIL' ? (
                  <Mail className="w-5 h-5 text-blue-400" />
                ) : (
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                )}
                <h3 className="text-base font-black text-white">{previewLog.type} Dispatch Render</h3>
              </div>

              <button onClick={() => setPreviewLog(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live Render Container */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 font-sans">
              <div className="border-b border-slate-800 pb-2 text-xs space-y-1">
                <div className="text-slate-400">To: <span className="text-white font-bold">{previewLog.recipient}</span></div>
                <div className="text-slate-400">Subject: <span className="text-emerald-400 font-bold">{previewLog.subject}</span></div>
                <div className="text-slate-500 text-[10px]">Dispatched: {previewLog.sentAt}</div>
              </div>

              <div className="pt-2 text-xs text-slate-200 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                <p className="font-bold text-emerald-400 mb-2">Ticketa Event Systems Automated Gateway</p>
                <p className="mb-3">{previewLog.bodyPreview}</p>
                
                {previewLog.ticketCode && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-3 mt-3">
                    <QrCode className="w-10 h-10 text-emerald-400" />
                    <div className="text-[11px]">
                      <p className="text-slate-400">Digital Gate Pass Code:</p>
                      <p className="font-mono font-black text-emerald-400 text-sm">{previewLog.ticketCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="text-slate-500">Gateway Status: Delivered</span>
              <button
                onClick={() => setPreviewLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
