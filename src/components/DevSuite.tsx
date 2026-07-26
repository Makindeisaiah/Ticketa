import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { 
  Globe, Smartphone, LayoutDashboard, QrCode, 
  Sparkles, RefreshCw, Database, ExternalLink, ShieldAlert,
  ArrowRight, Layers, CheckCircle2
} from 'lucide-react';
import { AppSwitcher } from './AppSwitcher';

export const DevSuite: React.FC = () => {
  const navigate = useNavigate();
  const { seedLiveSales, resetAllData, activeNotification, events, orders, allTickets } = useEventContext();

  const apps = [
    {
      id: 'web',
      name: 'Attendee Website',
      role: 'Public Portal',
      path: '/',
      description: 'Public-facing event discovery and ticket checkout app. Built for general public attendees.',
      icon: <Globe className="w-6 h-6 text-blue-400" />,
      color: 'from-blue-950/80 via-slate-900 to-slate-900 border-blue-500/30 hover:border-blue-500/60',
      badge: 'Public Production'
    },
    {
      id: 'mobile',
      name: 'Attendee Mobile App',
      role: 'Digital Ticket Wallet',
      path: '/mobile',
      description: 'Personal mobile wallet app for attendees to present QR passes and view ticket orders.',
      icon: <Smartphone className="w-6 h-6 text-indigo-400" />,
      color: 'from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500/30 hover:border-indigo-500/60',
      badge: 'Mobile Web App'
    },
    {
      id: 'organizer',
      name: 'Organizer Dashboard',
      role: 'B2B Admin Portal',
      path: '/organizer',
      description: 'Event management, financial analytics, tier setup, and gate check-in controls.',
      icon: <LayoutDashboard className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-950/80 via-slate-900 to-slate-900 border-purple-500/30 hover:border-purple-500/60',
      badge: 'Organizer Admin'
    },
    {
      id: 'scanner',
      name: 'Check-in Staff App',
      role: 'Venue Gate Validator',
      path: '/scanner',
      description: 'High-speed camera scanner feed for gate staff to validate attendee QR passes.',
      icon: <QrCode className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/30 hover:border-emerald-500/60',
      badge: 'Gate Scanner'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
              DEV
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Internal Testing / Demo Route
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  Firebase Realtime
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">Multi-App Suite Testing Hub</h1>
              <p className="text-xs text-slate-400">
                Direct access launcher for each isolated app in the Ticketa Event Ecosystem.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={seedLiveSales}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Ticket Sale</span>
            </button>

            <button
              onClick={resetAllData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center space-x-2 transition border border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {activeNotification && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-fadeIn shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{activeNotification}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-semibold">Active Events in System</p>
            <p className="text-2xl font-black text-white mt-1">{events.length}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-semibold">Total Orders Placed</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{orders.length}</p>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 font-semibold">Issued Ticket Passes</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{allTickets.length}</p>
          </div>
        </div>

        {/* Apps Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map(app => (
            <div
              key={app.id}
              onClick={() => navigate(app.path)}
              className={`p-6 rounded-3xl border bg-gradient-to-br ${app.color} space-y-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl group`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">{app.role}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                  {app.badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {app.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-400 font-semibold">Route: {app.path}</span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 group-hover:bg-emerald-500 text-slate-200 group-hover:text-slate-950 font-bold rounded-xl transition">
                  <span>Open App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Internal Testing Floating Switcher on this route */}
        <AppSwitcher />

      </div>
    </div>
  );
};
