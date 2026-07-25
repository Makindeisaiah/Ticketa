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
  RefreshCw, Layers
} from 'lucide-react';

export const AttendeeWeb: React.FC = () => {
  const { events, purchaseTickets, orders, promos, toggleSaveEvent, savedEventIds, setCurrentPlatform } = useEventContext();
  const { eventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'details' | 'checkout' | 'orders' | 'how-it-works'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All Locations');
  const [dateFilter, setDateFilter] = useState<string>('Any Date');
  const [priceSort, setPriceSort] = useState<'trending' | 'price-low' | 'price-high' | 'date'>('trending');
  
  // Selected Event & Checkout Selection State
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(events[0] || null);
  const [selectedTiers, setSelectedTiers] = useState<{ [tierId: string]: number }>({});

  // Direct URL routing sync for /events/:eventId
  useEffect(() => {
    if (eventId && events.length > 0) {
      const match = events.find(e => e.id === eventId || e.id.toLowerCase() === eventId.toLowerCase());
      if (match) {
        setActiveEvent(match);
        const initialTiers: { [tierId: string]: number } = {};
        if (match.ticketTiers.length > 0) {
          initialTiers[match.ticketTiers[0].id] = 1;
        }
        setSelectedTiers(initialTiers);
        setCurrentView('details');
      }
    }
  }, [eventId, events]);

  
  // Checkout Form State
  const [fullName, setFullName] = useState('Isaiah Makinde');
  const [email, setEmail] = useState('contact@makindeisaiah.com');
  const [phone, setPhone] = useState('+234 812 345 6789');
  const [paymentMethod, setPaymentMethod] = useState<'Flutterwave' | 'Credit Card' | 'Bank Transfer' | 'USSD'>('Flutterwave');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Card Details State
  const [cardHolder, setCardHolder] = useState('Isaiah Makinde');
  const [cardNumber, setCardNumber] = useState('5199 •••• •••• 9937');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('406');

  // Checkout Processing States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<Order | null>(null);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);

  // Categories definition
  const categories = ['All', 'Concerts', 'Comedy', 'Tech', 'Festival', 'Exhibition'];
  const locations = ['All Locations', 'Lagos, Nigeria', 'Edmonton, AB', 'Durham, NC', 'Washington, DC', 'Johannesburg, SA'];

  // Filtered Events logic
  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = locationFilter === 'All Locations' || e.location.toLowerCase().includes(locationFilter.toLowerCase().split(',')[0]);
    
    return matchesCategory && matchesSearch && matchesLocation;
  }).sort((a, b) => {
    if (priceSort === 'price-low') {
      const minA = Math.min(...a.ticketTiers.map(t => t.price));
      const minB = Math.min(...b.ticketTiers.map(t => t.price));
      return minA - minB;
    }
    if (priceSort === 'price-high') {
      const maxA = Math.max(...a.ticketTiers.map(t => t.price));
      const maxB = Math.max(...b.ticketTiers.map(t => t.price));
      return maxB - maxA;
    }
    return 0;
  });

  const featuredEvents = events.filter(e => e.featured);

  // Open Event Details
  const handleOpenEventDetails = (evt: EventItem) => {
    setActiveEvent(evt);
    // Initialize ticket quantities (1 for regular tier)
    const initialTiers: { [tierId: string]: number } = {};
    if (evt.ticketTiers.length > 0) {
      initialTiers[evt.ticketTiers[0].id] = 1;
    }
    setSelectedTiers(initialTiers);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tier quantity controls
  const handleQuantityChange = (tierId: string, delta: number, max: number) => {
    setSelectedTiers(prev => {
      const current = prev[tierId] || 0;
      const updated = Math.max(0, Math.min(max, current + delta));
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
    return activeEvent.ticketTiers.reduce((acc, tier) => {
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
    const primaryTierId = Object.keys(selectedTiers)[0] || activeEvent.ticketTiers[0].id;

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
            primaryTierId,
            totalSelectedTicketsCount,
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
            primaryTierId,
            totalSelectedTicketsCount,
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
        primaryTierId,
        totalSelectedTicketsCount,
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
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
                  onClick={() => setCurrentView('browse')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    currentView === 'browse' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Browse Events
                </button>
                <button
                  onClick={() => setCurrentView('how-it-works')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    currentView === 'how-it-works' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  How it works
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    currentView === 'orders' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                  <span>My Tickets</span>
                  {orders.length > 0 && (
                    <span className="ml-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPlatform('organizer')}
                className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Host / Sell Tickets</span>
              </button>

              <button
                onClick={() => setCurrentView('orders')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
              >
                <Ticket className="w-4 h-4" />
                <span>My Wallet</span>
              </button>
            </div>

          </div>
        </div>
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
                    <span>Official Ticketa Attendee Ticketing Hub</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                    Find Events & Buy <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                      Tickets Easily
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
                    Concert, tech events, comedy shows and more all in one place. Authentic passes with instant live QR gate admission.
                  </p>

                  {/* Integrated Search & Filter Floating Card */}
                  <div className="mt-8 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-xl text-left max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    {/* Search Field */}
                    <div className="sm:col-span-5 relative">
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search event, artist or venue..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>

                    {/* Location Select */}
                    <div className="sm:col-span-3 relative">
                      <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-emerald-400" />
                      <select
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white appearance-none focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        {locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Date Filter Select */}
                    <div className="sm:col-span-2 relative">
                      <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-teal-400" />
                      <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="w-full pl-9 pr-6 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white appearance-none focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="Any Date">Any Date</option>
                        <option value="Today">Today</option>
                        <option value="This Weekend">This Weekend</option>
                        <option value="This Month">This Month</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Search Action Button */}
                    <div className="sm:col-span-2">
                      <button
                        onClick={() => setCurrentView('browse')}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5"
                      >
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            </section>

            {/* Popular Categories Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Categories</span>
                  <h2 className="text-2xl font-black text-white mt-1">Popular Event Categories</h2>
                </div>
                <button
                  onClick={() => setCurrentView('browse')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <span>Explore All</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Concerts', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', count: '12 Events' },
                  { name: 'Comedy', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80', count: '8 Events' },
                  { name: 'Tech', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80', count: '6 Events' },
                  { name: 'Festival', img: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=600&q=80', count: '5 Events' },
                  { name: 'Exhibition', img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80', count: '4 Events' },
                ].map(cat => (
                  <div
                    key={cat.name}
                    onClick={() => { setSelectedCategory(cat.name); setCurrentView('browse'); }}
                    className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-emerald-500/60 transition-all duration-300 shadow-lg"
                  >
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors">{cat.name}</h3>
                      <p className="text-[10px] text-slate-300 font-medium">{cat.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured / Trending Events Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-900">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Featured</span>
                  <h2 className="text-2xl font-black text-white mt-1">Trending Live Events</h2>
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
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(evt => {
                  const lowestPrice = Math.min(...evt.ticketTiers.map(t => t.price));
                  const isSaved = savedEventIds.includes(evt.id);

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
                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-emerald-400 border border-slate-800">
                          {evt.category}
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
                        <div className="absolute bottom-3 right-3 bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black shadow-md">
                          {lowestPrice === 0 ? 'FREE' : `From ₦${lowestPrice.toLocaleString()}`}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400 mb-1">
                            <span>by {evt.organizerName}</span>
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
                            <span className="text-emerald-400 font-bold">● Live Gate</span> Check-in
                          </div>

                          <button
                            onClick={() => handleOpenEventDetails(evt)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center space-x-1 shadow-md shadow-emerald-500/10"
                          >
                            <span>Buy Tickets</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

            </section>
          </div>
        )}

        {/* ---------------- 2. BROWSE EVENTS CATALOG VIEW ---------------- */}
        {currentView === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                <button onClick={() => setCurrentView('home')} className="hover:text-white">Home</button>
                <span>/</span>
                <span className="text-emerald-400 font-bold">Browse Events</span>
              </div>
              <h1 className="text-3xl font-black text-white">Browse All Events</h1>
              <p className="text-xs text-slate-400 mt-1">Discover live concerts, comedy shows, tech summits and festivals across regions.</p>
            </div>

            {/* Filter controls bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by event title, venue, tag or artist..."
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
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={priceSort}
                    onChange={e => setPriceSort(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="trending">Sort by: Trending</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
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
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(evt => {
                const lowestPrice = Math.min(...evt.ticketTiers.map(t => t.price));
                return (
                  <div key={evt.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500/50 transition">
                    <div className="relative h-48 bg-slate-950">
                      <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-slate-800">
                        {evt.category}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-emerald-500 text-slate-950 px-2 py-1 rounded text-xs font-black">
                        {lowestPrice === 0 ? 'FREE' : `From ₦${lowestPrice.toLocaleString()}`}
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
                        className="mt-5 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition"
                      >
                        View & Buy Tickets
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ---------------- 3. EVENT DETAILS PAGE VIEW ---------------- */}
        {currentView === 'details' && activeEvent && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <button onClick={() => setCurrentView('home')} className="hover:text-white">Home</button>
              <span>/</span>
              <button onClick={() => setCurrentView('browse')} className="hover:text-white">Browse Events</button>
              <span>/</span>
              <span className="text-emerald-400 font-bold truncate max-w-xs">{activeEvent.title}</span>
            </div>

            {/* Poster Banner Header */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 h-72 sm:h-96 shadow-2xl bg-slate-900">
              <img src={activeEvent.bannerImage || activeEvent.image} alt={activeEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                      {activeEvent.category}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Verified Event
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white">{activeEvent.title}</h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">Hosted by <span className="text-emerald-400 font-bold">{activeEvent.organizerName}</span></p>
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
                      <h4 className="text-xs font-bold text-slate-400">Date & Time</h4>
                      <p className="text-sm font-bold text-white mt-0.5">{activeEvent.date}</p>
                      <p className="text-xs text-emerald-400">{activeEvent.time}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400">Location & Venue</h4>
                      <p className="text-sm font-bold text-white mt-0.5">{activeEvent.venueName}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{activeEvent.location}</p>
                    </div>
                  </div>
                </div>

                {/* About Event */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">About The Event</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeEvent.description}
                  </p>
                  
                  {activeEvent.expectations && activeEvent.expectations.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">What to expect</h4>
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
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Important Information & Rules</h3>
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
                          <span>Gates open 2 hours prior to scheduled start time.</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Present digital QR pass on mobile or printed PDF at entrance.</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Security screening and bag checks strictly enforced.</span>
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
                      <p className="text-xs text-slate-400">Verified Ticketa Partner Organizer</p>
                    </div>
                  </div>

                  <button className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700">
                    Contact Organizer
                  </button>
                </div>

              </div>

              {/* Right Column: Ticket Tier Selector Sticky Box */}
              <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6 sticky top-20 shadow-2xl">
                
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Select Tickets</span>
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ● Instant Gate Delivery
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">Ticket Tiers</h3>
                </div>

                {/* Tiers List */}
                <div className="space-y-3">
                  {activeEvent.ticketTiers.map(tier => {
                    const quantity = selectedTiers[tier.id] || 0;
                    const available = tier.availableQuantity - tier.soldQuantity;

                    return (
                      <div
                        key={tier.id}
                        className={`p-4 rounded-2xl border transition ${
                          quantity > 0
                            ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tier.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-emerald-400">
                              {tier.price === 0 ? 'FREE' : `₦${tier.price.toLocaleString()}`}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {available < 50 ? `Only ${available} left` : 'Available'}
                          </span>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(tier.id, -1, tier.maxPerOrder)}
                              disabled={quantity === 0}
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-sm flex items-center justify-center transition"
                            >
                              -
                            </button>
                            <span className="text-sm font-black text-white w-4 text-center">{quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(tier.id, 1, tier.maxPerOrder)}
                              disabled={quantity >= tier.maxPerOrder || available === 0}
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-sm flex items-center justify-center transition"
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
                    <span>Selected Pass Count</span>
                    <span className="font-bold text-white">{totalSelectedTicketsCount} Pass(es)</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                    <span>Subtotal</span>
                    <span className="text-emerald-400">₦{subtotalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Continue to Checkout Button */}
                <button
                  disabled={totalSelectedTicketsCount === 0}
                  onClick={() => setCurrentView('checkout')}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black rounded-xl text-sm transition shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  <span>Continue to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  🔒 Encrypted Payment via Gateways • Guaranteed Authentic Pass
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ---------------- 4. CHECKOUT & PAYMENT FLOW VIEW ---------------- */}
        {currentView === 'checkout' && activeEvent && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            <button
              onClick={() => setCurrentView('details')}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Event Details</span>
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Step 2 of 2</span>
              <h1 className="text-3xl font-black text-white mt-1">Complete Your Ticket Order</h1>
              <p className="text-xs text-slate-400">{activeEvent.title} • {activeEvent.date}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Form Input Column */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Buyer Information Card */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-emerald-400">
                    1. Pass Holder Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Email Address (Ticket Pass Delivery)</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (SMS Entrance Alert)</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Code Card */}
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Apply Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. TICKETA20"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl border border-slate-700"
                    >
                      Apply
                    </button>
                  </div>
                  {promoSuccess && <p className="text-xs text-emerald-400 font-bold">✓ {promoSuccess}</p>}
                  {promoError && <p className="text-xs text-rose-400 font-bold">✕ {promoError}</p>}
                </div>

                {/* Payment Method Selector */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider text-emerald-400">
                      2. Select Payment Gateway
                    </h3>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Flutterwave Integrated
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
                            Flutterwave Secured Payment Gateway
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                              Official SDK
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Clicking pay will launch the secure Flutterwave checkout popup allowing payment via Bank Cards, Bank Transfers, USSD, Mobile Money, or NQR.
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>PCI-DSS Level 1 Bank Encryption</span>
                        </span>
                        <span className="text-amber-400 font-mono font-bold">Instant Pass Generation</span>
                      </div>
                    </div>
                  )}

                  {/* Card Form */}
                  {paymentMethod === 'Credit Card' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Name on Card</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={e => setCardHolder(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">CVV Security</label>
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
                      <p className="text-xs text-slate-300">Transfer total amount to the dedicated virtual account below:</p>
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
                          <span>{copiedBankAcc ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">⏱️ Account active for 15:00 minutes. Transfer is auto-verified.</p>
                    </div>
                  )}

                  {/* USSD Details */}
                  {paymentMethod === 'USSD' && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-center">
                      <p className="text-xs text-slate-300">Dial the code below on your mobile device:</p>
                      <div className="text-lg font-mono font-black text-emerald-400 bg-slate-900 py-2.5 rounded-xl border border-slate-800">
                        *737*000*668000#
                      </div>
                      <p className="text-[10px] text-slate-400">Guaranteed instant debit confirmation.</p>
                    </div>
                  )}

                </div>

              </div>

              {/* Order Summary Right Box */}
              <div className="md:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                <h3 className="text-base font-extrabold text-white border-b border-slate-800 pb-3">Order Summary</h3>

                {/* Selected Tiers Breakdown */}
                <div className="space-y-3">
                  {activeEvent.ticketTiers.map(tier => {
                    const qty = selectedTiers[tier.id] || 0;
                    if (qty === 0) return null;

                    return (
                      <div key={tier.id} className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white">{tier.name}</span>
                          <span className="text-slate-400 ml-1.5">x{qty}</span>
                        </div>
                        <span className="font-bold text-slate-200">₦{(tier.price * qty).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>₦{subtotalPrice.toLocaleString()}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({discountPercent}%)</span>
                      <span>-₦{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Gate Service & Tech Fee</span>
                    <span>₦{serviceFee.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                    <span>Total Amount</span>
                    <span className="text-emerald-400">₦{finalTotalPrice.toLocaleString()}</span>
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
                      <span>Confirming with Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-950" />
                      <span>Pay ₦{finalTotalPrice.toLocaleString()} Now</span>
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ---------------- 5. MY TICKETS & WALLET VIEW ---------------- */}
        {currentView === 'orders' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Digital Ticket Wallet</span>
              <h1 className="text-3xl font-black text-white mt-1">My Orders & Live Passes</h1>
              <p className="text-xs text-slate-400">Passes stored here automatically sync to the Staff Check-in Scanner App.</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
                <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">No Tickets Purchased Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Explore upcoming concerts or tech summits to secure your entrance pass.</p>
                <button
                  onClick={() => setCurrentView('browse')}
                  className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                          Order #{order.id}
                        </span>
                        <h3 className="text-xl font-black text-white mt-1">{order.eventTitle}</h3>
                        <p className="text-xs text-slate-400">Purchased on {order.purchaseDate} via {order.paymentMethod}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Total Paid</span>
                        <div className="text-2xl font-black text-emerald-400">₦{order.totalAmount.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Passes list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.tickets.map(tkt => (
                        <div key={tkt.ticketCode} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex gap-4 items-center">
                          <QRCodeDisplay value={tkt.ticketCode} size={90} />
                          
                          <div className="flex-1 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-emerald-400">{tkt.ticketCode}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                tkt.status === 'CHECKED_IN'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              }`}>
                                {tkt.status === 'CHECKED_IN' ? 'Checked In' : 'Valid Pass'}
                              </span>
                            </div>

                            <p className="font-bold text-white text-sm">{tkt.tierName} Pass</p>
                            <p className="text-slate-300">Holder: <span className="text-white font-medium">{tkt.attendeeName}</span></p>
                            <p className="text-slate-400 text-[11px]">{tkt.venueName}</p>
                            
                            {tkt.checkedInAt && (
                              <p className="text-[10px] text-emerald-400 font-mono pt-1">
                                Scanned: {tkt.checkedInAt}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ---------------- 6. HOW IT WORKS / TRUST PAGE ---------------- */}
        {currentView === 'how-it-works' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Guaranteed Ticketing</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white">Feel Confident Buying Tickets on Ticketa</h1>
              <p className="text-xs sm:text-sm text-slate-300">Our platform ensures end-to-end security, instant gate validation, and fraud protection.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Secure Payments', desc: 'Encrypted payment gateways with instant transaction receipts.', icon: Lock },
                { title: 'Verified Organizers', desc: 'All organizers undergo identity and venue verification.', icon: ShieldCheck },
                { title: 'Live QR Scans', desc: 'Fast, hassle-free gate entrance with RFID & barcode scanners.', icon: QrCode },
                { title: 'Instant Delivery', desc: 'Passes delivered to email, wallet, and attendee app immediately.', icon: Sparkles },
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

            {/* CTA for Organizers */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-2xl">
              <div>
                <h2 className="text-2xl font-black text-white">Host Events. Sell Tickets. Get Paid Fast.</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Join thousands of top event organizers using Ticketa to manage ticket sales, check-ins, and automated payouts.
                </p>
              </div>

              <button
                onClick={() => setCurrentPlatform('organizer')}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-xl shadow-emerald-500/20 whitespace-nowrap"
              >
                Create An Event Now
              </button>
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
                Payment Confirmed
              </span>
              <h2 className="text-2xl font-black text-white mt-2">Tickets Issued!</h2>
              <p className="text-xs text-slate-400 mt-1">Order #{paymentSuccessOrder.id} has been saved to your digital wallet.</p>
            </div>

            {/* QR Pass Preview */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <QRCodeDisplay value={paymentSuccessOrder.tickets[0].ticketCode} size={140} />
              <div className="text-xs">
                <span className="text-slate-400">Pass Code: </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{paymentSuccessOrder.tickets[0].ticketCode}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Present this QR code at the entrance gate scanner or in your mobile app.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPaymentSuccessOrder(null);
                  setCurrentView('orders');
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg"
              >
                View in Wallet
              </button>
              <button
                onClick={() => setPaymentSuccessOrder(null)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xs">
              T
            </div>
            <span className="font-bold text-white">TICKETA</span>
            <span>— Complete Multi-Platform Event Ecosystem</span>
          </div>

          <div className="flex space-x-6 text-slate-400">
            <button onClick={() => setCurrentView('browse')} className="hover:text-white">Browse Events</button>
            <button onClick={() => setCurrentView('how-it-works')} className="hover:text-white">How it works</button>
            <button onClick={() => setCurrentView('orders')} className="hover:text-white">My Wallet</button>
            <button onClick={() => setCurrentPlatform('organizer')} className="hover:text-emerald-400">Organizer Dashboard</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
