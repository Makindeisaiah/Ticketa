import React, { useState } from 'react';
import { Search, Bell, Menu, ArrowLeft, ChevronDown, Plus, LogOut, Mail, Printer } from 'lucide-react';
import { useLanguage } from '../../utils/translations';
import { useEventContext } from '../../context/EventContext';
import { formatOrganizerCurrency } from '../../utils/currency';

interface OrganizerHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenMobileMenu?: () => void;
  breadcrumb?: string[];
  onBreadcrumbClick?: (index: number) => void;
  onCreateEventClick?: () => void;
  onSeedLiveSales?: () => void;
  onOpenNotifs?: () => void;
  onOpenPrinter?: () => void;
  onLogout?: () => void;
  organizerName?: string;
  organizerEmail?: string;
}

export const OrganizerHeader: React.FC<OrganizerHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenMobileMenu,
  breadcrumb,
  onBreadcrumbClick,
  onCreateEventClick,
  onSeedLiveSales,
  onOpenNotifs,
  onOpenPrinter,
  onLogout,
  organizerName = 'Event Organizer',
  organizerEmail = 'organizer@ticketa.com'
}) => {
  const { lang, changeLanguage, t } = useLanguage();
  const { currentOrganizer } = useEventContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New Ticket Purchased', desc: 'Elena R. bought 2x VIP Pass for Davido Live', time: '2 mins ago', unread: true },
    { id: 2, title: 'Gate Check-In Peak', desc: 'Over 500 tickets scanned at Main Gate in last 15m', time: '12 mins ago', unread: true },
    { id: 3, title: 'Payout Scheduled', desc: `${formatOrganizerCurrency(1466866000, currentOrganizer)} ready for bank processing`, time: '1 hour ago', unread: false },
    { id: 4, title: 'Promo Code Applied', desc: 'Code VIP2026 used for 15% discount', time: '3 hours ago', unread: false },
  ]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & Breadcrumbs / Search Input */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs or Search */}
          {breadcrumb && breadcrumb.length > 0 ? (
            <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold overflow-x-auto py-1">
              <button 
                onClick={() => onBreadcrumbClick && onBreadcrumbClick(0)} 
                className="hover:text-[#00C896] flex items-center gap-1 text-slate-500 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('back')}</span>
              </button>
              <span className="text-slate-300">/</span>
              {breadcrumb.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => onBreadcrumbClick && onBreadcrumbClick(idx)}
                    className={`${idx === breadcrumb.length - 1 ? 'text-slate-900 font-extrabold' : 'hover:text-[#00C896]'}`}
                  >
                    {crumb}
                  </button>
                  {idx < breadcrumb.length - 1 && <span className="text-slate-300">/</span>}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="relative max-w-sm sm:max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#00C896] rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
              />
            </div>
          )}
        </div>

        {/* Right Side: Language Switcher, Quick Actions & Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shrink-0">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => changeLanguage('fr')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                lang === 'fr' ? 'bg-[#00C896] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>🇫🇷</span>
              <span>FR</span>
            </button>
          </div>

          {/* Email / SMS Dispatch Logs Trigger */}
          {onOpenNotifs && (
            <button
              onClick={onOpenNotifs}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
              title="View Email & SMS Pass Dispatch Logs"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{t('dispatchLogs')}</span>
            </button>
          )}

          {/* Thermal Printer Trigger */}
          {onOpenPrinter && (
            <button
              onClick={onOpenPrinter}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
              title="Thermal Wristband & Badge Printer Controls"
            >
              <Printer className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{t('wristbandPrinter')}</span>
            </button>
          )}

          {/* Create New Event Button */}
          {onCreateEventClick && (
            <button
              onClick={onCreateEventClick}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#00C896] hover:bg-[#00b386] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00C896]/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createNewEvent')}</span>
            </button>
          )}

          {/* Notifications Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 relative transition"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">5 New</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs space-y-0.5 border border-slate-200/60">
                      <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile User Badge & Dropdown */}
          <div className="relative border-l border-slate-200 pl-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border-2 border-[#00C896] shadow-sm">
                {organizerName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-extrabold text-slate-800">
                {organizerName.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{organizerName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{organizerEmail}</p>
                </div>
                
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>{t('logOut')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
