import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { EventItem, Order, TicketPass, TicketaUser, OrganizerUser, QrTicket, PromoCode, OfflineScanRecord, NotificationLog } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isUnavailable = errMsg.includes('unavailable') || errMsg.includes('Could not reach') || errMsg.includes('offline');
  const isQuotaExceeded = errMsg.includes('Quota limit exceeded') || errMsg.includes('Quota exceeded') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isUnavailable || isQuotaExceeded) {
    console.warn(`[Firestore Fallback Notice] ${isQuotaExceeded ? 'Daily Firestore quota limit reached' : 'Transient network state'} for ${path}. Operating seamlessly with local cached storage.`);
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  return errInfo;
}

export function sanitizeForFirestore<T>(obj: T): any {
  if (obj === undefined || obj === null) return null;
  return JSON.parse(JSON.stringify(obj, (_key, value) => {
    if (value === undefined) return null;
    return value;
  }));
}

async function fetchCollectionDocs<T>(path: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, path));
    const items: T[] = [];
    snap.forEach(d => {
      if (d.exists()) items.push(d.data() as T);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export function subscribeToCollection<T>(path: string, callback: (items: T[]) => void): () => void {
  try {
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snap) => {
        const items: T[] = [];
        snap.forEach(d => {
          if (d.exists()) items.push(d.data() as T);
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn(`[Firestore] Failed to subscribe to ${path}:`, err);
    return () => {};
  }
}

export async function loadAllFromFirestore() {
  try {
    const [events, orders, users, organizers, tickets, qrTickets, promos, scanRecords, notifications] = await Promise.all([
      fetchCollectionDocs<EventItem>('events'),
      fetchCollectionDocs<Order>('orders'),
      fetchCollectionDocs<TicketaUser>('users'),
      fetchCollectionDocs<OrganizerUser>('organizers'),
      fetchCollectionDocs<TicketPass>('tickets'),
      fetchCollectionDocs<QrTicket>('qr_tickets'),
      fetchCollectionDocs<PromoCode>('promos'),
      fetchCollectionDocs<OfflineScanRecord>('scan_records'),
      fetchCollectionDocs<NotificationLog>('notifications')
    ]);

    return { events, orders, users, organizers, tickets, qrTickets, promos, scanRecords, notifications };
  } catch (error) {
    console.warn('Firestore loadAll notice:', error);
    return null;
  }
}


export async function saveUserToFirestore(user: TicketaUser) {
  try {
    if (!user || !user.id) return;
    await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user), { merge: true });
    console.log(`[Firestore] Saved user: ${user.id} (${user.email})`);
  } catch (err) {
    console.error(`[Firestore] Failed to save user ${user?.id}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `users/${user?.id}`);
  }
}

export async function saveOrganizerToFirestore(organizer: OrganizerUser) {
  try {
    if (!organizer || !organizer.id) return;
    await setDoc(doc(db, 'organizers', organizer.id), sanitizeForFirestore(organizer), { merge: true });
    console.log(`[Firestore] Saved organizer: ${organizer.id} (${organizer.email})`);
  } catch (err) {
    console.error(`[Firestore] Failed to save organizer ${organizer?.id}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `organizers/${organizer?.id}`);
  }
}

export async function saveEventToFirestore(event: EventItem) {
  try {
    if (!event || !event.id) return;
    await setDoc(doc(db, 'events', event.id), sanitizeForFirestore(event), { merge: true });
    console.log(`[Firestore] Saved event: ${event.id}`);
  } catch (err) {
    console.error(`[Firestore] Failed to save event ${event?.id}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `events/${event?.id}`);
  }
}

export async function deleteEventFromFirestore(eventId: string) {
  try {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId));
    console.log(`[Firestore] Deleted event: ${eventId}`);
  } catch (err) {
    console.error(`[Firestore] Failed to delete event ${eventId}:`, err);
    handleFirestoreError(err, OperationType.DELETE, `events/${eventId}`);
  }
}

export async function saveOrderToFirestore(order: Order) {
  try {
    if (!order || !order.id) return;
    await setDoc(doc(db, 'orders', order.id), sanitizeForFirestore(order), { merge: true });
    console.log(`[Firestore] Saved order: ${order.id}`);
  } catch (err) {
    console.error(`[Firestore] Failed to save order ${order?.id}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `orders/${order?.id}`);
  }
}

export async function saveTicketToFirestore(ticket: TicketPass) {
  try {
    if (!ticket || !ticket.ticketCode) return;
    await setDoc(doc(db, 'tickets', ticket.ticketCode), sanitizeForFirestore(ticket), { merge: true });
    console.log(`[Firestore] Saved ticket: ${ticket.ticketCode}`);
  } catch (err) {
    console.error(`[Firestore] Failed to save ticket ${ticket?.ticketCode}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `tickets/${ticket?.ticketCode}`);
  }
}

export async function saveQrTicketToFirestore(qrTicket: QrTicket) {
  try {
    if (!qrTicket || !qrTicket.ticketCode) return;
    await setDoc(doc(db, 'qr_tickets', qrTicket.ticketCode), sanitizeForFirestore(qrTicket), { merge: true });
    console.log(`[Firestore] Saved qr_ticket: ${qrTicket.ticketCode}`);
  } catch (err) {
    console.error(`[Firestore] Failed to save qr_ticket ${qrTicket?.ticketCode}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `qr_tickets/${qrTicket?.ticketCode}`);
  }
}

export async function savePromoToFirestore(promo: PromoCode) {
  try {
    if (!promo || !promo.code) return;
    await setDoc(doc(db, 'promos', promo.code), sanitizeForFirestore(promo), { merge: true });
    console.log(`[Firestore] Saved promo: ${promo.code}`);
  } catch (err) {
    console.error(`[Firestore] Failed to save promo ${promo?.code}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `promos/${promo?.code}`);
  }
}

export async function saveScanRecordToFirestore(record: OfflineScanRecord) {
  try {
    if (!record || !record.id) return;
    await setDoc(doc(db, 'scan_records', record.id), sanitizeForFirestore(record), { merge: true });
    console.log(`[Firestore] Saved scan record: ${record.id}`);
  } catch (err) {
    console.error(`[Firestore] Failed to save scan_record ${record?.id}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `scan_records/${record?.id}`);
  }
}

export async function saveNotificationToFirestore(notif: NotificationLog) {
  try {
    if (!notif || !notif.id) return;
    await setDoc(doc(db, 'notifications', notif.id), sanitizeForFirestore(notif), { merge: true });
    console.log(`[Firestore] Saved notification: ${notif.id}`);
  } catch (err) {
    console.error(`[Firestore] Failed to save notification ${notif?.id}:`, err);
    handleFirestoreError(err, OperationType.WRITE, `notifications/${notif?.id}`);
  }
}

export async function syncAllToFirestore(data: {
  events?: EventItem[];
  orders?: Order[];
  users?: TicketaUser[];
  organizers?: OrganizerUser[];
  tickets?: TicketPass[];
  qrTickets?: QrTicket[];
  promos?: PromoCode[];
  scanRecords?: OfflineScanRecord[];
  notifications?: NotificationLog[];
}) {
  try {
    const promises: Promise<any>[] = [];

    if (data.users && data.users.length > 0) {
      data.users.forEach(u => u && u.id && promises.push(saveUserToFirestore(u)));
    }
    if (data.organizers && data.organizers.length > 0) {
      data.organizers.forEach(o => o && o.id && promises.push(saveOrganizerToFirestore(o)));
    }
    if (data.events && data.events.length > 0) {
      data.events.forEach(e => e && e.id && promises.push(saveEventToFirestore(e)));
    }
    if (data.orders && data.orders.length > 0) {
      data.orders.forEach(ord => ord && ord.id && promises.push(saveOrderToFirestore(ord)));
    }
    if (data.tickets && data.tickets.length > 0) {
      data.tickets.forEach(t => t && t.ticketCode && promises.push(saveTicketToFirestore(t)));
    }
    if (data.qrTickets && data.qrTickets.length > 0) {
      data.qrTickets.forEach(q => q && q.ticketCode && promises.push(saveQrTicketToFirestore(q)));
    }
    if (data.promos && data.promos.length > 0) {
      data.promos.forEach(p => p && p.code && promises.push(savePromoToFirestore(p)));
    }
    if (data.scanRecords && data.scanRecords.length > 0) {
      data.scanRecords.forEach(s => s && s.id && promises.push(saveScanRecordToFirestore(s)));
    }
    if (data.notifications && data.notifications.length > 0) {
      data.notifications.forEach(n => n && n.id && promises.push(saveNotificationToFirestore(n)));
    }

    await Promise.all(promises);
  } catch (err) {
    console.warn('Firestore syncAll error:', err);
  }
}
