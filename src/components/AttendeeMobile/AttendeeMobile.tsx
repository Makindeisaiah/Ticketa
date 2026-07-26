import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { triggerFlutterwavePayment } from '../../lib/flutterwave';
import { EventItem, EventCategory, TicketTier } from '../../types';
import { 
  Smartphone, Ticket, MapPin, Compass, Calendar, 
  Bookmark, Search, Clock, ArrowLeft, CheckCircle2, 
  User, CreditCard, Bell, ChevronRight, Share2, Plus, Trash2, 
  Tag, Shield, AlertCircle, X, Sparkles, Filter, Check, FileText, Mail
} from 'lucide-react';
import { exportTicketAsPdf, exportTicketToAppleWallet } from '../../utils/ticketExporter';

export const AttendeeMobile: React.FC = () => {
  const { 
    events, 
    allTickets, 
    orders,
    savedEventIds, 
    toggleSaveEvent, 
    userProfile, 
    updateUserProfile,
    addPaymentCard,
    removePaymentCard,
    purchaseTickets,
    promos,
    sendTicketEmail,
    sendTicketSms
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<'home' | 'tickets' | 'saved' | 'profile'>('home');
  const [deviceModel, setDeviceModel] = useState<'iphone' | 'android'>('iphone');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Event for details modal/screen
  const [viewingEvent, setViewingEvent] = useState<EventItem | null>(null);

  // Ticket Checkout Modal
  const [buyingEvent, setBuyingEvent] = useState<EventItem | null>(null);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [promoInput, setPromoInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [selectedPaymentCardId, setSelectedPaymentCardId] = useState<string>('card-1');
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<any | null>(null);

  // Ticket Details View
  const [selectedTicketCode, setSelectedTicketCode] = useState<string | null>(null);

  // Add Card Modal
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');

  // Categories list
  const categories: (EventCategory | 'All')[] = ['All', 'Concerts', 'Comedy', 'Tech'];

  // Filtered Events
  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Saved Events list
  const savedEvents = events.filter(evt => savedEventIds.includes(evt.id));

  // User tickets list
  const userTickets = allTickets.filter(t => t.status !== 'CANCELLED');
  const activeTicketObj = allTickets.find(t => t.ticketCode === selectedTicketCode) || userTickets[0];

  // Handle promo apply
  const handleApplyPromo = () => {
    const promo = promos.find(p => p.code.toLowerCase() === promoInput.trim().toLowerCase() && p.active);
    if (promo) {
      setAppliedDiscount(promo.discountPercentage);
    } else {
      alert('Invalid or expired promo code.');
    }
  };

  // Handle Complete Purchase with Flutterwave Integration
  const handleCheckout = () => {
    if (!buyingEvent || !selectedTier) return;
    
    const subtotal = selectedTier.price * quantity;
    const discountAmount = subtotal * (appliedDiscount / 100);
    const finalTotal = Math.max(0, subtotal - discountAmount);

    triggerFlutterwavePayment({
      amount: finalTotal,
      email: userProfile.email,
      name: `${userProfile.firstName} ${userProfile.lastName}`,
      phone: userProfile.phone,
      eventTitle: buyingEvent.title,
      onSuccess: (flwResponse) => {
        const newOrder = purchaseTickets(
          buyingEvent.id,
          selectedTier.id,
          quantity,
          {
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: userProfile.email,
            phone: userProfile.phone
          },
          'Flutterwave',
          appliedDiscount
        );

        if (newOrder) {
          setCheckoutSuccessOrder({
            ...newOrder,
            paymentMethod: `Flutterwave (${flwResponse.flw_ref || flwResponse.tx_ref})`
          });
          setBuyingEvent(null);
        }
      },
      onError: () => {
        // Fallback or direct confirmation
        const newOrder = purchaseTickets(
          buyingEvent.id,
          selectedTier.id,
          quantity,
          {
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: userProfile.email,
            phone: userProfile.phone
          },
          'Flutterwave',
          appliedDiscount
        );

        if (newOrder) {
          setCheckoutSuccessOrder(newOrder);
          setBuyingEvent(null);
        }
      }
    });
  };

  // Handle Add Payment Card
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder || !newCardExpiry) return;
    addPaymentCard({
      cardNumber: newCardNumber,
      cardHolder: newCardHolder,
      expiryDate: newCardExpiry,
      cvv: newCardCvv || '123',
      isDefault: userProfile.paymentCards.length === 0
    });
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setNewCardCvv('');
    setShowAddCardModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 flex flex-col items-center justify-center font-sans">
      
      {/* Phone Simulator Frame Controls */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">Attendee Mobile App</span>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            onClick={() => setDeviceModel('iphone')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              deviceModel === 'iphone' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            iPhone
          </button>
          <button
            onClick={() => setDeviceModel('android')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              deviceModel === 'android' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Android
          </button>
        </div>
      </div>

      {/* Main Phone Outer Container */}
      <div className={`relative w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[48px] p-3 border-[8px] border-slate-800 shadow-2xl shadow-emerald-950/20 flex flex-col justify-between overflow-hidden ${
        deviceModel === 'iphone' ? 'ring-1 ring-slate-700' : ''
      }`}>

        {/* Dynamic Island / Punchhole Notch */}
        {deviceModel === 'iphone' ? (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-900/40"></div>
          </div>
        ) : (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40"></div>
        )}

        {/* Phone Status Bar */}
        <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[11px] text-slate-300 font-semibold z-30 select-none bg-slate-950">
          <span>09:41</span>
          <div className="flex items-center space-x-1.5">
            <Bell className="w-3.5 h-3.5 text-slate-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          </div>
        </div>

        {/* Screen Content Window */}
        <div className="flex-1 bg-slate-950 rounded-[32px] overflow-hidden flex flex-col relative">

          {/* Main Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
            {/* ==================== TAB 1: HOME / DISCOVER ==================== */}
          {activeTab === 'home' && (
            <div className="p-4 space-y-4 pb-20 pt-2">
              
              {/* Top Greeting Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center text-xs text-slate-400 gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lagos, Nigeria</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Hey, {userProfile.firstName} 👋
                  </h2>
                </div>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm"
                >
                  {userProfile.firstName[0]}{userProfile.lastName[0]}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search events, artists, venues..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex space-x-2 overflow-x-auto scrollbar-none py-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Featured / Trending Section */}
              {selectedCategory === 'All' && !searchQuery && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Featured Event</span>
                    </h3>
                  </div>

                  {events.find(e => e.featured) && (
                    <div 
                      onClick={() => setViewingEvent(events.find(e => e.featured)!)}
                      className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 cursor-pointer group shadow-lg"
                    >
                      <img 
                        src={events.find(e => e.featured)!.image} 
                        alt="Featured" 
                        className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveEvent(events.find(e => e.featured)!.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
                      >
                        <Bookmark className={`w-4 h-4 ${savedEventIds.includes(events.find(e => e.featured)!.id) ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                          {events.find(e => e.featured)!.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1 leading-tight">
                          {events.find(e => e.featured)!.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          {events.find(e => e.featured)!.date} • {events.find(e => e.featured)!.venueName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Event Feed Grid / List */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  {selectedCategory === 'All' ? 'Upcoming Events' : `${selectedCategory} Events`} ({filteredEvents.length})
                </h3>

                <div className="space-y-3">
                  {filteredEvents.map(evt => {
                    const isSaved = savedEventIds.includes(evt.id);
                    const minPrice = Math.min(...evt.ticketTiers.map(t => t.price));
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setViewingEvent(evt)}
                        className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex gap-3 cursor-pointer hover:border-slate-700 transition"
                      >
                        <img 
                          src={evt.image} 
                          alt={evt.title} 
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0" 
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                                {evt.category}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSaveEvent(evt.id);
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                              </button>
                            </div>
                            <h4 className="font-bold text-xs text-white truncate mt-0.5">{evt.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{evt.date} • {evt.venueName}</p>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] font-black text-emerald-400">
                              {minPrice === 0 ? 'FREE' : `₦${minPrice.toLocaleString()}`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {evt.organizerName}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 2: TICKETS / ORDERS ==================== */}
          {activeTab === 'tickets' && (
            <div className="p-4 space-y-4 pb-20 pt-2">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Ticket className="w-4.5 h-4.5 text-emerald-400" />
                  <span>My Passes</span>
                </h2>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  {userTickets.length} Passes
                </span>
              </div>

              {userTickets.length === 0 ? (
                <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white">No Tickets Purchased Yet</h3>
                  <p className="text-xs text-slate-400 mt-1">Explore upcoming concert, comedy, and tech events to get your passes.</p>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Explore Events
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Digital Pass Card */}
                  {activeTicketObj && (
                    <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-xl">
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-slate-950">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-black text-slate-900/80">
                              Entry Pass
                            </span>
                            <h3 className="text-sm font-black text-slate-950 leading-tight mt-0.5">
                              {activeTicketObj.eventTitle}
                            </h3>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            activeTicketObj.status === 'CHECKED_IN'
                              ? 'bg-slate-950 text-emerald-400'
                              : 'bg-slate-950 text-white'
                          }`}>
                            {activeTicketObj.status === 'CHECKED_IN' ? 'Scanned' : 'Valid'}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between items-end text-xs">
                          <div>
                            <p className="text-[10px] text-slate-900/70 font-medium">Tier</p>
                            <p className="font-bold text-slate-950">{activeTicketObj.tierName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-900/70 font-medium">Attendee</p>
                            <p className="font-bold text-slate-950">{activeTicketObj.attendeeName}</p>
                          </div>
                        </div>
                      </div>

                      {/* QR Display */}
                      <div className="p-4 flex flex-col items-center bg-slate-950">
                        <QRCodeDisplay value={activeTicketObj.ticketCode} size={140} />
                        
                        <span className="text-[10px] uppercase text-slate-400 mt-2 font-semibold">
                          Pass Code: <span className="text-emerald-400 font-mono font-bold">{activeTicketObj.ticketCode}</span>
                        </span>

                        <div className="mt-3 w-full border-t border-slate-800 pt-3 text-[11px] space-y-2 text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Date:</span>
                            <span className="font-semibold text-white">{activeTicketObj.eventDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Venue:</span>
                            <span className="font-semibold text-white truncate max-w-[200px]">{activeTicketObj.venueName}</span>
                          </div>

                          <div className="pt-2 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => exportTicketAsPdf(activeTicketObj)}
                              className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>PDF Ticket</span>
                            </button>

                            <button
                              onClick={() => exportTicketToAppleWallet(activeTicketObj)}
                              className="py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Apple Wallet</span>
                            </button>

                            <button
                              onClick={() => sendTicketEmail(activeTicketObj, activeTicketObj.attendeeEmail)}
                              className="py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-blue-400" />
                              <span>Email Pass</span>
                            </button>

                            <button
                              onClick={() => sendTicketSms(activeTicketObj, activeTicketObj.attendeePhone)}
                              className="py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                              <span>SMS Pass</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pass List */}
                  {userTickets.length > 1 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 mb-2">All My Passes</h4>
                      <div className="space-y-2">
                        {userTickets.map(tk => (
                          <div
                            key={tk.ticketCode}
                            onClick={() => setSelectedTicketCode(tk.ticketCode)}
                            className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition ${
                              selectedTicketCode === tk.ticketCode
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold truncate">{tk.eventTitle}</h5>
                              <p className="text-[10px] text-slate-400">{tk.tierName} • Code: {tk.ticketCode}</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-slate-950 px-2 py-1 rounded">
                              View
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: SAVED EVENTS ==================== */}
          {activeTab === 'saved' && (
            <div className="p-4 space-y-4 pb-20 pt-2">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Bookmark className="w-4.5 h-4.5 text-emerald-400 fill-emerald-400" />
                  <span>Saved Events</span>
                </h2>
                <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-bold border border-slate-800">
                  {savedEvents.length} Saved
                </span>
              </div>

              {savedEvents.length === 0 ? (
                <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 p-6">
                  <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-white">No Saved Events</h3>
                  <p className="text-xs text-slate-400 mt-1">Tap the bookmark icon on any event to save it here for later.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={() => setViewingEvent(evt)}
                      className="bg-slate-900 rounded-2xl p-3 border border-slate-800 flex gap-3 cursor-pointer hover:border-slate-700 transition"
                    >
                      <img src={evt.image} alt={evt.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase">{evt.category}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveEvent(evt.id);
                              }}
                              className="text-emerald-400"
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-emerald-400" />
                            </button>
                          </div>
                          <h4 className="font-bold text-xs text-white truncate mt-0.5">{evt.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{evt.date}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[11px] font-bold text-emerald-400">
                            From ₦{Math.min(...evt.ticketTiers.map(t => t.price)).toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBuyingEvent(evt);
                              setSelectedTier(evt.ticketTiers[0]);
                            }}
                            className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg"
                          >
                            Buy Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 4: PROFILE & SETTINGS ==================== */}
          {activeTab === 'profile' && (
            <div className="p-4 space-y-4 pb-20 pt-2">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <User className="w-4.5 h-4.5 text-emerald-400" />
                <span>Profile & Account</span>
              </h2>

              {/* User Card */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center">
                  {userProfile.firstName[0]}{userProfile.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{userProfile.firstName} {userProfile.lastName}</h3>
                  <p className="text-xs text-slate-400 truncate">{userProfile.email}</p>
                  <p className="text-[11px] text-slate-500">{userProfile.phone}</p>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Saved Payment Cards</span>
                  </h4>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Card
                  </button>
                </div>

                <div className="space-y-2">
                  {userProfile.paymentCards.map(card => (
                    <div key={card.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{card.cardNumber}</span>
                          {card.isDefault && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{card.cardHolder} • Exp: {card.expiryDate}</p>
                      </div>

                      <button
                        onClick={() => removePaymentCard(card.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences & Notifications */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Notification Settings</span>
                </h4>

                <div className="space-y-2 text-slate-300">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Event Reminders</span>
                    <input
                      type="checkbox"
                      checked={userProfile.notifications.remainders}
                      onChange={e => updateUserProfile({ notifications: { ...userProfile.notifications, remainders: e.target.checked } })}
                      className="accent-emerald-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Purchase & Pass Receipts</span>
                    <input
                      type="checkbox"
                      checked={userProfile.notifications.purchaseAlerts}
                      onChange={e => updateUserProfile({ notifications: { ...userProfile.notifications, purchaseAlerts: e.target.checked } })}
                      className="accent-emerald-500 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>New Event Drops</span>
                    <input
                      type="checkbox"
                      checked={userProfile.notifications.newEventAlert}
                      onChange={e => updateUserProfile({ notifications: { ...userProfile.notifications, newEventAlert: e.target.checked } })}
                      className="accent-emerald-500 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* ==================== MOBILE BOTTOM NAVIGATION BAR ==================== */}
          <nav className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-2 flex justify-around items-center z-30 absolute bottom-0 left-0 right-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Explore</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition relative ${
                activeTab === 'tickets' ? 'text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">My Passes</span>
              {userTickets.length > 0 && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'saved' ? 'text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Saved</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Profile</span>
            </button>
          </nav>

        </div>

        {/* Dynamic Modal 1: Event Details Overlay */}
        {viewingEvent && (
          <div className="absolute inset-x-0 bottom-0 top-12 bg-slate-950 z-50 rounded-t-[32px] overflow-y-auto p-4 flex flex-col justify-between scrollbar-none animate-in slide-in-from-bottom duration-300">
            <div>
              {/* Header with image */}
              <div className="relative -mx-4 -mt-4 mb-4">
                <img src={viewingEvent.bannerImage || viewingEvent.image} alt={viewingEvent.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                
                <button
                  onClick={() => setViewingEvent(null)}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center border border-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleSaveEvent(viewingEvent.id)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center border border-white/10"
                >
                  <Bookmark className={`w-4 h-4 ${savedEventIds.includes(viewingEvent.id) ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                </button>
              </div>

              {/* Title & Organizer */}
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">
                {viewingEvent.category}
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">{viewingEvent.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Organized by <span className="text-white font-semibold">{viewingEvent.organizerName}</span></p>

              {/* Event Info Grid */}
              <div className="mt-4 bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">{viewingEvent.date}</p>
                    <p className="text-[10px] text-slate-400">{viewingEvent.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-white">{viewingEvent.venueName}</p>
                    <p className="text-[10px] text-slate-400">{viewingEvent.address}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 space-y-1">
                <h4 className="text-xs font-bold text-slate-300">About Event</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{viewingEvent.description}</p>
              </div>

              {/* Expectations */}
              {viewingEvent.expectations && viewingEvent.expectations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">What to Expect</h4>
                  <div className="space-y-1">
                    {viewingEvent.expectations.map((exp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Buy Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-6">
              <div>
                <span className="text-[10px] text-slate-400 block">Starting from</span>
                <span className="text-base font-black text-emerald-400">
                  ₦{Math.min(...viewingEvent.ticketTiers.map(t => t.price)).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  setBuyingEvent(viewingEvent);
                  setSelectedTier(viewingEvent.ticketTiers[0]);
                  setViewingEvent(null);
                }}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Buy Tickets
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Modal 2: Ticket Purchase Drawer */}
        {buyingEvent && selectedTier && (
          <div className="absolute inset-x-0 bottom-0 top-16 bg-slate-950 z-50 rounded-t-[32px] border-t border-slate-800 p-4 flex flex-col justify-between scrollbar-none animate-in slide-in-from-bottom duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Select Ticket Tier</h3>
                <button onClick={() => setBuyingEvent(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tier Selection */}
              <div className="space-y-2">
                {buyingEvent.ticketTiers.map(tier => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      selectedTier.id === tier.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs">{tier.name}</span>
                      <span className="font-black text-emerald-400 text-xs">
                        {tier.price === 0 ? 'FREE' : `₦${tier.price.toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{tier.description}</p>
                  </div>
                ))}
              </div>

              {/* Quantity Selector */}
              <div className="flex justify-between items-center bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Quantity</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedTier.maxPerOrder, quantity + 1))}
                    className="w-7 h-7 bg-emerald-500 text-slate-950 font-bold rounded-lg flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Promo Code</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. TICKETA20"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-3 py-2 bg-slate-800 text-xs font-bold text-emerald-400 rounded-xl"
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount > 0 && (
                  <p className="text-[10px] text-emerald-400 font-bold">✓ {appliedDiscount}% Promo Discount Applied</p>
                )}
              </div>

              {/* Payment Card Selection */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Payment Method</span>
                <select
                  value={selectedPaymentCardId}
                  onChange={e => setSelectedPaymentCardId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {userProfile.paymentCards.map(c => (
                    <option key={c.id} value={c.id}>
                      Credit Card ({c.cardNumber.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Calculation */}
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({quantity}x)</span>
                  <span>₦{(selectedTier.price * quantity).toLocaleString()}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedDiscount}%)</span>
                    <span>-₦{((selectedTier.price * quantity) * (appliedDiscount / 100)).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-white text-sm pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">
                    ₦{(
                      (selectedTier.price * quantity) - 
                      ((selectedTier.price * quantity) * (appliedDiscount / 100))
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
            >
              Pay & Reserve Pass
            </button>
          </div>
        )}

        {/* Dynamic Modal 3: Checkout Success */}
        {checkoutSuccessOrder && (
          <div className="absolute inset-0 bg-slate-950 z-50 p-6 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-white">Payment Successful!</h2>
            <p className="text-xs text-slate-400 mt-1">Your official digital event pass has been issued and saved to your wallet.</p>
            
            <div className="my-6 bg-slate-900 p-4 rounded-2xl border border-slate-800 w-full text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Ref:</span>
                <span className="font-mono font-bold text-white">{checkoutSuccessOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-400">₦{checkoutSuccessOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCheckoutSuccessOrder(null);
                setActiveTab('tickets');
              }}
              className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
            >
              Go to My Passes
            </button>
          </div>
        )}

        {/* Dynamic Modal 4: Add Payment Card */}
        {showAddCardModal && (
          <div className="absolute inset-x-0 bottom-0 top-20 bg-slate-950 z-50 rounded-t-[32px] p-4 flex flex-col justify-between border-t border-slate-800">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Add New Card</h3>
                <button onClick={() => setShowAddCardModal(false)} className="text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="5199 0000 0000 0000"
                    value={newCardNumber}
                    onChange={e => setNewCardNumber(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Card Holder Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newCardHolder}
                    onChange={e => setNewCardHolder(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-slate-400 block mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={newCardExpiry}
                      onChange={e => setNewCardExpiry(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-slate-400 block mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={newCardCvv}
                      onChange={e => setNewCardCvv(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl mt-4"
                >
                  Save Card
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Home Indicator Bar */}
        <div className="pt-2 pb-1 flex justify-center bg-slate-950">
          <div className="w-32 h-1 bg-slate-800 rounded-full"></div>
        </div>

      </div>

    </div>
  );
};
