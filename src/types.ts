export type PlatformType = 'attendee-web' | 'attendee-mobile' | 'organizer' | 'staff-checkin';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  availableQuantity: number;
  soldQuantity: number;
  maxPerOrder: number;
  perks?: string[];
}

export type EventCategory = 'Concerts' | 'Comedy' | 'Tech' | 'Festival' | 'Conference' | 'Workshop' | 'Exhibition' | 'Sports';

export interface EventItem {
  id: string;
  title: string;
  organizerName: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  venueName: string;
  address: string;
  image: string;
  bannerImage: string;
  description: string;
  featured?: boolean;
  ticketTiers: TicketTier[];
  tags: string[];
  expectations?: string[];
  refundPolicy?: string;
  importantInfo?: string[];
}

export interface TicketPass {
  ticketCode: string; // e.g. TKT-9821-X9
  orderId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  tierName: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  pricePaid: number;
  purchaseDate: string;
  status: 'VALID' | 'CHECKED_IN' | 'CANCELLED';
  checkedInAt?: string;
  scannedByGate?: string;
  gateNumber?: string;
}

export interface PaymentCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
  isDefault?: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentCards: PaymentCard[];
  notifications: {
    remainders: boolean;
    purchaseAlerts: boolean;
    newEventAlert: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
}

export interface TicketaUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registeredAt: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Verified';
  avatarUrl?: string;
  lastPurchaseDate?: string;
}

export interface Order {
  id: string;
  eventId: string;
  eventTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: 'Credit Card' | 'Bank Transfer' | 'Apple Pay' | 'Google Pay' | 'PayPal';
  purchaseDate: string;
  tickets: TicketPass[];
}

export interface CheckInStats {
  totalTickets: number;
  totalCheckedIn: number;
  recentScans: TicketPass[];
  gateBreakdown: { [gateName: string]: number };
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
  active: boolean;
  usedCount: number;
}

export interface QrTicket {
  id: string;
  ticketCode: string;
  eventId: string;
  status: 'VALID' | 'CHECKED_IN' | 'CANCELLED';
  qrData: string;
  assignedGate?: string;
  scannedAt?: string;
}

export interface OfflineScanRecord {
  id: string;
  ticketCode: string;
  gateName: string;
  scannedAt: string;
  attendeeName: string;
  eventTitle: string;
  tierName: string;
  synced: boolean;
}

export interface NotificationLog {
  id: string;
  orderId: string;
  ticketCode?: string;
  type: 'EMAIL' | 'SMS';
  recipient: string;
  subject: string;
  bodyPreview: string;
  sentAt: string;
  status: 'DELIVERED' | 'QUEUED' | 'FAILED';
}

