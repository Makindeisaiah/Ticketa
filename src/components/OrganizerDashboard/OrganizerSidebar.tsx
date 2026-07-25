import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Ticket, 
  CheckSquare, 
  Settings, 
  Ticket as TicketIcon,
  LogOut,
  ChevronRight
} from 'lucide-react';

export type OrganizerTabType = 
  | 'dashboard' 
  | 'events' 
  | 'analytics' 
  | 'ticket-sales' 
  | 'check-ins' 
  | 'settings';

interface OrganizerSidebarProps {
  activeTab: OrganizerTabType;
  setActiveTab: (tab: OrganizerTabType) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const OrganizerSidebar: React.FC<OrganizerSidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const menuItems: { id: OrganizerTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'ticket-sales', label: 'Ticket Sales', icon: <Ticket className="w-5 h-5" /> },
    { id: 'check-ins', label: 'Check-Ins', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col justify-between p-4">
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

        {/* Footer Organizer Account Info */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">
              FF
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">Flytimefest Ltd</h4>
              <p className="text-[10px] text-slate-500 truncate">info@flytimefest.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
