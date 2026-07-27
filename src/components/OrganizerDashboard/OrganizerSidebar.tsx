import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Ticket, 
  Users,
  CheckSquare, 
  Settings, 
  Ticket as TicketIcon,
  LogOut,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export type OrganizerTabType = 
  | 'dashboard' 
  | 'events' 
  | 'analytics' 
  | 'ticket-sales' 
  | 'users'
  | 'check-ins' 
  | 'refunds'
  | 'settings';

interface OrganizerSidebarProps {
  activeTab: OrganizerTabType;
  setActiveTab: (tab: OrganizerTabType) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onLogout?: () => void;
  organizerName?: string;
  organizerEmail?: string;
}

export const OrganizerSidebar: React.FC<OrganizerSidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  onLogout,
  organizerName = 'Event Organizer',
  organizerEmail = 'organizer@ticketa.com'
}) => {
  const menuItems: { id: OrganizerTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'ticket-sales', label: 'Ticket Sales', icon: <Ticket className="w-5 h-5" /> },
    { id: 'users', label: 'Users & Customers', icon: <Users className="w-5 h-5" /> },
    { id: 'check-ins', label: 'Check-Ins', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'refunds', label: 'Refund Requests', icon: <RefreshCw className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col justify-between p-4 overflow-y-auto scrollbar-none">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 px-3 py-3 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#00C896] text-white flex items-center justify-center font-bold shadow-md shadow-[#00C896]/30">
              <TicketIcon className="w-6 h-6 rotate-[-12deg]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                TICKETA
              </span>
              <span className="text-[10px] font-bold text-[#00C896] uppercase tracking-wider block -mt-1">
                Organizer Portal
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            {menuItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (setIsMobileOpen) setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00C896] text-white shadow-md shadow-[#00C896]/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Organizer Account Info & Logout Button */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border-2 border-[#00C896] shadow-sm shrink-0">
              {organizerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{organizerName}</h4>
              <p className="text-[10px] text-slate-500 truncate">{organizerEmail}</p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition border border-slate-200 hover:border-rose-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
