import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';
import { EventItem, TicketTier, Order } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { triggerFlutterwavePayment } from '../../lib/flutterwave';
import { 
  Search, Calendar, MapPin, Tag, ShieldCheck, Ticket, CreditCard, 
  Sparkles, CheckCircle2, ArrowRight, X, Clock, Users, ChevronRight,
  Filter, Lock, Share2, Bookmark, Download, ExternalLink, QrCode,
  Building2, ChevronDown, Check, AlertCircle, ArrowLeft, Copy, Smartphone,
  RefreshCw, Layers, FileText, Mail, Printer, Menu, Facebook, Instagram,
  User, UserPlus, LogIn, LogOut, Languages
} from 'lucide-react';
import { exportTicketAsPdf, exportTicketToAppleWallet, printThermalWristband } from '../../utils/ticketExporter';
import { AuthModal } from '../AuthModal';
import { useLanguage } from '../../utils/translations';
import { formatEventCurrency } from '../../utils/currency';

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.33V9.05a8.16 8.16 0 0 0 3.91 1v-3.36a4.85 4.85 0 0 1-.001-0.001z" />
  </svg>
);

export const AttendeeWeb: React.FC = () => {
  const { lang, changeLanguage, t } = useLanguage();
  const { 
    events, 
    organizers,
    currentOrganizer,
    purchaseTickets, 
    orders, 
    promos, 
    toggleSaveEvent, 
    savedEventIds, 
    setCurrentPlatform, 
    sendTicketEmail, 
    sendTicketSms,
    currentUser,
    userProfile,
    logoutUser
  } = useEventContext();
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'details' | 'checkout' | 'orders' | 'how-it-works'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchError, setSearchError] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All Locations');
  const [dateFilter, setDateFilter] = useState<string>('Any Date');
  const [priceSort, setPriceSort] = useState<'trending' | 'price-low' | 'price-high' | 'date'>('trending');

  const handleHeroSearch = () => {
    if (!searchQuery.trim() && locationFilter === 'All Locations' && dateFilter === 'Any Date') {
      setSearchError('Please fill in the search term or select a location / date filter before searching.');
      return;
    }
    setSearchError('');
    setCurrentView('browse');
  };
  
  // Selected Event & Checkout Selection State
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(events[0] || null);
  const [selectedTiers, setSelectedTiers] = useState<{ [tierId: string]: number }>({});

  const handleNav = (view: 'home' | 'browse' | 'details' | 'checkout' | 'orders' | 'how-it-works' | 'about') => {
    if (eventId) {
      navigate('/', { replace: true });
    }
    if (view === 'about') {
      setCurrentView('browse');
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
      setIsMobileMenuOpen(false);
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Footer Newsletter State
  const [footerNewsletterEmail, setFooterNewsletterEmail] = useState('');
  const [footerNewsletterSubmitted, setFooterNewsletterSubmitted] = useState(false);

  const handleFooterNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerNewsletterEmail.trim() || !footerNewsletterEmail.includes('@')) return;
    setFooterNewsletterSubmitted(true);
    setTimeout(() => {
      setFooterNewsletterEmail('');
      setFooterNewsletterSubmitted(false);
    }, 4000);
  };

  // Direct URL routing sync for /events/:eventId
  useEffect(() => {
    if (eventId && events.length > 0) {
      const match = events.find(e => e.id === eventId || e.id.toLowerCase() === eventId.toLowerCase());
      if (match) {
        setActiveEvent(match);
        const initialTiers: { [tierId: string]: number } = {};
        const matchTiers = Array.isArray(match?.ticketTiers) ? match.ticketTiers : [];
        if (matchTiers.length > 0) {
          initialTiers[matchTiers[0].id] = 1;
        }
        setSelectedTiers(initialTiers);
        setCurrentView('details');
      }
    }
  }, [eventId, events]);

  // Keep activeEvent in sync with database events updates
  useEffect(() => {
    if (events.length > 0) {
      if (!activeEvent) {
        setActiveEvent(events[0]);
      } else {
        const found = events.find(e => e.id === activeEvent.id);
        if (found) {
          setActiveEvent(found);
        } else {
          setActiveEvent(events[0]);
        }
      }
    } else {
      setActiveEvent(null);
    }
  }, [events]);

  
  // Checkout Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || (userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : ''));
  const [email, setEmail] = useState(currentUser?.email || userProfile.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || userProfile.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'Flutterwave' | 'Credit Card' | 'Bank Transfer' | 'USSD'>('Flutterwave');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Card Details State
  const [cardHolder, setCardHolder] = useState(currentUser?.fullName || (userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : ''));
  const [cardNumber, setCardNumber] = useState('5199 •••• •••• 9937');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('406');

  // Sync user profile when currentUser or userProfile changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setCardHolder(currentUser.fullName);
    } else if (userProfile.email) {
      setFullName(`${userProfile.firstName} ${userProfile.lastName}`.trim());
      setEmail(userProfile.email);
      setPhone(userProfile.phone);
      setCardHolder(`${userProfile.firstName} ${userProfile.lastName}`.trim());
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setCardHolder('');
    }
  }, [currentUser, userProfile]);

  // Checkout Processing States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<Order | null>(null);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);

  // Categories definition
  const categories = ['All', 'Concerts', 'Comedy', 'Tech', 'Festival'];
  
  // Dynamic Locations from events or defaults
  const uniqueEventLocations = Array.from(new Set((events || []).map(e => (e && (e.location || e.venueName)) || ''))).filter(Boolean);
  const locations = uniqueEventLocations.length > 0 
    ? ['All Locations', ...uniqueEventLocations] 
    : ['All Locations', "Abidjan, Côte d'Ivoire", 'Lagos, Nigeria', 'Accra, Ghana'];

  const fmtPrice = (amount: number, eventObj?: EventItem | null) => {
    return formatEventCurrency(amount, eventObj || activeEvent, organizers, currentOrganizer);
  };

  const isCategoryMatch = (eventCat: string | undefined, selCat: string) => {
    if (!selCat || selCat === 'All') return true;
    if (!eventCat) return false;
    const eCat = eventCat.toLowerCase().trim();
    const sCat = selCat.toLowerCase().trim();
    return eCat === sCat ||
           eCat === sCat + 's' ||
           sCat === eCat + 's' ||
           eCat.includes(sCat) ||
           sCat.includes(eCat);
  };

  const getCategoryCount = (catName: string) => {
    return (events || []).filter(e => e && isCategoryMatch(e.category, catName)).length;
  };

  const getCategoryLabel = (catName: string) => {
    switch ((catName || '').toLowerCase().trim()) {
      case 'all': return t('catAll');
      case 'concerts': return t('catConcerts');
      case 'comedy': return t('catComedy');
      case 'tech': return t('catTech');
      case 'festival': return t('catFestival');
      case 'exhibition': return t('catExhibition');
      default: return catName;
    }
  };

  // Filtered Events logic
  const filteredEvents = (events || []).filter(e => {
    if (!e) return false;
    const title = e.title || '';
    const location = e.location || '';
    const organizerName = e.organizerName || '';
    const tags = Array.isArray(e.tags) ? e.tags : [];
    const query = (searchQuery || '').toLowerCase();

    const matchesCategory = isCategoryMatch(e.category, selectedCategory);
    const matchesSearch = !query ||
                          title.toLowerCase().includes(query) ||
                          location.toLowerCase().includes(query) ||
                          organizerName.toLowerCase().includes(query) ||
                          tags.some(t => t && t.toLowerCase().includes(query));
    const matchesLocation = locationFilter === 'All Locations' || location.toLowerCase().includes(locationFilter.toLowerCase().split(',')[0]);
    
    return matchesCategory && matchesSearch && matchesLocation;
  }).sort((a, b) => {
    const tiersA = Array.isArray(a.ticketTiers) ? a.ticketTiers : [];
    const tiersB = Array.isArray(b.ticketTiers) ? b.ticketTiers : [];

    if (priceSort === 'price-low') {
      const minA = tiersA.length > 0 ? Math.min(...tiersA.map(t => t.price || 0)) : 0;
      const minB = tiersB.length > 0 ? Math.min(...tiersB.map(t => t.price || 0)) : 0;
      return minA - minB;
    }
    if (priceSort === 'price-high') {
      const maxA = tiersA.length > 0 ? Math.max(...tiersA.map(t => t.price || 0)) : 0;
      const maxB = tiersB.length > 0 ? Math.max(...tiersB.map(t => t.price || 0)) : 0;
      return maxB - maxA;
    }
    return 0;
  });

  const featuredEvents = (events || []).filter(e => e && e.featured);

  // Open Event Details
  const handleOpenEventDetails = (evt: EventItem) => {
    setActiveEvent(evt);
    // Initialize ticket quantities (1 for the first tier that actually has available tickets)
    const initialTiers: { [tierId: string]: number } = {};
    const evtTiers = Array.isArray(evt?.ticketTiers) ? evt.ticketTiers : [];
    const availableTier = evtTiers.find(t => (t.availableQuantity - t.soldQuantity) > 0);
    if (availableTier) {
      initialTiers[availableTier.id] = 1;
    }
    setSelectedTiers(initialTiers);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tier quantity controls
  const handleQuantityChange = (tierId: string, delta: number, max: number, available: number) => {
    setSelectedTiers(prev => {
      const current = prev[tierId] || 0;
      const maxAllowed = Math.min(max, available);
      const updated = Math.max(0, Math.min(maxAllowed, current + delta));
      if (updated === 0) {
        const next = { ...prev };
        delete next[tierId];
        return next;
      }
      return { ...prev, [tierId]: updated };
    });
  };

  // Calculated Order totals
  const totalSelectedTicketsCount = Object.values(selectedTiers).reduce((acc: number, q: number) => acc + q, 0);
  
  const calculateSubtotal = () => {
    if (!activeEvent) return 0;
    const activeTiers = Array.isArray(activeEvent?.ticketTiers) ? activeEvent.ticketTiers : [];
    return activeTiers.reduce((acc, tier) => {
      const qty = selectedTiers[tier.id] || 0;
      return acc + (tier.price * qty);
    }, 0);
  };

  const subtotalPrice = calculateSubtotal();
  const discountAmount = (subtotalPrice * discountPercent) / 100;
  const serviceFee = subtotalPrice > 0 ? Math.min(5000, Math.round(subtotalPrice * 0.025)) : 0;
  const finalTotalPrice = Math.max(0, subtotalPrice - discountAmount + serviceFee);

  // Apply Promo
  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    const found = promos.find(p => p.code.toUpperCase() === promoCode.trim().toUpperCase() && p.active);
    if (found) {
      setDiscountPercent(found.discountPercentage);
      setPromoSuccess(`Code "${found.code}" applied! ${found.discountPercentage}% OFF`);
    } else {
      setPromoError('Invalid or expired promo code');
      setDiscountPercent(0);
    }
  };

  // Submit Order / Payment Execution via Flutterwave or local methods
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || totalSelectedTicketsCount === 0) return;

    setIsProcessingPayment(true);

    if (paymentMethod === 'Flutterwave') {
      // Trigger Official Flutterwave Popup Modal
      triggerFlutterwavePayment({
        amount: finalTotalPrice,
        email,
        name: fullName,
        phone,
        eventTitle: activeEvent.title,
        onSuccess: (flwResponse) => {
          const newOrder = purchaseTickets(
            activeEvent.id,
            selectedTiers,
            { name: fullName, email, phone },
            'Flutterwave',
            discountPercent
          );
          setIsProcessingPayment(false);
          if (newOrder) {
            setPaymentSuccessOrder({
              ...newOrder,
              paymentMethod: `Flutterwave (${flwResponse.flw_ref || flwResponse.tx_ref})`
            });
          }
        },
        onClose: () => {
          setIsProcessingPayment(false);
        },
        onError: () => {
          // Fallback simulation if network or script fails
          const newOrder = purchaseTickets(
            activeEvent.id,
            selectedTiers,
            { name: fullName, email, phone },
            'Flutterwave',
            discountPercent
          );
          setIsProcessingPayment(false);
          if (newOrder) {
            setPaymentSuccessOrder(newOrder);
          }
        }
      });
      return;
    }

    // Direct card / bank transfer simulation
    setTimeout(() => {
      const newOrder = purchaseTickets(
        activeEvent.id,
        selectedTiers,
        { name: fullName, email, phone },
        paymentMethod === 'USSD' || paymentMethod === 'Bank Transfer' ? 'Bank Transfer' : 'Credit Card',
        discountPercent
      );

      setIsProcessingPayment(false);

      if (newOrder) {
        setPaymentSuccessOrder(newOrder);
      }
    }, 1500);
  };

  const copyBankToClipboard = () => {
    navigator.clipboard.writeText('0198273641');
    setCopiedBankAcc(true);
    setTimeout(() => setCopiedBankAcc(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 transition-all shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => handleNav('home')}
                className="flex items-center space-x-2.5 text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  T
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                    TICKETA
                  </span>
                </div>
              </button>

              {/* Primary Navigation Links */}
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => handleNav('browse')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    currentView === 'browse' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {t('browseEvents')}
                </button>
                <button
                  onClick={() => handleNav('how-it-works')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    currentView === 'how-it-works' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {t('howItWorks')}
                </button>
              </nav>
            </div>

            {/* Header Right Actions */}
            {/* Desktop right actions */}
            <div className="hidden md:flex items-center space-x-3">
              
              {/* Language Switcher Pill (English / French) */}
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                    lang === 'en' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to English"
                >
                  <span>🇬🇧</span>
                  <span className="text-[11px]">EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('fr')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                    lang === 'fr' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Traduire en Français"
                >
                  <span>🇫🇷</span>
                  <span className="text-[11px]">FR</span>
                </button>
              </div>

              {currentUser ? (
                <button
                  onClick={() => { setAuthModalMode('signup'); setShowAuthModal(true); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    {currentUser.fullName[0]}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.fullName}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { setAuthModalMode('signup'); setShowAuthModal(true); }}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('signUp')}</span>
                  </button>
                  <button
                    onClick={() => { setAuthModalMode('login'); setShowAuthModal(true); }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700 cursor-pointer flex items-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('signIn')}</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => handleNav('orders')}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-emerald-500/20 flex items-center space-x-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>{t('myWallet')}</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => handleNav('orders')}
                className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-xl transition shadow-md flex items-center justify-center cursor-pointer"
                title={t('myWallet')}
              >
                <Ticket className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5 text-slate-200" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            {/* Primary Nav Links */}
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => handleNav('browse')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                  currentView === 'browse' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Search className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>{t('browseEvents')}</span>
              </button>

              <button
                onClick={() => handleNav('how-it-works')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                  currentView === 'how-it-works' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>{t('howItWorks')}</span>
              </button>

              <button
                onClick={() => handleNav('orders')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                  currentView === 'orders' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Ticket className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>{t('myWallet')}</span>
              </button>
            </div>

            {/* Auth / Profile Section */}
            <div className="pt-3 border-t border-slate-800/80">
              {currentUser ? (
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                      {currentUser.fullName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setAuthModalMode('signup');
                        setShowAuthModal(true);
                      }}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Account</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logoutUser();
                      }}
                      className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthModalMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('signUp')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthModalMode('login');
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t('signIn')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Language Switcher Section */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold">
                <Languages className="w-4 h-4 text-emerald-400" />
                <span>Language / Langue:</span>
              </div>

              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    lang === 'en' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('fr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    lang === 'fr' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🇫🇷</span>
                  <span>FR</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= MAIN CONTENT VIEWS ================= */}
      <div className="flex-1">

        {/* ---------------- 1. HOME VIEW ---------------- */}
        {currentView === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800/80 pt-10 pb-16 px-4 sm:px-6 lg:px-8">
              
              {/* Decorative Lighting Backdrops */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>{t('officialTicketingHub')}</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                    {t('findEventsTitle')}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
                    {t('heroSubtitle')}
                  </p>

                  {/* Integrated Search & Filter Floating Card */}
                  <div className="mt-8 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-xl text-left max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    {/* Search Field */}
                    <div className="sm:col-span-5 relative">
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('searchPlaceholderHero')}
                        value={searchQuery}
                        onChange={e => {
                          setSearchQuery(e.target.value);
                          if (searchError) setSearchError('');
                        }}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    {/* Location Select */}
                    <div className="sm:col-span-3 relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-emerald-400" />
                      <select
                        value={locationFilter}
                        onChange={e => {
                          setLocationFilter(e.target.value);
                          if (searchError) setSearchError('');
                        }}
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white appearance-none focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        {locations.map(loc => (
                          <option key={loc} value={loc}>{loc === 'All Locations' ? t('allLocations') : loc}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Date Filter Select */}
                    <div className="sm:col-span-2 relative">
                      <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-teal-400" />
                      <select
                        value={dateFilter}
                        onChange={e => {
                          setDateFilter(e.target.value);
                          if (searchError) setSearchError('');
                        }}
                        className="w-full pl-9 pr-6 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white appearance-none focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="Any Date">{t('anyDate')}</option>
                        <option value="Today">{t('todayDate')}</option>
                        <option value="This Weekend">{t('thisWeekend')}</option>
                        <option value="This Month">{t('thisMonth')}</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Search Action Button */}
                    <div className="sm:col-span-2">
                      <button
                        onClick={handleHeroSearch}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                        <span>{t('searchBtn')}</span>
                      </button>
                    </div>

                    {searchError && (
                      <div className="sm:col-span-12 flex items-center space-x-2 text-rose-400 text-xs font-bold bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{searchError}</span>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            </section>

            {/* Popular Categories Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t('exploreCategories')}</span>
                  <h2 className="text-2xl font-black text-white mt-1">{t('exploreCategories')}</h2>
                </div>
                <button
                  onClick={() => setCurrentView('browse')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <span>{t('viewAll')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Concerts', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
                  { name: 'Comedy', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80' },
                  { name: 'Tech', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80' },
                  { name: 'Festival', img: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=600&q=80' },
                ].map(cat => {
                  const eventCount = getCategoryCount(cat.name);
                  return (
                    <div
                      key={cat.name}
                      onClick={() => { setSelectedCategory(cat.name); setCurrentView('browse'); }}
                      className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 shadow-lg"
                    >
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors">{getCategoryLabel(cat.name)}</h3>
                        <p className="text-[10px] text-slate-300 font-medium">{eventCount} {eventCount === 1 ? t('eventSingle') : t('eventsPlural')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Featured / Trending Events Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-900">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t('featured')}</span>
                  <h2 className="text-2xl font-black text-white mt-1">{t('trendingLiveEvents')}</h2>
                </div>
                
                {/* Category Pills */}
                <div className="hidden sm:flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {categories.slice(0, 5).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCategory === cat
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length === 0 ? (
                  <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg sm:text-xl font-black text-white">No Published Events Available</h3>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-medium">
                        There are currently no active events in the attendee catalog. Switch to your Organizer account to publish a new event — it will automatically reflect here for attendees to start purchasing tickets!
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setLocationFilter('All Locations'); }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Reset Search Filters
                      </button>
                      <button
                        onClick={() => window.location.hash = '#organizer'}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center space-x-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Create Event from Organizer Account</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredEvents.map(evt => {

                  const tiers = Array.isArray(evt?.ticketTiers) ? evt.ticketTiers : [];
                  const lowestPrice = tiers.length > 0 ? Math.min(...tiers.map(t => t.price || 0)) : 0;
                  const isSaved = savedEventIds.includes(evt.id);
                  const isEventSoldOut = tiers.length > 0 && tiers.every(t => (t.availableQuantity - t.soldQuantity) <= 0);

                  return (
                    <div
                      key={evt.id}
                      className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/30 flex flex-col"
                    >
                      {/* Image Poster */}
                      <div className="relative h-52 overflow-hidden bg-slate-950">
                        <img
                          src={evt.image}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-emerald-400 border border-slate-800">
                            {getCategoryLabel(evt.category)}
                          </div>
                          {isEventSoldOut && (
                            <div className="bg-rose-600 text-white font-black px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider shadow-md">
                              {t('soldOut')}
                            </div>
                          )}
                        </div>

                        {/* Save Bookmark */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveEvent(evt.id); }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
                            isSaved ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:text-white'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        {/* Price Tag Pill */}
                        <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-black shadow-md ${isEventSoldOut ? 'bg-slate-800 text-rose-400 border border-rose-500/30' : 'bg-emerald-500 text-slate-950'}`}>
                          {isEventSoldOut ? t('soldOut') : lowestPrice === 0 ? t('freeUnit') : `${t('from')} ${fmtPrice(lowestPrice, evt)}`}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 mb-1">
                            <span>{t('byOrganizer')} {evt.organizerName}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </div>

                          <h3 
                            onClick={() => handleOpenEventDetails(evt)}
                            className="text-base font-extrabold text-white group-hover:text-emerald-400 cursor-pointer transition-colors line-clamp-1"
                          >
                            {evt.title}
                          </h3>

                          <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{evt.date} • {evt.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              <span className="truncate">{evt.venueName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action */}
                        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="text-[11px] text-slate-400">
                            <span className="text-emerald-400 font-bold">● {t('liveGateCheckIn')}</span>
                          </div>

                          <button
                            onClick={() => handleOpenEventDetails(evt)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1 shadow-md ${
                              isEventSoldOut
                                ? 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10'
                            }`}
                          >
                            <span>{isEventSoldOut ? t('soldOut') : t('buyTickets')}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                }))}
              </div>

            </section>
          </div>
        )}

        {/* ---------------- 2. BROWSE EVENTS CATALOG VIEW ---------------- */}
        {currentView === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                <button onClick={() => setCurrentView('home')} className="hover:text-white">{t('home')}</button>
                <span>/</span>
                <span className="text-emerald-400 font-bold">{t('browseEvents')}</span>
              </div>
              <h1 className="text-3xl font-black text-white">{t('browseAllEvents')}</h1>
              <p className="text-xs text-slate-400 mt-1">{t('browseSubtitle')}</p>
            </div>

            {/* Filter controls bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholderBrowse')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>
                        {loc === 'All Locations' ? t('allLocations') : loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={priceSort}
                    onChange={e => setPriceSort(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="trending">{t('sortByTrending')}</option>
                    <option value="price-low">{t('priceLowToHigh')}</option>
                    <option value="price-high">{t('priceHighToLow')}</option>
                  </select>
                </div>
              </div>

              {/* Category selector row */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                ))}
              </div>

            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(evt => {
                const tiers = Array.isArray(evt?.ticketTiers) ? evt.ticketTiers : [];
                const lowestPrice = tiers.length > 0 ? Math.min(...tiers.map(t => t.price || 0)) : 0;
                const isEventSoldOut = tiers.length > 0 && tiers.every(t => (t.availableQuantity - t.soldQuantity) <= 0);

                return (
                  <div key={evt.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500/50 transition">
                    <div className="relative h-48 bg-slate-950">
                      <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <div className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-slate-800">
                          {getCategoryLabel(evt.category)}
                        </div>
                        {isEventSoldOut && (
                          <div className="bg-rose-600 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shadow-md">
                            {t('soldOut')}
                          </div>
                        )}
                      </div>
                      <div className={`absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-black ${isEventSoldOut ? 'bg-slate-800 text-rose-400 border border-rose-500/30' : 'bg-emerald-500 text-slate-950'}`}>
                        {isEventSoldOut ? t('soldOut') : lowestPrice === 0 ? t('freeUnit') : `${t('from')} ${fmtPrice(lowestPrice, evt)}`}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-white">{evt.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
                        <div className="mt-3 text-xs text-slate-300 space-y-1">
                          <p>📅 {evt.date} • {evt.time}</p>
                          <p>📍 {evt.venueName}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEventDetails(evt)}
                        className={`mt-5 w-full py-2.5 font-black rounded-xl text-xs transition ${
                          isEventSoldOut
                            ? 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        {isEventSoldOut ? t('soldOut') : t('buyTickets')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ---------------- 3. EVENT DETAILS PAGE VIEW ---------------- */}
        {currentView === 'details' && !activeEvent && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Event Not Selected</h2>
            <p className="text-sm text-slate-400 mb-6">Please select an event from the catalog to view details and purchase tickets.</p>
            <button onClick={() => handleNav('home')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition">
              Explore All Events
            </button>
          </div>
        )}

        {currentView === 'details' && activeEvent && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <button onClick={() => setCurrentView('home')} className="hover:text-white">{t('home')}</button>
              <span>/</span>
              <button onClick={() => setCurrentView('browse')} className="hover:text-white">{t('browseEvents')}</button>
              <span>/</span>
              <span className="text-emerald-400 font-bold truncate max-w-xs">{activeEvent?.title}</span>
            </div>

            {/* Poster Banner Header */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 h-72 sm:h-96 shadow-2xl bg-slate-900">
              <img src={activeEvent?.bannerImage || activeEvent?.image} alt={activeEvent?.title || 'Event Poster'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                      {getCategoryLabel(activeEvent?.category || 'Concerts')}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {t('verifiedEvent')}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white">{activeEvent?.title}</h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">{t('hostedBy')} <span className="text-emerald-400 font-bold">{activeEvent?.organizerName}</span></p>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Details Left, Ticket Selector Sticky Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Event Overview & Rules */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Date & Location Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400">{t('dateTime')}</h4>
                      <p className="text-sm font-bold text-white mt-0.5">{activeEvent.date}</p>
                      <p className="text-xs text-emerald-400">{activeEvent.time}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400">{t('locationVenue')}</h4>
                      <p className="text-sm font-bold text-white mt-0.5">{activeEvent.venueName}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{activeEvent.location}</p>
                    </div>
                  </div>
                </div>

                {/* About Event */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">{t('aboutTheEvent')}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeEvent.description}
                  </p>
                  
                  {activeEvent.expectations && activeEvent.expectations.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">{t('whatToExpect')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeEvent.expectations.map((exp, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Rules & Important Info */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">{t('importantInfoRules')}</h3>
                  <div className="space-y-2 text-xs text-slate-300">
                    {activeEvent.importantInfo ? (
                      activeEvent.importantInfo.map((info, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{info}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{t('defaultRule1')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{t('defaultRule2')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{t('defaultRule3')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Organizer Info Card */}
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-lg flex items-center justify-center border border-emerald-500/30">
                      {activeEvent.organizerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-sm font-bold text-white">{activeEvent.organizerName}</h4>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-slate-400">{t('verifiedPartnerOrg')}</p>
                    </div>
                  </div>

                  <button className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700">
                    {t('contactOrganizer')}
                  </button>
                </div>

              </div>

              {/* Right Column: Ticket Tier Selector Sticky Box */}
              <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6 sticky top-20 shadow-2xl">
                
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t('selectTickets')}</span>
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {t('instantGateDelivery')}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{t('ticketTiers')}</h3>
                </div>

                {/* Tiers List */}
                <div className="space-y-3">
                  {(Array.isArray(activeEvent?.ticketTiers) ? activeEvent.ticketTiers : []).map(tier => {
                    const quantity = selectedTiers[tier.id] || 0;
                    const available = Math.max(0, tier.availableQuantity - tier.soldQuantity);
                    const isSoldOut = available <= 0;

                    return (
                      <div
                        key={tier.id}
                        className={`p-4 rounded-2xl border transition ${
                          isSoldOut
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-85'
                            : quantity > 0
                            ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                              {isSoldOut && (
                                <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                  {t('soldOut')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tier.description}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black ${isSoldOut ? 'text-slate-500 line-through' : 'text-emerald-400'}`}>
                              {tier.price === 0 ? t('freeUnit') : fmtPrice(tier.price, activeEvent)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px]">
                            {isSoldOut ? (
                              <span className="font-extrabold text-rose-400">● {t('soldOut')}</span>
                            ) : available < 50 ? (
                              <span className="text-amber-400 font-bold">{t('onlyLeft', { count: available })}</span>
                            ) : (
                              <span className="text-slate-400">{t('available')}</span>
                            )}
                          </span>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(tier.id, -1, tier.maxPerOrder, available)}
                              disabled={quantity === 0 || isSoldOut}
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center transition"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-white w-4 text-center">{isSoldOut ? 0 : quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(tier.id, 1, tier.maxPerOrder, available)}
                              disabled={isSoldOut || quantity >= available || quantity >= tier.maxPerOrder}
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Summary */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t('selectedPassCount')}</span>
                    <span className="font-bold text-white">{totalSelectedTicketsCount} {t('passesUnit')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                    <span>{t('subtotal')}</span>
                    <span className="text-emerald-400">{fmtPrice(subtotalPrice, activeEvent)}</span>
                  </div>
                </div>

                {/* Continue to Checkout Button */}
                <button
                  disabled={totalSelectedTicketsCount === 0}
                  onClick={() => setCurrentView('checkout')}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-sm transition shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  <span>{t('continueToCheckout')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  {t('encryptedPaymentGuarantee')}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ---------------- 4. CHECKOUT & PAYMENT FLOW VIEW ---------------- */}
        {currentView === 'checkout' && !activeEvent && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-xl font-bold text-white mb-2">No Event Selected for Checkout</h2>
            <button onClick={() => setCurrentView('home')} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition">
              Return to Catalog
            </button>
          </div>
        )}

        {currentView === 'checkout' && activeEvent && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            <button
              onClick={() => setCurrentView('details')}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToEventDetails')}</span>
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t('step2Of2')}</span>
              <h1 className="text-3xl font-black text-white mt-1">{t('completeYourTicketOrder')}</h1>
              <p className="text-xs text-slate-400">{activeEvent?.title} • {activeEvent?.date}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Form Input Column */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Buyer Information Card */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-emerald-400">
                    1. {t('contactInformation')}
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">{t('fullName')}</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">{t('emailAddress')}</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">{t('phoneForSmsPasses')}</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Code Card */}
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">{t('applyPromoCode')}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('promoPlaceholder')}
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700"
                    >
                      {t('applyBtn')}
                    </button>
                  </div>
                  {promoSuccess && <p className="text-xs text-emerald-400 font-bold">✓ {promoSuccess}</p>}
                  {promoError && <p className="text-xs text-rose-400 font-bold">✕ {promoError}</p>}
                </div>

                {/* Payment Method Selector */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-emerald-400">
                      {t('selectPaymentGateway')}
                    </h3>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {t('flutterwaveIntegrated')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'Flutterwave', label: 'Flutterwave', sub: 'Instant Modal', icon: Sparkles, badge: 'Popular' },
                      { id: 'Credit Card', label: 'Credit Card', sub: 'Direct Card', icon: CreditCard },
                      { id: 'Bank Transfer', label: 'Bank Transfer', sub: 'Virtual Acc', icon: Building2 },
                      { id: 'USSD', label: 'USSD Code', sub: '*737# Direct', icon: Smartphone },
                    ].map(pm => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as any)}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition relative ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {pm.badge && (
                            <span className="absolute -top-2 right-1 text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                              {pm.badge}
                            </span>
                          )}
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-emerald-400'}`} />
                          <span className="mt-0.5">{pm.label}</span>
                          <span className="text-[10px] font-normal text-slate-400">{pm.sub}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Flutterwave Info Banner */}
                  {paymentMethod === 'Flutterwave' && (
                    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 p-4 rounded-xl border border-amber-500/30 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-lg shadow-amber-500/20 shrink-0">
                          FW
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {t('flutterwaveSecured')}
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                              {t('officialSdk')}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {t('flutterwaveNotice')}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t('pciEncryption')}</span>
                        </span>
                        <span className="text-amber-400 font-mono font-bold">{t('instantPassGen')}</span>
                      </div>
                    </div>
                  )}

                  {/* Card Form */}
                  {paymentMethod === 'Credit Card' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">{t('nameOnCard')}</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={e => setCardHolder(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">{t('cardNumber')}</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">{t('expiryDate')}</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">{t('cvvSecurity')}</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Details */}
                  {paymentMethod === 'Bank Transfer' && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <p className="text-xs text-slate-300">{t('bankTransferNotice')}</p>
                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Wema Bank / Ticketa Checkout</span>
                          <div className="text-base font-mono font-bold text-emerald-400">0198 2736 41</div>
                        </div>
                        <button
                          type="button"
                          onClick={copyBankToClipboard}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg flex items-center space-x-1"
                        >
                          <Copy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{copiedBankAcc ? t('copied') : t('copy')}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">{t('accountActiveNotice')}</p>
                    </div>
                  )}

                  {/* USSD Details */}
                  {paymentMethod === 'USSD' && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-center">
                      <p className="text-xs text-slate-300">{t('ussdNotice')}</p>
                      <div className="text-lg font-mono font-black text-emerald-400 bg-slate-900 py-2.5 rounded-xl border border-slate-800">
                        *737*000*668000#
                      </div>
                      <p className="text-[10px] text-slate-400">{t('instantDebitNotice')}</p>
                    </div>
                  )}

                </div>

              </div>

              {/* Order Summary Right Box */}
              <div className="md:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                <h3 className="text-base font-extrabold text-white border-b border-slate-800 pb-3">{t('orderSummary')}</h3>

                {/* Selected Tiers Breakdown */}
                <div className="space-y-3">
                  {(Array.isArray(activeEvent?.ticketTiers) ? activeEvent.ticketTiers : []).map(tier => {
                    const qty = selectedTiers[tier.id] || 0;
                    if (qty === 0) return null;

                    return (
                      <div key={tier.id} className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white">{tier.name}</span>
                          <span className="text-slate-400 ml-1.5">x{qty}</span>
                        </div>
                        <span className="font-bold text-slate-200">{fmtPrice(tier.price * qty, activeEvent)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{t('subtotal')}</span>
                    <span>{fmtPrice(subtotalPrice, activeEvent)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{t('discount')} ({discountPercent}%)</span>
                      <span>-{fmtPrice(discountAmount, activeEvent)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>{t('gateServiceTechFee')}</span>
                    <span>{fmtPrice(serviceFee, activeEvent)}</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                    <span>{t('totalAmount')}</span>
                    <span className="text-emerald-400">{fmtPrice(finalTotalPrice, activeEvent)}</span>
                  </div>
                </div>

                {/* Pay Action Button */}
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{t('confirmingGateway')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-950" />
                      <span>{t('payNowWithPrice', { price: finalTotalPrice.toLocaleString() })}</span>
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ---------------- 5. MY TICKETS & WALLET VIEW ---------------- */}
        {currentView === 'orders' && (() => {
          const activeUserOrders = currentUser 
            ? orders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() || (currentUser.phone && o.customerPhone === currentUser.phone))
            : userProfile.email
              ? orders.filter(o => o.customerEmail.toLowerCase() === userProfile.email.toLowerCase())
              : [];

          return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('digitalTicketWallet')}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{t('myOrdersLivePasses')}</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentUser 
                      ? `${t('loggedInAs')} ${currentUser.fullName} (${currentUser.email})` 
                      : t('walletDefaultSub')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/mobile')}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-indigo-200" />
                    <span>{t('openMobileAppWallet')}</span>
                  </button>
                </div>
              </div>

              {/* Wallet Summary Metrics */}
              {activeUserOrders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-semibold">{t('totalOrders')}</p>
                    <div className="text-2xl font-black text-white mt-1">{activeUserOrders.length}</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-semibold">{t('activeTicketPasses')}</p>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      {activeUserOrders.reduce((acc, o) => acc + o.tickets.length, 0)}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 font-semibold">{t('totalValuePurchased')}</p>
                    <div className="text-2xl font-black text-teal-300 mt-1">
                      {fmtPrice(activeUserOrders.reduce((acc, o) => acc + o.totalAmount, 0))}
                    </div>
                  </div>
                </div>
              )}

              {activeUserOrders.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
                  <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-300">{t('noTicketsPurchased')}</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {currentUser ? t('welcomeWalletNotice', { name: currentUser.fullName }) : t('exploreEventsNotice')}
                  </p>
                  <button
                    onClick={() => handleNav('browse')}
                    className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition cursor-pointer"
                  >
                    {t('browseEvents')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeUserOrders.map(order => {
                  const eventObj = events.find(e => e.id === order.eventId || e.title === order.eventTitle);
                  const posterImg = eventObj?.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';

                  return (
                    <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={posterImg} 
                            alt={order.eventTitle} 
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0" 
                          />
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                              {t('orderNumber')}{order.id}
                            </span>
                            <h3 className="text-lg sm:text-xl font-black text-white mt-1">{order.eventTitle}</h3>
                            <p className="text-xs text-slate-400">{t('purchasedOnVia', { date: order.purchaseDate, method: order.paymentMethod })}</p>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-xs text-slate-400">{t('totalPaid')}</span>
                          <div className="text-2xl font-black text-emerald-400">{fmtPrice(order.totalAmount, eventObj)}</div>
                        </div>
                      </div>

                      {/* Passes list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.tickets.map(tkt => (
                          <div key={tkt.ticketCode} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <QRCodeDisplay value={tkt.ticketCode} size={90} />
                            
                            <div className="flex-1 text-xs space-y-1.5 w-full">
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-emerald-400">{tkt.ticketCode}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  tkt.status === 'CHECKED_IN'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                                }`}>
                                  {tkt.status === 'CHECKED_IN' ? t('checkedInStatus') : t('validPassStatus')}
                                </span>
                              </div>

                              <p className="font-bold text-white text-sm">{tkt.tierName} {t('passSuffix')}</p>
                              <p className="text-slate-300">{t('holderLabel')} <span className="text-white font-medium">{tkt.attendeeName}</span></p>
                              <p className="text-slate-400 text-[11px]">{tkt.venueName}</p>
                              
                              {tkt.checkedInAt && (
                                <p className="text-[10px] text-emerald-400 font-mono pt-0.5">
                                  {t('scannedLabel')} {tkt.checkedInAt}
                                </p>
                              )}

                              {/* Download & Export Buttons */}
                              <div className="pt-2 flex flex-wrap gap-2">
                                <button
                                  onClick={() => exportTicketAsPdf(tkt)}
                                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                                  title="Download Printable PDF Ticket"
                                >
                                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{t('pdfTicket')}</span>
                                </button>

                                <button
                                  onClick={() => exportTicketToAppleWallet(tkt)}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                                  title="Export to Apple Wallet (.pkpass)"
                                >
                                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{t('appleWallet')}</span>
                                </button>

                                <button
                                  onClick={() => sendTicketEmail(tkt, tkt.attendeeEmail)}
                                  className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                                  title="Resend Pass via Email"
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                                  <span>{t('emailPass')}</span>
                                </button>

                                <button
                                  onClick={() => sendTicketSms(tkt, tkt.attendeePhone)}
                                  className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                                  title="Resend Pass Link via SMS"
                                >
                                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{t('smsPass')}</span>
                                </button>

                                <button
                                  onClick={() => printThermalWristband(tkt, { format: 'WRISTBAND_1X11' })}
                                  className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition cursor-pointer"
                                  title="Print Thermal Event Wristband / Badge"
                                >
                                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{t('wristbandPrint')}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
          );
        })()}

        {/* ---------------- 6. HOW IT WORKS / TRUST PAGE ---------------- */}
        {currentView === 'how-it-works' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t('guaranteedTicketing')}</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white">{t('feelConfidentHeader')}</h1>
              <p className="text-xs sm:text-sm text-slate-300">{t('feelConfidentSub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: t('securePaymentsTitle'), desc: t('securePaymentsDesc'), icon: Lock },
                { title: t('verifiedOrganizersTitle'), desc: t('verifiedOrganizersDesc'), icon: ShieldCheck },
                { title: t('liveQrScansTitle'), desc: t('liveQrScansDesc'), icon: QrCode },
                { title: t('instantDeliveryTitle'), desc: t('instantDeliveryDesc'), icon: Sparkles },
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div key={idx} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{pillar.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* ================= PAYMENT SUCCESS MODAL ================= */}
      {paymentSuccessOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-center space-y-6 shadow-2xl relative animate-fadeIn">
            
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {t('paymentConfirmed')}
              </span>
              <h2 className="text-2xl font-black text-white mt-2">{t('ticketsIssued')}</h2>
              <p className="text-xs text-slate-400 mt-1">{t('orderSavedToWallet', { id: paymentSuccessOrder.id })}</p>
            </div>

            {/* QR Pass Preview */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <QRCodeDisplay value={paymentSuccessOrder.tickets[0].ticketCode} size={140} />
              <div className="text-xs">
                <span className="text-slate-400">{t('passCodeLabel')} </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{paymentSuccessOrder.tickets[0].ticketCode}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t('presentQrNotice')}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPaymentSuccessOrder(null);
                  handleNav('orders');
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg"
              >
                {t('viewInWallet')}
              </button>
              <button
                onClick={() => setPaymentSuccessOrder(null)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                {t('done')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mt-12 text-slate-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: Ticketa Logo & Tagline */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00C896] flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-[#00C896]/20">
                T
              </div>
              <span className="font-black text-lg text-white tracking-wider">TICKETA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footerTagline') || 'Empowering extraordinary live experiences across West Africa. Discover, book, and enjoy events seamlessly.'}
            </p>
          </div>

          {/* COLUMN 2: Newsletter Form & Sign Up Button */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Subscribe to Newsletter
            </h4>
            <p className="text-xs text-slate-400">
              Get weekly updates on hot upcoming concerts, festival passes, and exclusive event announcements.
            </p>
            {footerNewsletterSubmitted ? (
              <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you for subscribing to Ticketa! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleFooterNewsletterSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={footerNewsletterEmail}
                    onChange={(e) => setFooterNewsletterEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00C896]/40 focus:border-[#00C896]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs transition shadow-md shadow-[#00C896]/20 cursor-pointer whitespace-nowrap"
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>

          {/* COLUMN 3: Links & Social Icons */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigation & Community
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-slate-400 font-medium">
              <button onClick={() => handleNav('browse')} className="hover:text-white transition cursor-pointer text-left">
                {t('browseEvents')}
              </button>
              <button onClick={() => handleNav('about')} className="hover:text-white transition cursor-pointer text-left">
                About
              </button>
              <button onClick={() => handleNav('how-it-works')} className="hover:text-white transition cursor-pointer text-left">
                {t('howItWorks')}
              </button>
            </div>

            {/* Social Media Icons: Facebook, X, Instagram, TikTok */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-400 mb-2">Follow Us</p>
              <div className="flex items-center space-x-3 text-slate-400">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#00C896] hover:text-white flex items-center justify-center transition cursor-pointer">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#00C896] hover:text-white flex items-center justify-center transition cursor-pointer">
                  <XIcon className="w-3.5 h-3.5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#00C896] hover:text-white flex items-center justify-center transition cursor-pointer">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#00C896] hover:text-white flex items-center justify-center transition cursor-pointer">
                  <TikTokIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/80 mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-medium gap-2">
          <span>© 2026 Ticketa Inc. All rights reserved.</span>
          <div className="flex space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Support</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Component */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode={authModalMode} 
      />

    </div>
  );
};
