import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { EventItem, Order, TicketPass, TicketaUser, OrganizerUser } from '../types';

export function sanitizeForFirestore<T>(obj: T): any {
  if (obj === undefined || obj === null) return null;
  return JSON.parse(JSON.stringify(obj, (_key, value) => {
    if (value === undefined) return null;
    return value;
  }));
}

export async function loadAllFromFirestore() {
  try {
    const [eventsSnap, ordersSnap, usersSnap, orgsSnap, ticketsSnap] = await Promise.all([
      getDocs(collection(db, 'events')),
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'organizers')),
      getDocs(collection(db, 'tickets'))
    ]);

    const events: EventItem[] = [];
    eventsSnap.forEach(docSnap => events.push(docSnap.data() as EventItem));

    const orders: Order[] = [];
    ordersSnap.forEach(docSnap => orders.push(docSnap.data() as Order));

    const users: TicketaUser[] = [];
    usersSnap.forEach(docSnap => users.push(docSnap.data() as TicketaUser));

    const organizers: OrganizerUser[] = [];
    orgsSnap.forEach(docSnap => organizers.push(docSnap.data() as OrganizerUser));

    const tickets: TicketPass[] = [];
    ticketsSnap.forEach(docSnap => tickets.push(docSnap.data() as TicketPass));

    return { events, orders, users, organizers, tickets };
  } catch (error) {
    console.warn('Firestore loadAll error:', error);
    return null;
  }
}

export async function saveUserToFirestore(user: TicketaUser) {
  try {
    if (!user || !user.id) return;
    await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user), { merge: true });
  } catch (err) {
    console.warn('Firestore saveUser error:', err);
  }
}

export async function saveOrganizerToFirestore(organizer: OrganizerUser) {
  try {
    if (!organizer || !organizer.id) return;
    await setDoc(doc(db, 'organizers', organizer.id), sanitizeForFirestore(organizer), { merge: true });
  } catch (err) {
    console.warn('Firestore saveOrganizer error:', err);
  }
}

export async function saveEventToFirestore(event: EventItem) {
  try {
    if (!event || !event.id) return;
    await setDoc(doc(db, 'events', event.id), sanitizeForFirestore(event), { merge: true });
  } catch (err) {
    console.warn('Firestore saveEvent error:', err);
  }
}

export async function deleteEventFromFirestore(eventId: string) {
  try {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId));
  } catch (err) {
    console.warn('Firestore deleteEvent error:', err);
  }
}

export async function saveOrderToFirestore(order: Order) {
  try {
    if (!order || !order.id) return;
    await setDoc(doc(db, 'orders', order.id), sanitizeForFirestore(order), { merge: true });
  } catch (err) {
    console.warn('Firestore saveOrder error:', err);
  }
}

export async function saveTicketToFirestore(ticket: TicketPass) {
  try {
    if (!ticket || !ticket.ticketCode) return;
    await setDoc(doc(db, 'tickets', ticket.ticketCode), sanitizeForFirestore(ticket), { merge: true });
  } catch (err) {
    console.warn('Firestore saveTicket error:', err);
  }
}

export async function syncAllToFirestore(data: {
  events?: EventItem[];
  orders?: Order[];
  users?: TicketaUser[];
  organizers?: OrganizerUser[];
  tickets?: TicketPass[];
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

    await Promise.all(promises);
  } catch (err) {
    console.warn('Firestore syncAll error:', err);
  }
}
