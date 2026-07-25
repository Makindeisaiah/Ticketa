import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, Order, TicketPass, PlatformType, PromoCode, UserProfile, PaymentCard } from '../types';
import { INITIAL_EVENTS, INITIAL_ORDERS, INITIAL_PROMOS } from '../data/mockEvents';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';

interface ScanResult {
  success: boolean;
  message: string;
  ticket?: TicketPass;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Isaiah',
  lastName: 'Makinde',
  email: 'contact@makindeisaiah.com',
  phone: '+234 812 345 6789',
  paymentCards: [
    {
      id: 'card-1',
      cardNumber: '5199 6204 7383 9937',
      expiryDate: '20/2028',
      cvv: '406',
      cardHolder: 'Makinde Isaiah O',
      isDefault: true
    },
    {
      id: 'card-2',
      cardNumber: '4242 **** **** 3883',
      expiryDate: '12/2027',
      cvv: '123',
      cardHolder: 'Makinde Isaiah O',
      isDefault: false
    }
  ],
  notifications: {
    remainders: true,
    purchaseAlerts: false,
    newEventAlert: false,
    marketing: false,
    newsletter: false
  }
};

interface EventContextType {
  currentPlatform: PlatformType;
  setCurrentPlatform: (platform: PlatformType) => void;
  events: EventItem[];
  orders: Order[];
  allTickets: TicketPass[];
  promos: PromoCode[];
  savedEventIds: string[];
  userProfile: UserProfile;
  activeNotification: string | null;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  
  // Actions
  createNewEvent: (eventData: Omit<EventItem, 'id'>) => void;
  purchaseTickets: (
    eventId: string,
    tierId: string,
    quantity: number,
    attendeeDetails: { name: string; email: string; phone: string },
    paymentMethod: Order['paymentMethod'],
    discountPercentage?: number
  ) => Order | null;
  scanAndCheckInTicket: (ticketCode: string, gateName?: string) => ScanResult;
  manualCheckInByEmail: (emailOrCode: string, gateName?: string) => ScanResult;
  addPromoCode: (code: string, discountPercentage: number) => void;
  toggleSaveEvent: (eventId: string) => void;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  addPaymentCard: (card: Omit<PaymentCard, 'id'>) => void;
  removePaymentCard: (cardId: string) => void;
  resetAllData: () => void;
  seedLiveSales: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlatform, setCurrentPlatform] = useState<PlatformType>('attendee-mobile');
  
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('tix_events');
    if (!saved) return INITIAL_EVENTS;
    try {
      const parsed = JSON.parse(saved) as EventItem[];
      const mapped = parsed.map(data => {
        const defaultEvt = INITIAL_EVENTS.find(i => i.id === data.id);
        if (defaultEvt) {
          return {
            ...data,
            image: defaultEvt.image,
            bannerImage: defaultEvt.bannerImage,
            title: defaultEvt.title,
            location: defaultEvt.location,
            venueName: defaultEvt.venueName,
          };
        }
        return data;
      });
      // Append any new initial events not present in stored state
      const missingInitial = INITIAL_EVENTS.filter(initEvt => !mapped.some(m => m.id === initEvt.id));
      return [...missingInitial, ...mapped];
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tix_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [promos, setPromos] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('tix_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOS;
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('tix_saved_events');
    return saved ? JSON.parse(saved) : ['evt-davido', 'evt-burna'];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tix_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [selectedEventId, setSelectedEventId] = useState<string | null>('evt-davido');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Firestore Subscriptions & Initial Seeding
  useEffect(() => {
    let unsubscribeEvents: () => void;
    let unsubscribeOrders: () => void;

    try {
      // 1. Sync Events from Firestore
      const eventsCol = collection(db, 'events');
      unsubscribeEvents = onSnapshot(eventsCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedEvents = snapshot.docs.map(docSnap => {
            const data = docSnap.data() as EventItem;
            const defaultEvt = INITIAL_EVENTS.find(i => i.id === data.id);
            if (defaultEvt) {
              return {
                ...data,
                image: defaultEvt.image,
                bannerImage: defaultEvt.bannerImage,
                title: defaultEvt.title,
                location: defaultEvt.location,
                venueName: defaultEvt.venueName,
              };
            }
            return data;
          });
          const missingInitial = INITIAL_EVENTS.filter(initEvt => !loadedEvents.some(l => l.id === initEvt.id));
          setEvents([...missingInitial, ...loadedEvents]);
        } else {
          // Seed Initial Events to Firestore if empty
          INITIAL_EVENTS.forEach(async (evt) => {
            await setDoc(doc(db, 'events', evt.id), evt);
          });
        }
      }, (err) => {
        console.warn('Firestore events listener error, using local state:', err);
      });

      // 2. Sync Orders from Firestore
      const ordersCol = collection(db, 'orders');
      unsubscribeOrders = onSnapshot(ordersCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedOrders = snapshot.docs.map(docSnap => docSnap.data() as Order);
          setOrders(loadedOrders);
        } else {
          // Seed Initial Orders to Firestore if empty
          INITIAL_ORDERS.forEach(async (ord) => {
            await setDoc(doc(db, 'orders', ord.id), ord);
          });
        }
      }, (err) => {
        console.warn('Firestore orders listener error, using local state:', err);
      });

    } catch (e) {
      console.error('Failed to connect to Firestore:', e);
    }

    return () => {
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  // Sync state to localStorage for offline fallback
  useEffect(() => {
    localStorage.setItem('tix_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('tix_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('tix_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('tix_saved_events', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem('tix_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Derived list of all tickets
  const allTickets = React.useMemo(() => {
    return orders.flatMap(order => order.tickets);
  }, [orders]);

  const triggerNotification = (text: string) => {
    setActiveNotification(text);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  const createNewEvent = async (eventData: Omit<EventItem, 'id'>) => {
    const newId = `evt-${Date.now().toString().slice(-4)}`;
    const newEvent: EventItem = {
      ...eventData,
      id: newId
    };
    
    // Update local state immediately
    setEvents(prev => [newEvent, ...prev]);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'events', newId), newEvent);
    } catch (err) {
      console.error('Error saving event to Firestore:', err);
    }

    triggerNotification(`Event "${newEvent.title}" published successfully!`);
  };

  const purchaseTickets = (
    eventId: string,
    tierId: string,
    quantity: number,
    attendeeDetails: { name: string; email: string; phone: string },
    paymentMethod: Order['paymentMethod'],
    discountPercentage = 0
  ): Order | null => {
    const eventObj = events.find(e => e.id === eventId);
    if (!eventObj) return null;

    const tier = eventObj.ticketTiers.find(t => t.id === tierId);
    if (!tier || tier.availableQuantity - tier.soldQuantity < quantity) return null;

    // Updated ticket tiers
    const updatedTicketTiers = eventObj.ticketTiers.map(t => {
      if (t.id !== tierId) return t;
      return { ...t, soldQuantity: t.soldQuantity + quantity };
    });

    const updatedEventObj: EventItem = {
      ...eventObj,
      ticketTiers: updatedTicketTiers
    };

    // Update local events state
    setEvents(prevEvents =>
      prevEvents.map(e => (e.id === eventId ? updatedEventObj : e))
    );

    const nowStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const unitPrice = tier.price * (1 - discountPercentage / 100);
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const tickets: TicketPass[] = [];
    for (let i = 0; i < quantity; i++) {
      const ticketCode = `TKT-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${i + 1}`;
      tickets.push({
        ticketCode,
        orderId,
        eventId: eventObj.id,
        eventTitle: eventObj.title,
        eventDate: eventObj.date,
        eventTime: eventObj.time,
        venueName: eventObj.venueName,
        tierName: tier.name,
        attendeeName: i === 0 ? attendeeDetails.name : `${attendeeDetails.name} Guest ${i}`,
        attendeeEmail: attendeeDetails.email,
        attendeePhone: attendeeDetails.phone,
        pricePaid: unitPrice,
        purchaseDate: nowStr,
        status: 'VALID'
      });
    }

    const newOrder: Order = {
      id: orderId,
      eventId: eventObj.id,
      eventTitle: eventObj.title,
      customerName: attendeeDetails.name,
      customerEmail: attendeeDetails.email,
      customerPhone: attendeeDetails.phone,
      totalAmount: unitPrice * quantity,
      paymentMethod,
      purchaseDate: nowStr,
      tickets
    };

    // Update local orders state
    setOrders(prev => [newOrder, ...prev]);

    // Save order & updated event to Firestore async
    (async () => {
      try {
        await setDoc(doc(db, 'orders', orderId), newOrder);
        await setDoc(doc(db, 'events', eventId), updatedEventObj);
      } catch (err) {
        console.error('Error writing order to Firestore:', err);
      }
    })();

    triggerNotification(`Order #${orderId} confirmed! ${quantity} x ${tier.name} issued.`);
    return newOrder;
  };

  const scanAndCheckInTicket = (ticketCode: string, gateName = 'Gate #1 - Main Entrance'): ScanResult => {
    const cleanCode = ticketCode.trim().toUpperCase();
    let foundTicket: TicketPass | undefined;
    let targetOrder: Order | undefined;

    for (const order of orders) {
      const t = order.tickets.find(tk => tk.ticketCode.toUpperCase() === cleanCode);
      if (t) {
        foundTicket = t;
        targetOrder = order;
        break;
      }
    }

    if (!foundTicket || !targetOrder) {
      return {
        success: false,
        message: `Invalid Code: Ticket "${cleanCode}" not found in system records.`
      };
    }

    if (foundTicket.status === 'CHECKED_IN') {
      return {
        success: false,
        message: `ALREADY CHECKED IN at ${foundTicket.checkedInAt || 'earlier'} by ${foundTicket.scannedByGate || 'Gate Staff'}.`,
        ticket: foundTicket
      };
    }

    if (foundTicket.status === 'CANCELLED') {
      return {
        success: false,
        message: 'CANCELLED TICKET: This pass has been voided by event management.',
        ticket: foundTicket
      };
    }

    const nowStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const updatedTicket: TicketPass = {
      ...foundTicket,
      status: 'CHECKED_IN',
      checkedInAt: nowStr,
      scannedByGate: gateName,
      gateNumber: gateName.split('-')[0].trim()
    };

    const updatedOrder: Order = {
      ...targetOrder,
      tickets: targetOrder.tickets.map(tk => (tk.ticketCode === foundTicket!.ticketCode ? updatedTicket : tk))
    };

    // Update in local state
    setOrders(prevOrders =>
      prevOrders.map(ord => (ord.id === targetOrder!.id ? updatedOrder : ord))
    );

    // Save to Firestore
    (async () => {
      try {
        await setDoc(doc(db, 'orders', targetOrder!.id), updatedOrder);
      } catch (err) {
        console.error('Error updating ticket check-in in Firestore:', err);
      }
    })();

    triggerNotification(`ENTRY GRANTED: ${updatedTicket.attendeeName} (${updatedTicket.tierName}) at ${gateName}`);

    return {
      success: true,
      message: `Access Granted! Welcome ${updatedTicket.attendeeName}.`,
      ticket: updatedTicket
    };
  };

  const manualCheckInByEmail = (emailOrCode: string, gateName = 'Gate #1 - Main Entrance'): ScanResult => {
    const query = emailOrCode.trim().toLowerCase();
    const candidate = allTickets.find(
      t => t.ticketCode.toLowerCase() === query || t.attendeeEmail.toLowerCase() === query || t.attendeeName.toLowerCase().includes(query)
    );

    if (!candidate) {
      return {
        success: false,
        message: `No matching attendee found for query "${emailOrCode}".`
      };
    }

    return scanAndCheckInTicket(candidate.ticketCode, gateName);
  };

  const addPromoCode = (code: string, discountPercentage: number) => {
    const newPromo: PromoCode = {
      code: code.trim().toUpperCase(),
      discountPercentage,
      active: true,
      usedCount: 0
    };
    setPromos(prev => [newPromo, ...prev]);
    triggerNotification(`Promo Code "${newPromo.code}" created with ${discountPercentage}% discount!`);
  };

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...updated,
      notifications: updated.notifications
        ? { ...prev.notifications, ...updated.notifications }
        : prev.notifications
    }));
    triggerNotification('Profile preferences saved successfully.');
  };

  const addPaymentCard = (cardData: Omit<PaymentCard, 'id'>) => {
    const newCard: PaymentCard = {
      ...cardData,
      id: `card-${Date.now()}`
    };
    setUserProfile(prev => ({
      ...prev,
      paymentCards: newCard.isDefault
        ? [...prev.paymentCards.map(c => ({ ...c, isDefault: false })), newCard]
        : [...prev.paymentCards, newCard]
    }));
    triggerNotification('Payment card added successfully.');
  };

  const removePaymentCard = (cardId: string) => {
    setUserProfile(prev => ({
      ...prev,
      paymentCards: prev.paymentCards.filter(c => c.id !== cardId)
    }));
    triggerNotification('Payment card removed.');
  };

  const resetAllData = async () => {
    setEvents(INITIAL_EVENTS);
    setOrders(INITIAL_ORDERS);
    setPromos(INITIAL_PROMOS);
    setSavedEventIds(['evt-davido', 'evt-burna']);
    setUserProfile(DEFAULT_PROFILE);
    localStorage.removeItem('tix_events');
    localStorage.removeItem('tix_orders');
    localStorage.removeItem('tix_promos');
    localStorage.removeItem('tix_saved_events');
    localStorage.removeItem('tix_user_profile');

    // Reset Firestore collections
    try {
      for (const evt of INITIAL_EVENTS) {
        await setDoc(doc(db, 'events', evt.id), evt);
      }
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }
    } catch (e) {
      console.error('Error resetting Firestore data:', e);
    }

    triggerNotification('Platform dataset restored to factory initial state.');
  };

  const seedLiveSales = () => {
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    if (!randomEvent || !randomEvent.ticketTiers.length) return;

    const randomTier = randomEvent.ticketTiers[Math.floor(Math.random() * randomEvent.ticketTiers.length)];
    const sampleNames = ['Elena Rostova', 'David K.', 'Chloe Bennet', 'Taylor Swift Fan', 'Liam Hemsworth', 'Noah Centineo'];
    const chosenName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    
    purchaseTickets(
      randomEvent.id,
      randomTier.id,
      1,
      { name: chosenName, email: `${chosenName.toLowerCase().replace(/[^a-z]/g, '')}@live.com`, phone: '+1 (555) 019-2834' },
      'Credit Card'
    );
  };

  return (
    <EventContext.Provider
      value={{
        currentPlatform,
        setCurrentPlatform,
        events,
        orders,
        allTickets,
        promos,
        savedEventIds,
        userProfile,
        activeNotification,
        selectedEventId,
        setSelectedEventId,
        createNewEvent,
        purchaseTickets,
        scanAndCheckInTicket,
        manualCheckInByEmail,
        addPromoCode,
        toggleSaveEvent,
        updateUserProfile,
        addPaymentCard,
        removePaymentCard,
        resetAllData,
        seedLiveSales
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
