import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { EventItem, TicketPass } from '../../types';
import { CameraScannerFeed } from '../CameraScannerFeed';
import { 
  X, 
  QrCode, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  UserCheck, 
  ExternalLink,
  Zap,
  Clock,
  Filter
} from 'lucide-react';

interface OrganizerCheckInModalProps {
  isOpen: boolean;
  initialMode?: 'scan' | 'manual';
  onClose: () => void;
  events: EventItem[];
  allTickets: TicketPass[];
}

export const OrganizerCheckInModal: React.FC<OrganizerCheckInModalProps> = ({
  isOpen,
  initialMode = 'scan',
  onClose,
  events,
  allTickets,
}) => {
  const { scanAndCheckInTicket } = useEventContext();
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>(initialMode);

  // Scan tab states
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: TicketPass;
    timestamp: string;
  } | null>(null);

  // Manual search tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'checked_in'>('all');

  if (!isOpen) return null;

  // Play audio chime
  const playChime = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio chime fallback:', e);
    }
  };

  const handleExecuteScan = (codeToScan: string) => {
    if (!codeToScan.trim()) return;
    const res = scanAndCheckInTicket(codeToScan.trim(), 'Organizer Gate Portal');
    playChime(res.success);
    setLastScanResult({
      ...res,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    setManualCodeInput('');
  };

  // Filtered tickets for manual tab
  const filteredTickets = allTickets.filter(tk => {
    if (selectedEventId !== 'all' && tk.eventId !== selectedEventId) return false;
    if (statusFilter === 'pending' && tk.status === 'CHECKED_IN') return false;
    if (statusFilter === 'checked_in' && tk.status !== 'CHECKED_IN') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tk.attendeeName.toLowerCase().includes(q) ||
      tk.attendeeEmail.toLowerCase().includes(q) ||
      tk.ticketCode.toLowerCase().includes(q) ||
      tk.tierName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00C896] text-slate-950 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                Organizer Gate Scanner
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold rounded">Live Sync</span>
              </h2>
              <p className="text-xs text-slate-400">Scan attendee QR passes or perform manual check-ins</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('scan')}
            className={`pb-3 px-3 font-bold text-xs border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'scan'
                ? 'border-[#00C896] text-[#00C896]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Camera QR Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-3 font-bold text-xs border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#00C896] text-[#00C896]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Manual Attendee Search</span>
          </button>

          <a
            href="/scanner"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto pb-3 px-3 font-bold text-xs text-slate-500 hover:text-[#00C896] flex items-center space-x-1.5 transition"
            title="Open Dedicated Fullscreen Gate App"
          >
            <span>Staff App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: CAMERA QR SCANNER */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              
              {/* Camera Viewfinder */}
              <div className="h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
                <CameraScannerFeed
                  scannerId="modal-org-qr-reader"
                  onScanSuccess={handleExecuteScan}
                  isCameraActive={isCameraActive}
                />
              </div>

              {/* Sample Ticket Shortcuts */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Quick Demo Passes (Click to Test Scan)</span>
                  <span className="text-[#00C896] font-semibold">{allTickets.length} Passes</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allTickets.slice(0, 5).map(tk => (
                    <button
                      key={tk.ticketCode}
                      type="button"
                      onClick={() => handleExecuteScan(tk.ticketCode)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition flex items-center space-x-1 cursor-pointer ${
                        tk.status === 'CHECKED_IN'
                          ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title={`Scan ${tk.attendeeName} (${tk.tierName})`}
                    >
                      <Ticket className="w-3 h-3 text-[#00C896] shrink-0" />
                      <span>{tk.ticketCode}</span>
                      <span className="text-[9px] opacity-75">({tk.status})</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleExecuteScan('TKT-9999-FAKE')}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-[11px] font-mono font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>TKT-INVALID</span>
                  </button>
                </div>
              </div>

              {/* Manual Ticket Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleExecuteScan(manualCodeInput); }} 
                className="flex gap-2 pt-1"
              >
                <input
                  type="text"
                  placeholder="Enter serial code e.g. TKT-1002-8823"
                  value={manualCodeInput}
                  onChange={e => setManualCodeInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#00C896]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md shadow-[#00C896]/20"
                >
                  Verify Ticket
                </button>
              </form>

              {/* Last Scan Result Display */}
              {lastScanResult && (
                <div className={`p-4 rounded-2xl border space-y-2 animate-in fade-in zoom-in duration-150 ${
                  lastScanResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {lastScanResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <span className="font-extrabold text-xs uppercase tracking-wide">
                        {lastScanResult.success ? 'Access Granted' : 'Scan Error'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{lastScanResult.timestamp}</span>
                  </div>

                  <p className="text-xs font-semibold">{lastScanResult.message}</p>

                  {lastScanResult.ticket && (
                    <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-[11px] font-semibold">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Attendee:</span>
                        <span className="font-bold text-slate-900">{lastScanResult.ticket.attendeeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Tier Pass:</span>
                        <span className="font-bold text-emerald-700">{lastScanResult.ticket.tierName}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: MANUAL ATTENDEE SEARCH */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, email or code..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00C896]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedEventId}
                    onChange={e => setSelectedEventId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Events</option>
                    {events.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as 'all' | 'pending' | 'checked_in')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Check-In</option>
                    <option value="checked_in">Checked In</option>
                  </select>
                </div>
              </div>

              {/* Ticket Results List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold space-y-1">
                    <p>No attendee tickets found matching search filters.</p>
                  </div>
                ) : (
                  filteredTickets.map(tk => {
                    const isCheckedIn = tk.status === 'CHECKED_IN';
                    return (
                      <div
                        key={tk.ticketCode}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {tk.attendeeName}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-mono font-bold">
                              {tk.tierName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono font-bold text-slate-700">{tk.ticketCode}</span>
                            <span>•</span>
                            <span className="truncate">{tk.attendeeEmail}</span>
                          </div>
                        </div>

                        <div>
                          {isCheckedIn ? (
                            <span className="px-3 py-1.5 bg-emerald-100 text-[#00C896] rounded-xl text-xs font-extrabold flex items-center space-x-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Checked-In</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleExecuteScan(tk.ticketCode)}
                              className="px-3.5 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center space-x-1 shrink-0 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Check-In</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>Organizers can check-in attendees directly or issue passes.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
