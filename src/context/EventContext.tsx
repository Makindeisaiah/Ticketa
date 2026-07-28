import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  EventItem, Order, TicketPass, PlatformType, PromoCode, 
  UserProfile, PaymentCard, TicketaUser, OfflineScanRecord, NotificationLog, QrTicket
} from '../types';
import { INITIAL_EVENTS, INITIAL_ORDERS, INITIAL_PROMOS, EVENT_IMAGE_OVERRIDE_MAP } from '../data/mockEvents';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs,
  writeBatch 
} from 'firebase/firestore';

export interface ScanResult {
  success: boolean;
  message: string;
  ticket?: TicketPass;
  isOfflineScan?: boolean;
}

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-101',
    orderId: 'ORD-88219',
    ticketCode: 'TKT-1049-A1',
    type: 'EMAIL',
    recipient: 'contact@makindeisaiah.com',
    subject: '🎟️ Official Ticket Pass: Davido Live at Crystal Palace Arena',
    bodyPreview: 'Your VVIP Gold Ticket Pass has been issued! Present the QR code at Gate #1.',
    sentAt: '2026-07-25 18:45:00',
    status: 'DELIVERED'
  },
  {
    id: 'notif-102',
    orderId: 'ORD-88219',
    ticketCode: 'TKT-1049-A1',
    type: 'SMS',
    recipient: '+234 812 345 6789',
    subject: 'Ticketa Mobile Pass Link',
    bodyPreview: 'Ticketa Pass for Davido Live: https://ticketa.app/pass/TKT-1049-A1. Show QR code at entrance.',
    sentAt: '2026-07-25 18:45:05',
    status: 'DELIVERED'
  }
];


export const INITIAL_USERS: TicketaUser[] = [
  {
    id: 'usr-001',
    fullName: 'Isaiah Makinde',
    email: 'contact@makindeisaiah.com',
    phone: '+234 812 345 6789',
    registeredAt: '2026-01-15',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    lastPurchaseDate: '-'
  },
  {
    id: 'usr-002',
    fullName: 'David Adeleke',
    email: 'david@30bg.com',
    phone: '+234 803 111 2233',
    registeredAt: '2026-02-10',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    lastPurchaseDate: '-'
  },
  {
    id: 'usr-003',
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@gmail.com',
    phone: '+1 415 890 1234',
    registeredAt: '2026-03-05',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    lastPurchaseDate: '-'
  },
  {
    id: 'usr-004',
    fullName: 'Chukwudi Okafor',
    email: 'chuks.okafor@techstars.ng',
    phone: '+234 814 990 0011',
    registeredAt: '2026-04-18',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    lastPurchaseDate: '-'
  },
  {
    id: 'usr-005',
    fullName: 'Temi Otedola',
    email: 'temi@otedola.com',
    phone: '+234 809 777 8899',
    registeredAt: '2026-05-01',
    totalOrders: 0,
    totalSpent: 0,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    lastPurchaseDate: '-'
  }
];

