import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { 
  Globe, 
  Smartphone, 
  LayoutDashboard, 
  QrCode, 
  Grid, 
  X, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Database
} from 'lucide-react';

export const AppSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { seedLiveSales, resetAllData, activeNotification } = useEventContext();

  const currentPath = location.pathname;

  const apps = [
    {
      id: 'web',
      name: 'Attendee Website',
      role: 'Public Portal',
      path: '/',
      description: 'Discover events, compare ticket tiers, and purchase tickets online.',
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30',
      btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
      badge: 'Public'
    },
    {
      id: 'mobile',
      name: 'Attendee Mobile App',
      role: 'Digital Ticket Wallet',
      path: '/mobile',
      description: 'Live QR passes, offline ticket wallet, saved events, and profile.',
      icon: <Smartphone className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-600/20 to-purple-600/20 border-indigo-500/30',
      btnColor: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      badge: 'Mobile Web'
    },
    {
      id: 'organizer',
      name: 'Organizer Dashboard',
      role: 'B2B Admin Portal',
      path: '/organizer',
      description: 'Analytics, ticket sales tracking, publishing new events, and financials.',
      icon: <LayoutDashboard className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-600/20 to-pink-600/20 border-purple-500/30',
      btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
      badge: 'Organizer'
    },
    {
      id: 'scanner',
      name: 'Check-ins Staff App',
      role: 'Venue Gate Tool',
      path: '/scanner',
      description: 'Scan attendee QR codes, validate passes, and track gate admissions.',
      icon: <QrCode className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30',
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      badge: 'Gate Staff'
    }
  ];

  const currentApp = apps.find(a => {
    if (a.path === '/') return currentPath === '/' || currentPath.startsWith('/events');
    return currentPath.startsWith(a.path);
  }) || apps[0];

  return (
    <>
      {/* Non-intrusive Floating Launcher Button in Bottom-Right Corner */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {activeNotification && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-full shadow-xl backdrop-blur-md animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{activeNotification}</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900/95 hover:bg-slate-800 text-white rounded-full border border-slate-700/80 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
          title="Switch Application"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <Grid className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            Switch App ({currentApp.name.split(' ')[0]})
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* App Switcher Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                  TIX
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Event Ticketing Suite
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Server DB Synced
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Select an application to launch directly in your browser</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {apps.map(app => {
                const isActive = (app.path === '/' && (currentPath === '/' || currentPath.startsWith('/events'))) ||
                                 (app.path !== '/' && currentPath.startsWith(app.path));

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      navigate(app.path);
                      setIsOpen(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 bg-gradient-to-br ${app.color} ${
                      isActive ? 'ring-2 ring-indigo-500 shadow-xl scale-[1.02]' : 'hover:border-slate-600 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700/50 shadow-inner">
                          {app.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {app.name}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-400">
                            {app.role}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                        {app.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {app.description}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-mono text-slate-400">
                        Route: {app.path}
                      </span>
                      <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold ${app.btnColor} transition`}>
                        <span>{isActive ? 'Current App' : 'Launch'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions & Ecosystem Overview Link */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={seedLiveSales}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg transition font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simulate Sale</span>
                </button>
                <button
                  onClick={resetAllData}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              </div>

              <Link
                to="/apps"
                onClick={() => setIsOpen(false)}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <span>Full Apps Directory Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
