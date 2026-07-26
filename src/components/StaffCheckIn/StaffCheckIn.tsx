import React, { useState, useEffect, useRef } from 'react';
import { useEventContext } from '../../context/EventContext';
import { TicketPass } from '../../types';
import { Html5Qrcode } from 'html5-qrcode';
import { CameraScannerFeed } from '../CameraScannerFeed';
import { NotificationCenterModal } from '../NotificationCenterModal';
import { 
  QrCode, Camera, CheckCircle2, XCircle, Search, ShieldCheck, 
  Volume2, Users, RefreshCw, Zap, AlertTriangle, ChevronRight, 
  Sparkles, ShieldAlert, History, User, Mail, Lock, LogOut, 
  Filter, ArrowRight, Clock, MapPin, Ticket, Download, HelpCircle, 
  Printer, Wifi, RotateCcw, FileText, LayoutDashboard, Sun, Moon, 
  Settings, Send, Bell, Check, X, Eye, Flashlight, Sliders, ChevronLeft, WifiOff
} from 'lucide-react';

export const StaffCheckIn: React.FC = () => {
  const { 
    events, 
    allTickets, 
    scanAndCheckInTicket, 
    manualCheckInByEmail,
    selectedEventId,
    isOfflineMode,
    setIsOfflineMode,
    offlineQueue,
    syncOfflineScans,
    clearOfflineQueue,
    notificationLogs,
    sendTicketEmail,
    sendTicketSms
  } = useEventContext();

  const [showSyncQueueModal, setShowSyncQueueModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);


  // Selected Active Event
  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  // Auth / Workflow State
  const [authStep, setAuthStep] = useState<'login' | 'welcome' | 'dashboard'>('dashboard');
  const [loginEmail, setLoginEmail] = useState('niyi.akinola@ticketa.com');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  
  // Dashboard Navigation View
  type ViewType = 'dashboard' | 'scan' | 'manual' | 'search' | 'todays-checkins' | 'vip-list' | 'invalid-tickets' | 'settings';
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Assigned Gate & Staff Details
  const [assignedGate, setAssignedGate] = useState('VIP Entrance');
  const staffName = 'Niyi Akinola';
  const staffRole = 'Check-In Staff';
  const shiftTime = '5:00 PM - 11:00 PM';

  // Scanner States
  const [scannedInput, setScannedInput] = useState('');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: TicketPass;
    timestamp: string;
  } | null>(null);

  // Manual & Search States
  const [searchTab, setSearchTab] = useState<'email-phone' | 'name' | 'ticket-id'>('email-phone');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttendeeTicket, setSelectedAttendeeTicket] = useState<TicketPass | null>(null);

  // Today's Check-ins Filter
  const [checkinFilter, setCheckinFilter] = useState<'all' | 'valid' | 'pending' | 'invalid' | 'vip'>('all');
  const [checkinTableSearch, setCheckinTableSearch] = useState('');

  // Settings state
  const [settingsTab, setSettingsTab] = useState<'general' | 'account' | 'notification' | 'scanner' | 'printer' | 'connectivity' | 'security' | 'team' | 'backup' | 'about'>('general');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoLogout, setAutoLogout] = useState('30 Minutes');
  const [showAttendeePhoto, setShowAttendeePhoto] = useState(true);

  // Dynamic Invalid Tickets mock tracking
  const [invalidLogs, setInvalidLogs] = useState<Array<{
    id: string;
    attendeeName: string;
    email: string;
    ticketCode: string;
    section: string;
    reason: 'Duplicate Scan' | 'Expired Ticket' | 'Fake / Invalid QR' | 'Wrong Gate';
    timestamp: string;
  }>>([
    {
      id: 'inv-1',
      attendeeName: 'Kunle Adewale',
      email: 'kunle.a@example.com',
      ticketCode: 'TKT-9912-ERR',
      section: 'Regular',
      reason: 'Duplicate Scan',
      timestamp: '10:14 AM'
    },
    {
      id: 'inv-2',
      attendeeName: 'Blessing Okon',
      email: 'blessing@example.com',
      ticketCode: 'TKT-7788-INV',
      section: 'VIP Table - B',
      reason: 'Wrong Gate',
      timestamp: '09:42 AM'
    },
    {
      id: 'inv-3',
      attendeeName: 'Tunde Bakare',
      email: 'tunde.b@example.com',
      ticketCode: 'TKT-0000-FK',
      section: 'VVIP Access',
      reason: 'Fake / Invalid QR',
      timestamp: '08:50 AM'
    }
  ]);

  // Play Web Audio chime on scan result
  const playScanChime = (success: boolean) => {
    if (!soundEnabled) return;
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
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.error('Audio chime error:', e);
    }
  };

  // Handle Scan Verification
  const executeScan = (codeToScan: string) => {
    if (!codeToScan.trim()) return;
    const res = scanAndCheckInTicket(codeToScan.trim(), assignedGate);

    playScanChime(res.success);

    if (!res.success) {
      // Add to invalid log if failed
      setInvalidLogs(prev => [
        {
          id: `inv-${Date.now()}`,
          attendeeName: res.ticket?.attendeeName || 'Unknown Attendee',
          email: res.ticket?.attendeeEmail || 'unknown@guest.com',
          ticketCode: codeToScan,
          section: res.ticket?.tierName || 'Unassigned',
          reason: res.message.includes('ALREADY') ? 'Duplicate Scan' : 'Fake / Invalid QR',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    }

    setLastScanResult({
      ...res,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    setScannedInput('');
  };

  // Perform Manual Check-In
  const handleForceCheckIn = (ticket: TicketPass) => {
    const res = scanAndCheckInTicket(ticket.ticketCode, assignedGate);
    playScanChime(res.success);
    setLastScanResult({
      ...res,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    setSelectedAttendeeTicket(prev => prev ? { ...prev, status: 'CHECKED_IN', checkedInAt: new Date().toLocaleTimeString() } : null);
  };

  // Stats calculation
  const totalCheckIns = allTickets.filter(t => t.status === 'CHECKED_IN').length;
  const validCheckIns = totalCheckIns;
  const pendingCheckIns = allTickets.filter(t => t.status === 'VALID').length;
  const invalidTicketsCount = invalidLogs.length;

  // VIP Tickets calculation
  const vipTickets = allTickets.filter(t => t.tierName.toLowerCase().includes('vip') || t.tierName.toLowerCase().includes('table') || t.pricePaid >= 100000);
  const checkedInVips = vipTickets.filter(t => t.status === 'CHECKED_IN');
  const notCheckedInVips = vipTickets.filter(t => t.status === 'VALID');

  // Filtered Tickets for Today's Check-Ins
  const filteredCheckInList = allTickets.filter(t => {
    if (checkinFilter === 'valid') return t.status === 'CHECKED_IN';
    if (checkinFilter === 'pending') return t.status === 'VALID';
    if (checkinFilter === 'vip') return t.tierName.toLowerCase().includes('vip') || t.tierName.toLowerCase().includes('table');
    return true;
  }).filter(t => {
    if (!checkinTableSearch) return true;
    const q = checkinTableSearch.toLowerCase();
    return t.attendeeName.toLowerCase().includes(q) || t.attendeeEmail.toLowerCase().includes(q) || t.ticketCode.toLowerCase().includes(q);
  });

  // Filtered Attendees for Search Page
  const searchResults = allTickets.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (searchTab === 'email-phone') return t.attendeeEmail.toLowerCase().includes(q);
    if (searchTab === 'name') return t.attendeeName.toLowerCase().includes(q);
    if (searchTab === 'ticket-id') return t.ticketCode.toLowerCase().includes(q);
    return t.attendeeName.toLowerCase().includes(q) || t.ticketCode.toLowerCase().includes(q);
  });

  // Recent Check-In feed
  const recentCheckInsFeed = allTickets.filter(t => t.status === 'CHECKED_IN').slice(0, 5);

  // ==================== SCREEN 1: STAFF LOGIN ====================
  if (authStep === 'login') {
    return (
      <div className="min-h-[85vh] bg-slate-900 flex flex-col justify-center items-center p-6 text-slate-100">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="flex items-center space-x-2 justify-center">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-lg">
              T
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">TICKETA</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Staff Check-In Access</h2>
            <p className="text-xs text-slate-500">Login to manage attendee entry and ticket validation</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setAuthStep('welcome'); }} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
            >
              Continue
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400">
            Having trouble accessing your account? <a href="#" className="text-emerald-600 font-semibold underline">Contact organizer admin</a>
          </p>

        </div>
      </div>
    );
  }

  // ==================== SCREEN 2: SESSION ASSIGNMENT WELCOME ====================
  if (authStep === 'welcome') {
    return (
      <div className="min-h-[85vh] bg-slate-900 flex justify-center items-center p-6 text-slate-900">
        <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Assignment Summary */}
          <div className="p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>You have been successfully logged in</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome, {staffName.split(' ')[0]}</h2>

              <div className="mt-6 space-y-3 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Your Assignment Details</h3>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Assigned Event</p>
                    <p className="font-bold text-slate-900">{activeEvent.title}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {activeEvent.date}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Assigned Gate</p>
                    <p className="font-bold text-slate-900">{assignedGate}</p>
                  </div>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                    Gate 2
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Role & Status</p>
                    <p className="font-bold text-slate-900">{staffRole}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                    Now Active
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Shift Time</p>
                    <p className="font-bold text-slate-900">{shiftTime}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    6h 00m
                  </span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => setAuthStep('dashboard')}
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition"
              >
                <span>Enter Check-In Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Not your assignment? <a href="#" onClick={() => setAuthStep('login')} className="text-emerald-600 underline">Contact organizer admin</a>
              </p>
            </div>
          </div>

          {/* Right Security Illustration Box */}
          <div className="bg-slate-950 p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-5 h-5" />
                <span>Security First</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Please ensure you only scan valid tickets and follow event guidelines.</p>
            </div>

            <div className="relative z-10 my-8 flex items-center justify-center">
              <div className="w-48 h-48 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-2xl">
                <QrCode className="w-16 h-16 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">High-Speed Scanner Station</span>
              </div>
            </div>

            <div className="relative z-10 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Live Gate Synchronization</p>
                <p className="text-[10px] text-slate-400">Connected to central Cloud validator</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==================== SCREEN 3: MAIN CHECK-INS STAFF DASHBOARD ====================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex">
      
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 shadow-sm">
        
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-base">
              T
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">TICKETA</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('scan')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'scan'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Ticket</span>
            </button>

            <button
              onClick={() => setCurrentView('manual')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'manual'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Manual Check-In</span>
            </button>

            <button
              onClick={() => setCurrentView('search')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'search'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Attendee</span>
            </button>

            <button
              onClick={() => setCurrentView('todays-checkins')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'todays-checkins'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Today's Check-Ins</span>
            </button>

            <button
              onClick={() => setCurrentView('vip-list')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'vip-list'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>VIP List</span>
            </button>

            <button
              onClick={() => setCurrentView('invalid-tickets')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'invalid-tickets'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <XCircle className="w-4 h-4" />
                <span>Invalid Tickets</span>
              </div>
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {invalidTicketsCount}
              </span>
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                currentView === 'settings'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Staff User Profile Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-200 text-slate-900 font-bold flex items-center justify-center text-xs">
              NA
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{staffName}</h4>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] text-slate-500">{staffRole}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setAuthStep('login')}
            className="w-full mt-2 py-1.5 text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center justify-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP BAR / EVENT HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center space-x-3 min-w-0">
            <img 
              src={activeEvent.image} 
              alt={activeEvent.title} 
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 truncate">{activeEvent.title}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {activeEvent.date} • {activeEvent.time} • {activeEvent.venueName}
              </p>
            </div>
          </div>

          {/* Gate, Offline Mode & Notification Controls */}
          <div className="flex items-center space-x-2.5 text-xs">
            
            {/* Offline Mode Switcher */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition ${
              isOfflineMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'
            }`}>
              {isOfflineMode ? (
                <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-600" />
              )}
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[11px]">
                  {isOfflineMode ? 'Offline Mode' : 'Cloud Connected'}
                </span>
                <button
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    isOfflineMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  title="Toggle Scanner Offline Mode"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md"></span>
                </button>
              </div>
            </div>

            {/* Sync Queue Badge Button */}
            {offlineQueue.length > 0 && (
              <button
                onClick={() => setShowSyncQueueModal(true)}
                className="bg-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 hover:bg-amber-400 transition shadow-md cursor-pointer animate-bounce"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sync Queue ({offlineQueue.length})</span>
              </button>
            )}

            {/* Notification Center Trigger */}
            <button
              onClick={() => setShowNotifModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl font-bold flex items-center space-x-1.5 transition cursor-pointer"
              title="View Mail & SMS Dispatch Logs"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Mail/SMS</span>
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {notificationLogs.length}
              </span>
            </button>

            <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <MapPin className="w-4 h-4 text-purple-600" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Gate</span>
                <span className="font-bold text-slate-900">{assignedGate}</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('settings')}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="Settings & Preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Persistent Offline Banner when in Offline Mode */}
        {isOfflineMode && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2.5 flex items-center justify-between text-xs font-bold shadow-md">
            <div className="flex items-center space-x-2">
              <WifiOff className="w-4 h-4" />
              <span>OFFLINE SCANNER ACTIVE: Validating tickets against locally cached passes. Scans will queue safely in offline storage.</span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                {offlineQueue.length} Pending Sync
              </span>
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  await syncOfflineScans();
                  setIsSyncing(false);
                }}
                disabled={isSyncing || offlineQueue.length === 0}
                className="bg-slate-950 hover:bg-slate-900 text-white px-3 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 disabled:opacity-50 transition cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Pending Scans'}</span>
              </button>
            </div>
          </div>
        )}


        {/* VIEW SUB-ROUTER */}
        <div className="p-6 space-y-6">

          {/* ==================== SUBVIEW 1: DASHBOARD ==================== */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Area: Scan Ticket Box & Stats */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Scan Ticket Viewfinder Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Scan Ticket</h3>
                        <p className="text-xs text-slate-500">Scan QR code to check-in attendee</p>
                      </div>

                      <button
                        onClick={() => setFlashlightOn(!flashlightOn)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                          flashlightOn 
                            ? 'bg-amber-100 text-amber-900 border-amber-300' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Light</span>
                      </button>
                    </div>

                    {/* Camera Feed Viewfinder */}
                    <div className="h-64 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                      <CameraScannerFeed 
                        scannerId="dash-qr-reader" 
                        onScanSuccess={executeScan} 
                        isCameraActive={isCameraActive} 
                        flashlightOn={flashlightOn} 
                      />
                    </div>

                    {/* Quick Sample Ticket Passes for Instant Demo Testing */}
                    <div className="pt-1 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Quick Sample Passes (Click to Test Scan)</span>
                        <span className="text-emerald-600 font-semibold">{allTickets.length} Passes</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {allTickets.slice(0, 4).map(tk => (
                          <button
                            key={tk.ticketCode}
                            type="button"
                            onClick={() => executeScan(tk.ticketCode)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition flex items-center space-x-1 cursor-pointer ${
                              tk.status === 'CHECKED_IN'
                                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={`Scan ${tk.attendeeName} (${tk.tierName})`}
                          >
                            <Ticket className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{tk.ticketCode}</span>
                            <span className="text-[9px] opacity-75">({tk.status})</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => executeScan('TKT-9999-FAKE')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-[11px] font-mono font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>TKT-INVALID</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-500">Having trouble scanning?</span>
                      <button
                        onClick={() => setCurrentView('manual')}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Try manual check-in
                      </button>
                    </div>

                    {/* Manual Code Form */}
                    <form onSubmit={(e) => { e.preventDefault(); executeScan(scannedInput); }} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Or enter serial code e.g. TKT-1002-8823"
                        value={scannedInput}
                        onChange={e => setScannedInput(e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Scan Code
                      </button>
                    </form>
                  </div>

                  {/* Today's Overview Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-slate-900">Today's Overview</h3>
                      <button onClick={() => setCurrentView('todays-checkins')} className="text-xs text-emerald-600 font-bold hover:underline">
                        View Full Report
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1">
                        <div className="flex justify-between items-center text-emerald-600">
                          <Users className="w-4 h-4" />
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            +12.5%
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{totalCheckIns}</div>
                        <p className="text-[11px] text-slate-500 font-medium">Total Check-Ins</p>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-1">
                        <div className="flex justify-between items-center text-blue-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            95.0%
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{validCheckIns}</div>
                        <p className="text-[11px] text-slate-500 font-medium">Valid Check-Ins</p>
                      </div>

                      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-1">
                        <div className="flex justify-between items-center text-amber-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Pending
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{pendingCheckIns}</div>
                        <p className="text-[11px] text-slate-500 font-medium">Pending Check-Ins</p>
                      </div>

                      <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-1">
                        <div className="flex justify-between items-center text-rose-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                            0.9%
                          </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{invalidTicketsCount}</div>
                        <p className="text-[11px] text-slate-500 font-medium">Invalid Tickets</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Area: Recent Check-Ins & Quick Actions */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Recent Check-Ins Card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Check-Ins</h3>
                      <button onClick={() => setCurrentView('todays-checkins')} className="text-[11px] text-emerald-600 font-bold hover:underline">
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {recentCheckInsFeed.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No check-ins yet for this session.</p>
                      ) : (
                        recentCheckInsFeed.map(tk => (
                          <div key={tk.ticketCode} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-none">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-[10px]">
                                {tk.attendeeName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 truncate">{tk.attendeeName}</h4>
                                <p className="text-[10px] text-slate-400 truncate">{tk.tierName} • {tk.ticketCode}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">{tk.checkedInAt || '10:24 AM'}</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setCurrentView('scan')}
                        className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition"
                      >
                        <QrCode className="w-5 h-5 text-emerald-600" />
                        <span className="text-[10px] font-bold">Scan Ticket</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('manual')}
                        className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition"
                      >
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="text-[10px] font-bold">Manual Check-In</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('search')}
                        className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition"
                      >
                        <Search className="w-5 h-5 text-purple-600" />
                        <span className="text-[10px] font-bold">Search</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('vip-list')}
                        className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition"
                      >
                        <Sparkles className="w-5 h-5 text-amber-600" />
                        <span className="text-[10px] font-bold">VIP List</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('todays-checkins')}
                        className="p-3 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle2 className="w-5 h-5 text-teal-600" />
                        <span className="text-[10px] font-bold">Today's Logs</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('invalid-tickets')}
                        className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition relative"
                      >
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <span className="text-[10px] font-bold">Invalid</span>
                        <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 rounded-full">
                          {invalidTicketsCount}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Active Gate Notice Banner */}
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold">You are checking in for {assignedGate}</p>
                      <p className="text-[10px] text-emerald-700">Ensure every ticket is scanned and validated before entry.</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================== SUBVIEW 2: SCAN TICKET ==================== */}
          {currentView === 'scan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Main Scanner Feed */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span>Scan Ticket</span>
                  </h2>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFlashlightOn(!flashlightOn)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Flashlight</span>
                    </button>
                    <button
                      onClick={() => setIsCameraActive(!isCameraActive)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Flip Camera</span>
                    </button>
                  </div>
                </div>

                {/* Camera Viewfinder */}
                <div className="h-80 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950">
                  <CameraScannerFeed 
                    scannerId="scan-qr-reader" 
                    onScanSuccess={executeScan} 
                    isCameraActive={isCameraActive} 
                    flashlightOn={flashlightOn} 
                  />
                </div>

                {/* Quick Sample Ticket Passes for Instant Demo Testing */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Quick Sample Passes (Click to Test Scan)</span>
                    <span className="text-emerald-600 font-semibold">{allTickets.length} Passes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allTickets.slice(0, 6).map(tk => (
                      <button
                        key={tk.ticketCode}
                        type="button"
                        onClick={() => executeScan(tk.ticketCode)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold border transition flex items-center space-x-1 cursor-pointer ${
                          tk.status === 'CHECKED_IN'
                            ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={`Scan ${tk.attendeeName} (${tk.tierName})`}
                      >
                        <Ticket className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{tk.ticketCode}</span>
                        <span className="text-[9px] opacity-75">({tk.status})</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => executeScan('TKT-9999-FAKE')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-[11px] font-mono font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>TKT-INVALID</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions Bar underneath camera */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => setCurrentView('manual')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Manual Check-In</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('search')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span>Search Attendee</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('invalid-tickets')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>View Invalid Tickets</span>
                  </button>
                </div>
              </div>

              {/* Right Side: Scanning Tips & Recent Checks */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Scanning Tips Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider">Scanning Tips</h3>

                  <div className="space-y-2.5 text-slate-600">
                    <div className="flex items-start gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Ask attendee to present their digital QR pass from mobile screen.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Camera className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Position the QR code centered inside the viewfinder box.</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Sun className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Hold steady and enable flashlight if scanning in dim lighting.</span>
                    </div>
                  </div>
                </div>

                {/* Recent Check-Ins List */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Check-Ins</h3>
                    <button onClick={() => setCurrentView('todays-checkins')} className="text-[11px] text-emerald-600 font-bold hover:underline">
                      View All
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {recentCheckInsFeed.map(tk => (
                      <div key={tk.ticketCode} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-900">{tk.attendeeName}</h4>
                          <p className="text-[10px] text-slate-400">{tk.tierName} • {tk.ticketCode}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">{tk.checkedInAt || '10:24 AM'}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== SUBVIEW 3: MANUAL CHECK-IN ==================== */}
          {currentView === 'manual' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Search Form & Workflow */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Find Attendee</h2>
                  <p className="text-xs text-slate-500">Search attendee details manually to authorize gate check-in</p>
                </div>

                {/* Search Type Tabs */}
                <div className="flex space-x-2 border-b border-slate-100 pb-3 text-xs">
                  <button
                    onClick={() => setSearchTab('email-phone')}
                    className={`px-4 py-2 rounded-xl font-bold transition ${
                      searchTab === 'email-phone'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Search by Email or Phone
                  </button>
                  <button
                    onClick={() => setSearchTab('name')}
                    className={`px-4 py-2 rounded-xl font-bold transition ${
                      searchTab === 'name'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Search by Name
                  </button>
                  <button
                    onClick={() => setSearchTab('ticket-id')}
                    className={`px-4 py-2 rounded-xl font-bold transition ${
                      searchTab === 'ticket-id'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Search by Ticket ID
                  </button>
                </div>

                {/* Search Input Box */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    {searchTab === 'email-phone' && 'Email or Phone Number'}
                    {searchTab === 'name' && 'Full Name'}
                    {searchTab === 'ticket-id' && 'Ticket Serial Code'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={
                        searchTab === 'email-phone' ? 'Enter email address or phone number...' :
                        searchTab === 'name' ? 'Enter attendee full name...' : 'Enter ticket ID e.g. 7362992662288...'
                      }
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => setCurrentView('search')}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                    >
                      Search Attendee
                    </button>
                  </div>
                </div>

                {/* 3 Step How Manual Check-In Works */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">How Manual Check-In Works</h3>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                      <h4 className="font-bold text-slate-900">Find Attendee</h4>
                      <p className="text-[10px] text-slate-500">Search using email, phone number, name or ticket ID.</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                      <h4 className="font-bold text-slate-900">Verify Details</h4>
                      <p className="text-[10px] text-slate-500">Confirm the attendee details and ticket tier tier information.</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
                      <h4 className="font-bold text-slate-900">Check-In</h4>
                      <p className="text-[10px] text-slate-500">Complete check-in and authorize entry pass.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Side: Recent Manual Check-Ins */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Manual Check-Ins</h3>
                    <button onClick={() => setCurrentView('todays-checkins')} className="text-[11px] text-emerald-600 font-bold hover:underline">View All</button>
                  </div>

                  <div className="space-y-2.5">
                    {recentCheckInsFeed.map(tk => (
                      <div key={tk.ticketCode} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-900">{tk.attendeeName}</h4>
                          <p className="text-[10px] text-slate-400">{tk.tierName} • {tk.ticketCode}</p>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Checked In
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips for Manual Check-In */}
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl text-xs text-emerald-900 space-y-2">
                  <h4 className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Tips for Manual Check-In</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Always confirm government-issued ID matching attendee name before manual check-in override.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ==================== SUBVIEW 4: SEARCH ATTENDEE ==================== */}
          {currentView === 'search' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Search Table */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Search Attendee</h2>
                  <p className="text-xs text-slate-500">Search database records across all orders and issue check-in</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by full name, email, or ticket serial code..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <button className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
                    Search
                  </button>
                </div>

                {/* Results Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Search Results</h3>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Attendee</th>
                          <th className="p-3">Ticket Tier</th>
                          <th className="p-3">Ticket Code</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {searchResults.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400">
                              No attendees matching query.
                            </td>
                          </tr>
                        ) : (
                          searchResults.map(tk => (
                            <tr key={tk.ticketCode} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-bold text-slate-900">
                                <div>{tk.attendeeName}</div>
                                <div className="text-[10px] text-slate-400 font-normal">{tk.attendeeEmail}</div>
                              </td>
                              <td className="p-3 text-slate-600">{tk.tierName}</td>
                              <td className="p-3 font-mono text-slate-700">{tk.ticketCode}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tk.status === 'CHECKED_IN'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {tk.status === 'CHECKED_IN' ? 'Checked In' : 'Valid'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setSelectedAttendeeTicket(tk)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Side: Attendee Details Drawer / Recent Searches */}
              <div className="lg:col-span-4 space-y-6">
                
                {selectedAttendeeTicket ? (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase">
                          {selectedAttendeeTicket.status === 'CHECKED_IN' ? 'Checked In' : 'Valid Ticket'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAttendeeTicket.attendeeName}</h3>
                        <p className="text-xs text-slate-400">{selectedAttendeeTicket.attendeeEmail}</p>
                      </div>
                      <button onClick={() => setSelectedAttendeeTicket(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Ticket Type:</span>
                        <span className="font-bold text-slate-900">{selectedAttendeeTicket.tierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ticket ID:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedAttendeeTicket.ticketCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount Paid:</span>
                        <span className="font-bold text-emerald-600">₦{selectedAttendeeTicket.pricePaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Gate:</span>
                        <span className="font-bold text-slate-900">{assignedGate}</span>
                      </div>
                    </div>

                    {selectedAttendeeTicket.status !== 'CHECKED_IN' ? (
                      <button
                        onClick={() => handleForceCheckIn(selectedAttendeeTicket)}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md"
                      >
                        Authorize & Check-In Attendee
                      </button>
                    ) : (
                      <div className="p-3 bg-blue-50 text-blue-900 text-xs font-bold rounded-xl text-center">
                        ✓ Attendee Checked In at {selectedAttendeeTicket.checkedInAt || '10:24 AM'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-center py-12 space-y-2">
                    <User className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-xs font-bold text-slate-700">Select Attendee</h3>
                    <p className="text-[11px] text-slate-400">Click "View Details" on any search result row to view pass information.</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==================== SUBVIEW 5: TODAY'S CHECK-INS ==================== */}
          {currentView === 'todays-checkins' && (
            <div className="space-y-6">
              
              {/* Header bar with Export */}
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900">Today's Check-Ins Report</h2>
                <button className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-xl flex items-center gap-1.5 hover:bg-slate-50">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>

              {/* Charts & Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Doughnut & Progress Chart */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Check-In Summary</h3>

                  <div className="my-6 flex flex-col items-center justify-center relative">
                    <div className="w-36 h-36 rounded-full border-[12px] border-emerald-500 border-t-amber-400 border-r-indigo-500 flex items-center justify-center flex-col">
                      <span className="text-2xl font-black text-slate-900">{totalCheckIns}</span>
                      <span className="text-[10px] font-bold text-slate-400">Total</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Valid Scans</span>
                      <span className="font-bold text-slate-900">{validCheckIns}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Pending</span>
                      <span className="font-bold text-slate-900">{pendingCheckIns}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Invalid</span>
                      <span className="font-bold text-slate-900">{invalidTicketsCount}</span>
                    </div>
                  </div>
                </div>

                {/* Center Top Gates Breakdown */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Gate Activity Breakdown</h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-900 mb-1">
                        <span>VIP Entrance</span>
                        <span>892 Scans (71.8%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[71.8%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-900 mb-1">
                        <span>Gate 2 - Main Hall</span>
                        <span>210 Scans (16.9%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[16.9%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-900 mb-1">
                        <span>Gate 3 - Stage Entry</span>
                        <span>98 Scans (7.9%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full w-[7.9%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Table Filters & Log */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  
                  {/* Filter Pills */}
                  <div className="flex space-x-2 text-xs">
                    <button
                      onClick={() => setCheckinFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        checkinFilter === 'all' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      All Check-Ins
                    </button>
                    <button
                      onClick={() => setCheckinFilter('valid')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        checkinFilter === 'valid' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Valid
                    </button>
                    <button
                      onClick={() => setCheckinFilter('pending')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        checkinFilter === 'pending' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Pending
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search table..."
                    value={checkinTableSearch}
                    onChange={e => setCheckinTableSearch(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Attendee</th>
                        <th className="p-3">Ticket ID</th>
                        <th className="p-3">Ticket Type</th>
                        <th className="p-3">Check-In Time</th>
                        <th className="p-3">Checked In By</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCheckInList.map(tk => (
                        <tr key={tk.ticketCode} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{tk.attendeeName}</td>
                          <td className="p-3 font-mono text-slate-600">{tk.ticketCode}</td>
                          <td className="p-3 text-slate-600">{tk.tierName}</td>
                          <td className="p-3 text-slate-500">{tk.checkedInAt || '10:24 AM'}</td>
                          <td className="p-3 text-slate-600">{staffName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tk.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tk.status === 'CHECKED_IN' ? 'Valid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== SUBVIEW 6: VIP LIST ==================== */}
          {currentView === 'vip-list' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>VIP Guest Directory</span>
                </h2>

                <button className="px-4 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-sm">
                  Export VIP List
                </button>
              </div>

              {/* VIP Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total VIP Tickets</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{vipTickets.length}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Checked-In</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{checkedInVips.length}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Not Checked In</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{notCheckedInVips.length}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">No Show / Pending</span>
                  <div className="text-2xl font-black text-slate-400 mt-1">3</div>
                </div>
              </div>

              {/* VIP Directory Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">VIP Attendees</h3>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">VIP Guest</th>
                        <th className="p-3">Ticket Code</th>
                        <th className="p-3">Access Tier</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vipTickets.map(tk => (
                        <tr key={tk.ticketCode} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{tk.attendeeName}</td>
                          <td className="p-3 font-mono text-slate-600">{tk.ticketCode}</td>
                          <td className="p-3 text-amber-600 font-bold">{tk.tierName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tk.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tk.status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedAttendeeTicket(tk)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px]"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== SUBVIEW 7: INVALID TICKETS ==================== */}
          {currentView === 'invalid-tickets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>Invalid Ticket Scans Log</span>
                </h2>

                <button className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm">
                  Export Invalid Logs
                </button>
              </div>

              {/* Reasons Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Duplicate Scans</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">4</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Expired Tickets</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">3</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Fake / Invalid QR</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">3</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Wrong Gate Entry</span>
                  <div className="text-2xl font-black text-purple-600 mt-1">2</div>
                </div>
              </div>

              {/* Invalid Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Invalid Logs</h3>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Attendee</th>
                        <th className="p-3">Ticket ID</th>
                        <th className="p-3">Rejection Reason</th>
                        <th className="p-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invalidLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{log.attendeeName}</td>
                          <td className="p-3 font-mono text-slate-600">{log.ticketCode}</td>
                          <td className="p-3 font-bold text-rose-600">{log.reason}</td>
                          <td className="p-3 text-slate-500">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== SUBVIEW 8: SETTINGS ==================== */}
          {currentView === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
              
              {/* Settings Inner Sub-Sidebar */}
              <div className="md:col-span-3 bg-slate-50 border-r border-slate-200 p-4 space-y-1 text-xs font-medium">
                <button
                  onClick={() => setSettingsTab('general')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    settingsTab === 'general' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  General Settings
                </button>
                <button
                  onClick={() => setSettingsTab('account')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    settingsTab === 'account' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Account Profile
                </button>
                <button
                  onClick={() => setSettingsTab('notification')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    settingsTab === 'notification' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setSettingsTab('scanner')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition ${
                    settingsTab === 'scanner' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Scanner Hardware
                </button>
              </div>

              {/* Settings Content Box */}
              <div className="md:col-span-9 p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">General Settings</h3>
                  <p className="text-xs text-slate-500">Configure preferences for the gate check-in system terminal</p>
                </div>

                <div className="space-y-4 text-xs max-w-lg">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Language</label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <option>English (US)</option>
                      <option>French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Auto Logout Inactivity</label>
                    <select
                      value={autoLogout}
                      onChange={e => setAutoLogout(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option>15 Minutes</option>
                      <option>30 Minutes</option>
                      <option>1 Hour</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900">Sound Alert</h4>
                      <p className="text-[10px] text-slate-500">Play audio chime on successful or failed scan</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={e => setSoundEnabled(e.target.checked)}
                      className="accent-emerald-500 rounded w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900">Show Attendee Details</h4>
                      <p className="text-[10px] text-slate-500">Display attendee photo & ticket level on scan result</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={showAttendeePhoto}
                      onChange={e => setShowAttendeePhoto(e.target.checked)}
                      className="accent-emerald-500 rounded w-4 h-4"
                    />
                  </div>

                  <button className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm">
                    Save Changes
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* Scan Result Modal Popup */}
      {lastScanResult && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 ${
            lastScanResult.success 
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500/50 text-white' 
              : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-rose-500/50 text-white'
          }`}>
            {/* Status Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  lastScanResult.success 
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30' 
                    : 'bg-rose-500 text-white shadow-rose-500/30'
                }`}>
                  {lastScanResult.success ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <XCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                    lastScanResult.success 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {lastScanResult.success ? 'Access Granted' : 'Access Denied'}
                  </span>
                  <h3 className="text-xl font-black mt-1">
                    {lastScanResult.success ? 'Valid Entry Pass!' : 'Verification Failed'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setLastScanResult(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Response Message */}
            <p className={`text-xs p-3 rounded-2xl font-semibold border ${
              lastScanResult.success 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            }`}>
              {lastScanResult.message}
            </p>

            {/* Ticket Details Box if found */}
            {lastScanResult.ticket && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Attendee Name</span>
                  <span className="font-bold text-white text-sm">{lastScanResult.ticket.attendeeName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Pass Level</span>
                  <span className="font-bold text-emerald-400">{lastScanResult.ticket.tierName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Ticket Code</span>
                  <span className="font-mono font-bold text-white">{lastScanResult.ticket.ticketCode}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Assigned Gate</span>
                  <span className="font-semibold text-slate-200">{assignedGate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Scan Time</span>
                  <span className="font-mono text-slate-300">{lastScanResult.timestamp}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setLastScanResult(null)}
                className={`w-full py-3 rounded-xl font-black text-xs transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                  lastScanResult.success 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Next Ticket</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
      />

      {/* Offline Sync Queue Modal */}
      {showSyncQueueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Offline Scanner Sync Queue</h3>
                  <p className="text-xs text-slate-400">
                    {offlineQueue.length} check-in scans recorded offline and waiting to sync to server
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSyncQueueModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offline Scan List */}
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
              {offlineQueue.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                  No pending offline scans. All check-ins are synced with Cloud database!
                </div>
              ) : (
                offlineQueue.map(item => (
                  <div key={item.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{item.attendeeName}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.2 rounded-full font-bold">
                          {item.tierName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span className="font-mono text-amber-400">{item.ticketCode}</span>
                        <span>• {item.gateName}</span>
                        <span>• {item.scannedAt}</span>
                      </div>
                    </div>

                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                      Pending Sync
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <button
                onClick={() => clearOfflineQueue()}
                disabled={offlineQueue.length === 0}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold disabled:opacity-50 cursor-pointer"
              >
                Clear Queue
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSyncQueueModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    setIsSyncing(true);
                    await syncOfflineScans();
                    setIsSyncing(false);
                    setShowSyncQueueModal(false);
                  }}
                  disabled={offlineQueue.length === 0 || isSyncing}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync All Pending Scans'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


    </div>
  );
};
