import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { PlatformType } from '../types';
import { Globe, Smartphone, LayoutDashboard, QrCode, RefreshCw, PlusCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const PlatformHeader: React.FC = () => {
  const { activeNotification, resetAllData, seedLiveSales } = useEventContext();
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPlatform = (): PlatformType => {
    const path = location.pathname;
    if (path.startsWith('/mobile')) return 'attendee-mobile';
    if (path.startsWith('/organizer')) return 'organizer';
    if (path.startsWith('/scanner')) return 'staff-checkin';
    return 'attendee-web';
  };

  const currentPlatform = getCurrentPlatform();

  const platforms: { id: PlatformType; path: string; label: string; sub: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'attendee-web',
      path: '/',
      label: 'Attendee Website',
      sub: 'Public Event Discovery & Booking Portal',
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-blue-600'
    },
    {
      id: 'attendee-mobile',
      path: '/mobile',
      label: 'Attendee Mobile App',
      sub: 'Digital Ticket Wallet & Live Pass',
      icon: <Smartphone className="w-4 h-4" />,
      color: 'bg-indigo-600'
    },
    {
      id: 'organizer',
      path: '/organizer',
      label: 'Organizer Dashboard',
      sub: 'Analytics, Event Management & Sales',
      icon: <LayoutDashboard className="w-4 h-4" />,
      color: 'bg-purple-600'
    },
    {
      id: 'staff-checkin',
      path: '/scanner',
      label: 'Check-ins Staff App',
      sub: 'Gate Scanner & Real-time Validation',
      icon: <QrCode className="w-4 h-4" />,
      color: 'bg-emerald-600'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Brand Logo & Platform Title */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-lg tracking-wider">
                TIX
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  Event Ticketing Suite
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/30">
                    Multi-App System
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Separated applications with real route URLs</p>
              </div>
            </Link>

            {/* Mobile-only seed/reset dropdown */}
            <div className="flex items-center space-x-1 md:hidden">
              <button
                onClick={seedLiveSales}
                className="p-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                title="Simulate Random Ticket Purchase"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Platforms Switcher Navigation Tabs */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full md:w-auto overflow-x-auto scrollbar-none">
            {platforms.map(p => {
              const isActive = currentPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(p.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? `${p.color} text-white shadow-md shadow-indigo-900/40 font-bold scale-[1.02]`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Simulation Controls */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={seedLiveSales}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-xs font-medium text-white rounded-lg transition border border-indigo-400/20 shadow-sm"
              title="Simulate a new live ticket order"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Sale</span>
            </button>
            <button
              onClick={resetAllData}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
              title="Reset sample events and orders"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* Live Sync Cross-Platform Toast Banner */}
      {activeNotification && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs font-medium px-4 py-1.5 text-center flex items-center justify-center space-x-2 shadow-inner border-t border-emerald-400/20 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>{activeNotification}</span>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider text-emerald-100">
            Synced Live
          </span>
        </div>
      )}
    </header>
  );
};

