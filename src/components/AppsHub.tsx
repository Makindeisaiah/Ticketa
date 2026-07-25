import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Smartphone, 
  LayoutDashboard, 
  QrCode, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Database,
  Layers,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';

export const AppsHub: React.FC = () => {
  const { events, orders, seedLiveSales, resetAllData } = useEventContext();

  const totalTicketsSold = events.reduce((acc, e) => acc + e.ticketTiers.reduce((sum, t) => sum + t.soldQuantity, 0), 0);
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const applications = [
    {
      id: 'attendee-web',
      name: 'Attendee Website',
      category: 'Public e-Commerce Portal',
      route: '/',
      tag: 'Desktop & Mobile Web',
      icon: <Globe className="w-7 h-7 text-blue-400" />,
      color: 'from-blue-600/20 via-slate-900 to-slate-900 border-blue-500/30',
      accent: 'text-blue-400',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
      description: 'Public-facing event discovery platform. Attendees can browse events by category or location, select ticket tiers, apply promo codes, checkout securely, and manage ticket wallet.',
      features: ['Event Discovery & Filters', 'Multi-Tier Ticket Selection', 'Checkout & Card Payments', 'Digital Ticket Wallet & Orders']
    },
    {
      id: 'attendee-mobile',
      name: 'Attendee Mobile Application',
      category: 'Digital Wallet & Native Pass',
      route: '/mobile',
      tag: 'PWA / Mobile UI',
      icon: <Smartphone className="w-7 h-7 text-indigo-400" />,
      color: 'from-indigo-600/20 via-slate-900 to-slate-900 border-indigo-500/30',
      accent: 'text-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      description: 'Personal mobile ticket wallet app with bottom navigation bar. Built for attendees on the move to quickly display high-contrast QR passes at gate entrances and view saved events.',
      features: ['Interactive QR Ticket Wallet', 'Mobile Event Feed & Search', 'Offline Pass Saver', 'User Profile & Payment Cards']
    },
    {
      id: 'organizer-dashboard',
      name: 'Organizer Dashboard',
      category: 'B2B Event Management Portal',
      route: '/organizer',
      tag: 'Admin Web Portal',
      icon: <LayoutDashboard className="w-7 h-7 text-purple-400" />,
      color: 'from-purple-600/20 via-slate-900 to-slate-900 border-purple-500/30',
      accent: 'text-purple-400',
      btnBg: 'bg-purple-600 hover:bg-purple-500 text-white',
      description: 'Comprehensive administrative dashboard for event organizers. Track gross revenue, live ticket sales, create and publish new events, generate promotional discount codes, and manage payouts.',
      features: ['Real-time Sales & Revenue Analytics', 'Event Publishing & Tier Builder', 'Live Gate Attendance Monitoring', 'Promo Code Generator & Financials']
    },
    {
      id: 'staff-checkin',
      name: 'Check-ins Staff Application',
      category: 'Gate Operations & Validator',
      route: '/scanner',
      tag: 'Handheld Gate Tool',
      icon: <QrCode className="w-7 h-7 text-emerald-400" />,
      color: 'from-emerald-600/20 via-slate-900 to-slate-900 border-emerald-500/30',
      accent: 'text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      description: 'High-contrast venue gate scanner tool for door staff. Features real camera / simulated QR scanning, manual email lookups, duplicate entry prevention, and live check-in logs.',
      features: ['Instant QR Pass Validation', 'Duplicate Entry Warning System', 'Manual Name / Email Search', 'Gate Selector & Live Attendance Feed']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Separated Multi-Application Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Event Ticketing Ecosystem Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Four independent, dedicated applications synchronized in real-time through a shared Firebase Firestore backend database and local state.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={seedLiveSales}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Simulate Live Order</span>
            </button>
            <button
              onClick={resetAllData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
            >
              <span>Reset Shared Data</span>
            </button>
          </div>
        </div>

        {/* Live Ecosystem Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Shared Database
            </p>
            <p className="text-lg font-black text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Firebase Firestore
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Active Events
            </p>
            <p className="text-xl font-black text-white">{events.length} Listed Events</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Tickets Issued
            </p>
            <p className="text-xl font-black text-white">{totalTicketsSold.toLocaleString()} Passes</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Total Revenue
            </p>
            <p className="text-xl font-black text-emerald-400">₦{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Applications Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {applications.map(app => (
            <div
              key={app.id}
              className={`bg-gradient-to-br ${app.color} border p-8 rounded-3xl space-y-6 shadow-2xl flex flex-col justify-between hover:border-slate-700 transition duration-200`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700/60 shadow-inner">
                    {app.icon}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                    {app.tag}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{app.name}</h2>
                  <p className={`text-xs font-bold uppercase tracking-wider ${app.accent} mt-1`}>
                    {app.category}
                  </p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {app.description}
                </p>

                {/* Key Capabilities */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Modules & Features:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {app.features.map((feat, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Launch Link */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Route URL: <code className="text-indigo-300">{app.route}</code>
                </span>
                <Link
                  to={app.route}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition ${app.btnBg}`}
                >
                  <span>Launch Application</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