const DEFAULT_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  paymentCards: [],
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
  qrTickets: QrTicket[];
  promos: PromoCode[];
  savedEventIds: string[];
  userProfile: UserProfile;
  users: TicketaUser[];
  currentUser: TicketaUser | null;
  activeNotification: string | null;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // Offline Mode & Sync Queue for Scanners
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  offlineQueue: OfflineScanRecord[];
  syncOfflineScans: () => Promise<{ syncedCount: number; errors: number }>;
  clearOfflineQueue: () => void;

  // Email / SMS Ticket Notifications
  notificationLogs: NotificationLog[];
  sendTicketEmail: (orderOrTicket: Order | TicketPass, customEmail?: string) => void;
  sendTicketSms: (orderOrTicket: Order | TicketPass, customPhone?: string) => void;
  clearNotificationLogs: () => void;

  // Actions
  registerUser: (details: { fullName: string; email: string; phone: string; emailVerified?: boolean }) => TicketaUser;
  loginUser: (email: string) => TicketaUser | null;
  logoutUser: () => void;
  createNewEvent: (eventData: Omit<EventItem, 'id'> | EventItem) => void;
  updateEvent: (updatedEvent: EventItem) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  purchaseTickets: (
    eventId: string,
    tierIdOrSelections: string | { [tierId: string]: number },
    quantityOrDetails: number | { name: string; email: string; phone: string },
    attendeeDetailsOrPayment?: { name: string; email: string; phone: string } | Order['paymentMethod'],
    paymentMethodOrDiscount?: Order['paymentMethod'] | number,
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
    const isCleaned = localStorage.getItem('tix_clean_zero_v4');
    if (!isCleaned) {
      localStorage.removeItem('tix_events');
      localStorage.removeItem('tix_orders');
      localStorage.removeItem('tix_all_tickets');
      localStorage.removeItem('tix_qr_tickets');
      localStorage.removeItem('tix_users');
      localStorage.removeItem('tix_saved_events');
      localStorage.removeItem('tix_promos');
      localStorage.setItem('tix_clean_zero_v4', 'true');
      return [];
    }
    const saved = localStorage.getItem('tix_events');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as EventItem[];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tix_orders');
    if (!saved) return [];
    try {
      const list = JSON.parse(saved);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  });

  const [allTickets, setAllTickets] = useState<TicketPass[]>(() => {
    const saved = localStorage.getItem('tix_all_tickets');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [qrTickets, setQrTickets] = useState<QrTicket[]>(() => {
    const saved = localStorage.getItem('tix_qr_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [promos, setPromos] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('tix_promos');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('tix_saved_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tix_user_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [users, setUsers] = useState<TicketaUser[]>(() => {
    const saved = localStorage.getItem('tix_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<TicketaUser | null>(() => {
    const saved = localStorage.getItem('tix_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Offline Mode & Sync Queue States
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineScanRecord[]>(() => {
    const saved = localStorage.getItem('tix_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Notification Logs State
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('tix_notif_log');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Network Connectivity Auto-Detector Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      triggerNotification('Network connection restored. Syncing pending offline scans...');
      syncOfflineScans();
    };

    const handleOffline = () => {
      setIsOfflineMode(true);
      triggerNotification('Network connection lost! Switched to Offline Gate Scanner Mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Persist offline queue and notification logs
  useEffect(() => {
    localStorage.setItem('tix_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    localStorage.setItem('tix_notif_log', JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tix_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tix_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('tix_users', JSON.stringify(users));
  }, [users]);

  // Firestore Subscriptions & Initial Seeding

  useEffect(() => {
    let unsubscribeEvents: () => void;
    let unsubscribeOrders: () => void;
    let unsubscribeUsers: () => void;
    let unsubscribeTickets: () => void;
    let unsubscribeQrTickets: () => void;

    try {
      // 1. Sync Events from Firestore
      const eventsCol = collection(db, 'events');
      unsubscribeEvents = onSnapshot(eventsCol, (snapshot) => {
        if (!snapshot.empty) {
          const legacyIds = [
            'evt-asake', 'evt-ay-lojik-koko-bar', 'evt-1300saint-savior-tour', 
            'evt-davido-crystal-palace', 'evt-burna', 'evt-hardy', 'evt-c5', 
            'evt-travis', 'evt-bovi', 'evt-ayuk', 'evt-ayjam', 'evt-lagoshack', 
            'evt-devops', 'evt-igbesa', 'evt-davido'
          ];
          
          // Purge legacy mock documents from Firestore if present
          snapshot.docs.forEach(async (docSnap) => {
            if (legacyIds.includes(docSnap.id)) {
              try { await deleteDoc(doc(db, 'events', docSnap.id)); } catch (e) {}
            }
          });

          const loadedEvents = snapshot.docs
            .map(docSnap => docSnap.data() as EventItem)
            .filter(e => !legacyIds.includes(e.id));

          setEvents(loadedEvents);
          localStorage.setItem('tix_events', JSON.stringify(loadedEvents));
        } else {
          setEvents([]);
        }
      }, (err) => {
        console.warn('Firestore events listener error, using local state:', err);
      });

      // 2. Sync Orders from Firestore
      const ordersCol = collection(db, 'orders');
      unsubscribeOrders = onSnapshot(ordersCol, (snapshot) => {
        if (!snapshot.empty) {
          const legacyEventIds = [
            'evt-asake', 'evt-ay-lojik-koko-bar', 'evt-1300saint-savior-tour', 
            'evt-davido-crystal-palace', 'evt-burna', 'evt-hardy', 'evt-c5', 
            'evt-travis', 'evt-bovi', 'evt-ayuk', 'evt-ayjam', 'evt-lagoshack', 
            'evt-devops', 'evt-igbesa', 'evt-davido'
          ];

          snapshot.docs.forEach(async (docSnap) => {
            const ord = docSnap.data() as Order;
            if (legacyEventIds.includes(ord.eventId) || docSnap.id.startsWith('ORD-10')) {
              try { await deleteDoc(doc(db, 'orders', docSnap.id)); } catch (e) {}
            }
          });

          const loadedOrders = snapshot.docs
            .map(docSnap => docSnap.data() as Order)
            .filter(ord => !legacyEventIds.includes(ord.eventId));

          setOrders(loadedOrders);
          localStorage.setItem('tix_orders', JSON.stringify(loadedOrders));
        } else {
          setOrders([]);
        }
      }, (err) => {
        console.warn('Firestore orders listener error, using local state:', err);
      });

      // 3. Sync Users from Firestore
      const usersCol = collection(db, 'users');
      unsubscribeUsers = onSnapshot(usersCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedUsers = snapshot.docs.map(docSnap => docSnap.data() as TicketaUser);
          setUsers(loadedUsers);
        } else {
          setUsers([]);
        }
      }, (err) => {
        console.warn('Firestore users listener error, using local state:', err);
      });

      // 4. Sync Tickets from Firestore
      const ticketsCol = collection(db, 'tickets');
      unsubscribeTickets = onSnapshot(ticketsCol, (snapshot) => {
        if (!snapshot.empty) {
          const legacyEventIds = [
            'evt-asake', 'evt-ay-lojik-koko-bar', 'evt-1300saint-savior-tour', 
            'evt-davido-crystal-palace', 'evt-burna', 'evt-hardy', 'evt-c5', 
            'evt-travis', 'evt-bovi', 'evt-ayuk', 'evt-ayjam', 'evt-lagoshack', 
            'evt-devops', 'evt-igbesa', 'evt-davido'
          ];

          snapshot.docs.forEach(async (docSnap) => {
            const tk = docSnap.data() as TicketPass;
            if (legacyEventIds.includes(tk.eventId)) {
              try { await deleteDoc(doc(db, 'tickets', docSnap.id)); } catch (e) {}
            }
          });

          const loadedTickets = snapshot.docs
            .map(docSnap => docSnap.data() as TicketPass)
            .filter(t => !legacyEventIds.includes(t.eventId));

          setAllTickets(loadedTickets);
          localStorage.setItem('tix_all_tickets', JSON.stringify(loadedTickets));
        } else {
          setAllTickets([]);
        }
      }, (err) => {
        console.warn('Firestore tickets listener error:', err);
      });

      // 5. Sync QR Tickets from Firestore
      const qrTicketsCol = collection(db, 'qr_tickets');
      unsubscribeQrTickets = onSnapshot(qrTicketsCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedQr = snapshot.docs.map(docSnap => docSnap.data() as QrTicket);
          setQrTickets(loadedQr);
          localStorage.setItem('tix_qr_tickets', JSON.stringify(loadedQr));
        }
      }, (err) => {
        console.warn('Firestore qr_tickets listener error:', err);
      });

    } catch (e) {
      console.error('Failed to connect to Firestore:', e);
    }

    return () => {
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeTickets) unsubscribeTickets();
      if (unsubscribeQrTickets) unsubscribeQrTickets();
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
    localStorage.setItem('tix_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tix_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tix_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('tix_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('tix_saved_events', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem('tix_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const triggerNotification = (text: string) => {
    setActiveNotification(text);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  const updateEvent = async (updatedEvent: EventItem) => {
    // Update local state immediately
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));

    // Update in Firestore
    try {
      await setDoc(doc(db, 'events', updatedEvent.id), updatedEvent, { merge: true });
    } catch (err) {
      console.error('Error updating event in Firestore:', err);
    }

    triggerNotification(`Event "${updatedEvent.title}" updated successfully!`);
  };

  const createNewEvent = async (eventData: Omit<EventItem, 'id'> | EventItem) => {
    const candidateId = (eventData as EventItem).id;
    if (candidateId && events.some(e => e.id === candidateId)) {
      await updateEvent(eventData as EventItem);
      return;
    }

    const newId = candidateId || `evt-${Date.now().toString().slice(-4)}`;
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

  const deleteEvent = async (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    const affectedOrders = orders.filter(o => o.eventId === eventId);
    const affectedTickets = allTickets.filter(t => t.eventId === eventId);
    const totalRefundAmount = affectedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Update local states
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setOrders(prev => prev.filter(o => o.eventId !== eventId));
    setAllTickets(prev => prev.filter(t => t.eventId !== eventId));

    // Log cancellation & refund notifications
    if (affectedOrders.length > 0) {
      affectedOrders.forEach(ord => {
        const notifLog: NotificationLog = {
          id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId: ord.id,
          type: 'EMAIL',
          recipient: ord.customerEmail,
          subject: `🚨 EVENT CANCELLED: ${targetEvent.title} - Full Refund Processed`,
          bodyPreview: `We regret to inform you that "${targetEvent.title}" has been cancelled. A full refund of ₦${ord.totalAmount.toLocaleString()} has been initiated to your original payment method.`,
          sentAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          status: 'DELIVERED'
        };
        setNotificationLogs(prev => [notifLog, ...prev]);
      });
    }

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, 'events', eventId));
      for (const ord of affectedOrders) {
        await deleteDoc(doc(db, 'orders', ord.id));
      }
      for (const tkt of affectedTickets) {
        await deleteDoc(doc(db, 'tickets', tkt.ticketCode));
        await deleteDoc(doc(db, 'qr_tickets', `qr-${tkt.ticketCode}`));
      }
    } catch (err) {
      console.error('Error deleting event from Firestore:', err);
    }

    if (affectedOrders.length > 0) {
      triggerNotification(`Event "${targetEvent.title}" deleted. ₦${totalRefundAmount.toLocaleString()} refunded to ${affectedOrders.length} buyer(s).`);
    } else {
      triggerNotification(`Event "${targetEvent.title}" deleted successfully.`);
    }
  };

  const registerUser = (details: { fullName: string; email: string; phone: string; emailVerified?: boolean }): TicketaUser => {
    const cleanEmail = details.email.trim().toLowerCase();
    const cleanPhone = details.phone.trim();
    const cleanName = details.fullName.trim();

    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const updatedExisting: TicketaUser = {
        ...existing,
        emailVerified: details.emailVerified ?? existing.emailVerified ?? true,
        fullName: cleanName || existing.fullName,
        phone: cleanPhone || existing.phone
      };

      setUsers(prev => prev.map(u => u.id === existing.id ? updatedExisting : u));
      setCurrentUser(updatedExisting);

      const nameParts = updatedExisting.fullName.split(' ');
      const freshProfile: UserProfile = {
        firstName: nameParts[0] || updatedExisting.fullName,
        lastName: nameParts.slice(1).join(' ') || '',
        email: updatedExisting.email,
        phone: updatedExisting.phone,
        paymentCards: [],
        notifications: {
          remainders: true,
          purchaseAlerts: true,
          newEventAlert: true,
          marketing: false,
          newsletter: false
        }
      };
      setUserProfile(freshProfile);

      (async () => {
        try {
          await setDoc(doc(db, 'users', existing.id), updatedExisting);
        } catch (err) {
          console.error('Error updating existing user in Firestore:', err);
        }
      })();

      triggerNotification(`Welcome back, ${existing.fullName}! Account logged in.`);
      return updatedExisting;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newUserId = `usr-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: TicketaUser = {
      id: newUserId,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      registeredAt: todayStr,
      totalOrders: 0,
      totalSpent: 0,
      status: 'Verified',
      emailVerified: details.emailVerified ?? true,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`
    };

    const nameParts = cleanName.split(' ');
    const freshProfile: UserProfile = {
      firstName: nameParts[0] || cleanName,
      lastName: nameParts.slice(1).join(' ') || '',
      email: cleanEmail,
      phone: cleanPhone,
      paymentCards: [],
      notifications: {
        remainders: true,
        purchaseAlerts: true,
        newEventAlert: true,
        marketing: false,
        newsletter: false
      }
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setUserProfile(freshProfile);

    // Persist to Firestore
    (async () => {
      try {
        await setDoc(doc(db, 'users', newUserId), newUser);
        console.log(`User stored in Firebase Firestore at path users/${newUserId}:`, newUser);
      } catch (err) {
        console.error('Error writing user to Firestore:', err);
      }
    })();

    // Verification Log Entry
    const verifNotif: NotificationLog = {
      id: `notif-${Date.now()}-reg`,
      orderId: `REG-${newUserId}`,
      type: 'EMAIL',
      recipient: cleanEmail,
      subject: '✅ Email Address Verified & Ticketa Account Activated',
      bodyPreview: `Your email (${cleanEmail}) has been verified. Clean slate account ready on Ticketa & Firebase Firestore.`,
      sentAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'DELIVERED'
    };
    setNotificationLogs(prev => [verifNotif, ...prev]);

    triggerNotification(`Account created & verified for ${newUser.fullName}! Saved to Firebase.`);
    return newUser;
  };

  const loginUser = (email: string): TicketaUser | null => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      setCurrentUser(found);
      const nameParts = found.fullName.split(' ');
      setUserProfile(prev => ({
        ...prev,
        firstName: nameParts[0] || found.fullName,
        lastName: nameParts.slice(1).join(' ') || '',
        email: found.email,
        phone: found.phone
      }));
      triggerNotification(`Logged in as ${found.fullName}`);
      return found;
    }
    return null;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setUserProfile({
      firstName: 'Guest',
      lastName: '',
      email: '',
      phone: '',
      paymentCards: [],
      notifications: {
        remainders: true,
        purchaseAlerts: false,
        newEventAlert: false,
        marketing: false,
        newsletter: false
      }
    });
    triggerNotification('Signed out of Ticketa session.');
  };

  const purchaseTickets = (
    eventId: string,
    tierIdOrSelections: string | { [tierId: string]: number },
    quantityOrDetails: number | { name: string; email: string; phone: string },
    attendeeDetailsOrPayment?: { name: string; email: string; phone: string } | Order['paymentMethod'],
    paymentMethodOrDiscount?: Order['paymentMethod'] | number,
    discountPercentageParam = 0
  ): Order | null => {
    const eventObj = events.find(e => e.id === eventId);
    if (!eventObj) return null;

    let selectionsMap: { [tierId: string]: number } = {};
    let attendeeDetails: { name: string; email: string; phone: string };
    let paymentMethod: Order['paymentMethod'] = 'Flutterwave';
    let discountPercentage = 0;

    if (typeof tierIdOrSelections === 'object' && tierIdOrSelections !== null) {
      selectionsMap = tierIdOrSelections;
      if (typeof quantityOrDetails === 'object' && quantityOrDetails !== null) {
        attendeeDetails = quantityOrDetails;
        paymentMethod = (attendeeDetailsOrPayment as Order['paymentMethod']) || 'Flutterwave';
        discountPercentage = (paymentMethodOrDiscount as number) || 0;
      } else {
        attendeeDetails = attendeeDetailsOrPayment as { name: string; email: string; phone: string };
        paymentMethod = (paymentMethodOrDiscount as Order['paymentMethod']) || 'Flutterwave';
        discountPercentage = discountPercentageParam || 0;
      }
    } else {
      const tierId = tierIdOrSelections as string;
      const quantity = quantityOrDetails as number;
      selectionsMap = { [tierId]: quantity };
      attendeeDetails = attendeeDetailsOrPayment as { name: string; email: string; phone: string };
      paymentMethod = (paymentMethodOrDiscount as Order['paymentMethod']) || 'Flutterwave';
      discountPercentage = discountPercentageParam || 0;
    }

    const validEntries = Object.entries(selectionsMap).filter(([_, qty]) => qty > 0);
    if (validEntries.length === 0) return null;

    // Check availability for all selected tiers
    for (const [tId, qty] of validEntries) {
      const tier = eventObj.ticketTiers.find(t => t.id === tId);
      if (!tier || (tier.availableQuantity - tier.soldQuantity) < qty) {
        console.error(`Insufficient tickets available for tier ${tId}`);
        return null;
      }
    }

    // Updated ticket tiers sold quantities
    const updatedTicketTiers = eventObj.ticketTiers.map(t => {
      const qty = selectionsMap[t.id] || 0;
      if (qty <= 0) return t;
      return { ...t, soldQuantity: t.soldQuantity + qty };
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

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const tickets: TicketPass[] = [];
    let totalPaid = 0;
    let totalTicketsIssued = 0;

    for (const [tId, qty] of validEntries) {
      const tier = eventObj.ticketTiers.find(t => t.id === tId);
      if (!tier) continue;

      const unitPrice = tier.price * (1 - discountPercentage / 100);
      totalPaid += unitPrice * qty;

      for (let i = 0; i < qty; i++) {
        totalTicketsIssued++;
        const ticketCode = `TKT-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${totalTicketsIssued}`;
        tickets.push({
          ticketCode,
          orderId,
          eventId: eventObj.id,
          eventTitle: eventObj.title,
          eventDate: eventObj.date,
          eventTime: eventObj.time,
          venueName: eventObj.venueName,
          tierName: tier.name,
          attendeeName: totalTicketsIssued === 1 ? attendeeDetails.name : `${attendeeDetails.name} Guest ${totalTicketsIssued - 1}`,
          attendeeEmail: attendeeDetails.email,
          attendeePhone: attendeeDetails.phone,
          pricePaid: unitPrice,
          purchaseDate: nowStr,
          status: 'VALID'
        });
      }
    }

    const newOrder: Order = {
      id: orderId,
      eventId: eventObj.id,
      eventTitle: eventObj.title,
      customerName: attendeeDetails.name,
      customerEmail: attendeeDetails.email,
      customerPhone: attendeeDetails.phone,
      totalAmount: totalPaid,
      paymentMethod,
      purchaseDate: nowStr,
      tickets
    };

    // Update local orders state
    setOrders(prev => [newOrder, ...prev]);

    // Update allTickets state so tickets show up immediately in all ticket lists
    setAllTickets(prev => [...tickets, ...prev]);

    // Create or update TicketaUser for this attendee
    const cleanEmail = attendeeDetails.email.trim().toLowerCase();
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    const todayDate = new Date().toISOString().split('T')[0];

    let targetUser: TicketaUser;
    if (existingUser) {
      targetUser = {
        ...existingUser,
        fullName: attendeeDetails.name || existingUser.fullName,
        phone: attendeeDetails.phone || existingUser.phone,
        totalOrders: existingUser.totalOrders + 1,
        totalSpent: existingUser.totalSpent + totalPaid,
        lastPurchaseDate: todayDate
      };
      setUsers(prev => prev.map(u => (u.id === targetUser.id ? targetUser : u)));
    } else {
      targetUser = {
        id: `usr-${Math.floor(100 + Math.random() * 900)}`,
        fullName: attendeeDetails.name,
        email: cleanEmail,
        phone: attendeeDetails.phone || '',
        registeredAt: todayDate,
        totalOrders: 1,
        totalSpent: totalPaid,
        status: 'Active',
        lastPurchaseDate: todayDate
      };
      setUsers(prev => [targetUser, ...prev]);
    }

    // Set active current user if none is set
    if (!currentUser) {
      setCurrentUser(targetUser);
    }

    // Save order, updated event, and user to Firestore async
    (async () => {
      try {
        await setDoc(doc(db, 'orders', orderId), newOrder);
        await setDoc(doc(db, 'events', eventId), updatedEventObj);
        await setDoc(doc(db, 'users', targetUser.id), targetUser);
        
        // Save tickets to separate collection
        for (const t of tickets) {
          await setDoc(doc(db, 'tickets', t.ticketCode), t);
          
          const qrData: QrTicket = {
            id: `qr-${t.ticketCode}`,
            ticketCode: t.ticketCode,
            eventId: eventObj.id,
            status: 'VALID',
            qrData: JSON.stringify({ code: t.ticketCode, eventId: eventObj.id, tier: t.tierName })
          };
          await setDoc(doc(db, 'qr_tickets', qrData.id), qrData);
        }
      } catch (err) {
        console.error('Error writing records to Firestore:', err);
      }
    })();

    // Auto-dispatch Email and SMS ticket notifications
    sendTicketEmail(newOrder, attendeeDetails.email);
    sendTicketSms(newOrder, attendeeDetails.phone);

    triggerNotification(`Order #${orderId} confirmed! ${totalTicketsIssued} ticket(s) issued.`);
    return newOrder;
  };

  const sendTicketEmail = (orderOrTicket: Order | TicketPass, customEmail?: string) => {
    const recipient = customEmail || ('customerEmail' in orderOrTicket ? orderOrTicket.customerEmail : orderOrTicket.attendeeEmail);
    const orderId = 'id' in orderOrTicket ? orderOrTicket.id : orderOrTicket.orderId;
    const title = 'eventTitle' in orderOrTicket ? orderOrTicket.eventTitle : 'Ticketa Event';
    const code = 'tickets' in orderOrTicket ? orderOrTicket.tickets[0]?.ticketCode : orderOrTicket.ticketCode;

    const newLog: NotificationLog = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId,
      ticketCode: code,
      type: 'EMAIL',
      recipient: recipient || 'attendee@ticketa.com',
      subject: `🎟️ Official Event Pass: ${title}`,
      bodyPreview: `Your official digital ticket pass for ${title} is ready. Order #${orderId}. Present QR pass at entrance gate.`,
      sentAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'DELIVERED'
    };

    setNotificationLogs(prev => [newLog, ...prev]);
    triggerNotification(`📧 Email Ticket Pass sent to ${recipient}!`);
  };

  const sendTicketSms = async (orderOrTicket: Order | TicketPass, customPhone?: string) => {
    let recipient = customPhone || ('customerPhone' in orderOrTicket ? orderOrTicket.customerPhone : orderOrTicket.attendeePhone) || '+2348123456789';
    
    // Replace masked X characters if present
    if (/x/i.test(recipient)) {
      recipient = recipient.replace(/x/gi, '0');
    }

    const orderId = 'id' in orderOrTicket ? orderOrTicket.id : orderOrTicket.orderId;
    const title = 'eventTitle' in orderOrTicket ? orderOrTicket.eventTitle : 'Ticketa Event';
    const code = 'tickets' in orderOrTicket ? orderOrTicket.tickets[0]?.ticketCode : orderOrTicket.ticketCode;
    const message = `Ticketa SMS Pass for ${title}: Order #${orderId} (${code}). Show QR code at entrance: https://ticketa.app/pass/${code}`;

    const newLog: NotificationLog = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId,
      ticketCode: code,
      type: 'SMS',
      recipient,
      subject: 'Ticketa Mobile Pass Link',
      bodyPreview: message,
      sentAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'DELIVERED'
    };

    setNotificationLogs(prev => [newLog, ...prev]);

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, message })
      });
      const data = await response.json();
      
      if (response.ok) {
        triggerNotification(`📱 SMS Pass link dispatched to ${recipient}!`);
      } else {
        triggerNotification(`⚠️ SMS Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      triggerNotification(`⚠️ Failed to connect to SMS dispatch server.`);
    }
  };

  const syncOfflineScans = async () => {
    const unsynced = offlineQueue.filter(item => !item.synced);
    if (unsynced.length === 0) {
      triggerNotification('Sync complete: No unsynced offline records in queue.');
      return { syncedCount: 0, errors: 0 };
    }

    let syncedCount = 0;
    let errors = 0;

    for (const record of unsynced) {
      try {
        let foundOrder = orders.find(o => o.tickets.some(t => t.ticketCode === record.ticketCode));
        if (foundOrder) {
          const updatedTickets = foundOrder.tickets.map(t => {
            if (t.ticketCode === record.ticketCode) {
              return {
                ...t,
                status: 'CHECKED_IN' as const,
                checkedInAt: record.scannedAt,
                scannedByGate: record.gateName
              };
            }
            return t;
          });
          const updatedOrder = { ...foundOrder, tickets: updatedTickets };
          await setDoc(doc(db, 'orders', foundOrder.id), updatedOrder);
          
          const t = updatedTickets.find(t => t.ticketCode === record.ticketCode);
          if (t) {
            await setDoc(doc(db, 'tickets', t.ticketCode), t);
            
            const qrTicketRef = doc(db, 'qr_tickets', `qr-${t.ticketCode}`);
            await setDoc(qrTicketRef, {
              id: `qr-${t.ticketCode}`,
              ticketCode: t.ticketCode,
              eventId: t.eventId,
              status: 'CHECKED_IN',
              qrData: JSON.stringify({ code: t.ticketCode, eventId: t.eventId, tier: t.tierName }),
              scannedAt: record.scannedAt,
              assignedGate: record.gateName
            }, { merge: true });
          }
        }
        syncedCount++;
      } catch (e) {
        console.error('Error syncing offline scan to Firestore:', e);
        errors++;
      }
    }

    setOfflineQueue([]);
    triggerNotification(`✅ Synced ${syncedCount} offline scan(s) to server database!`);
    return { syncedCount, errors };
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
    triggerNotification('Offline scan queue cleared.');
  };

  const clearNotificationLogs = () => {
    setNotificationLogs([]);
    triggerNotification('Notification dispatch log cleared.');
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

    if (isOfflineMode) {
      const updatedTicket: TicketPass = {
        ...foundTicket,
        status: 'CHECKED_IN',
        checkedInAt: nowStr,
        scannedByGate: `${gateName} (Offline Queue)`,
        gateNumber: gateName.split('-')[0].trim()
      };

      const updatedOrder: Order = {
        ...targetOrder,
        tickets: targetOrder.tickets.map(tk => (tk.ticketCode === foundTicket!.ticketCode ? updatedTicket : tk))
      };

      setOrders(prevOrders =>
        prevOrders.map(ord => (ord.id === targetOrder!.id ? updatedOrder : ord))
      );

      const offlineRecord: OfflineScanRecord = {
        id: `off-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ticketCode: updatedTicket.ticketCode,
        gateName: updatedTicket.scannedByGate,
        scannedAt: nowStr,
        attendeeName: updatedTicket.attendeeName,
        eventTitle: updatedTicket.eventTitle,
        tierName: updatedTicket.tierName,
        synced: false
      };

      setOfflineQueue(prev => [offlineRecord, ...prev]);
      triggerNotification(`OFFLINE SCAN QUEUED: ${updatedTicket.attendeeName} (${updatedTicket.tierName}) saved to sync queue`);

      return {
        success: true,
        message: `OFFLINE SCAN QUEUED: Access Granted! Pass verified in local gate database.`,
        ticket: updatedTicket,
        isOfflineScan: true
      };
    }


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
        await setDoc(doc(db, 'tickets', updatedTicket.ticketCode), updatedTicket);
        
        const qrTicketRef = doc(db, 'qr_tickets', `qr-${updatedTicket.ticketCode}`);
        await setDoc(qrTicketRef, {
          id: `qr-${updatedTicket.ticketCode}`,
          ticketCode: updatedTicket.ticketCode,
          eventId: updatedTicket.eventId,
          status: 'CHECKED_IN',
          qrData: JSON.stringify({ code: updatedTicket.ticketCode, eventId: updatedTicket.eventId, tier: updatedTicket.tierName }),
          scannedAt: nowStr,
          assignedGate: gateName
        }, { merge: true });
        
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
    setEvents([]);
    setOrders([]);
    setAllTickets([]);
    setQrTickets([]);
    setPromos([]);
    setSavedEventIds([]);
    setUsers([]);
    setUserProfile(DEFAULT_PROFILE);

    localStorage.removeItem('tix_events');
    localStorage.removeItem('tix_orders');
    localStorage.removeItem('tix_all_tickets');
    localStorage.removeItem('tix_qr_tickets');
    localStorage.removeItem('tix_promos');
    localStorage.removeItem('tix_saved_events');
    localStorage.removeItem('tix_users');
    localStorage.removeItem('tix_user_profile');

    // Wipe Firestore collections
    try {
      const collectionsToWipe = ['events', 'orders', 'tickets', 'users', 'qr_tickets'];
      for (const colName of collectionsToWipe) {
        const snap = await getDocs(collection(db, colName));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
        }
      }
    } catch (e) {
      console.error('Error wiping Firestore data:', e);
    }

    triggerNotification('Platform dataset reset to clean zero state.');
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
        qrTickets,
        promos,
        savedEventIds,
        userProfile,
        users,
        currentUser,
        activeNotification,
        selectedEventId,
        setSelectedEventId,
        isOfflineMode,
        setIsOfflineMode,
        offlineQueue,
        syncOfflineScans,
        clearOfflineQueue,
        notificationLogs,
        sendTicketEmail,
        sendTicketSms,
        clearNotificationLogs,
        registerUser,
        loginUser,
        logoutUser,
        createNewEvent,
        updateEvent,
        deleteEvent,
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
