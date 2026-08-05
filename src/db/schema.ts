import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, json } from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  role: text('role').default('attendee'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Organizers table
export const organizers = pgTable('organizers', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  organizationName: text('organization_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Events table
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  organizerName: text('organizer_name').notNull(),
  organizerId: text('organizer_id'),
  category: text('category').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  location: text('location').notNull(),
  venueName: text('venue_name').notNull(),
  address: text('address').notNull(),
  image: text('image').notNull(),
  bannerImage: text('banner_image').notNull(),
  description: text('description').notNull(),
  featured: boolean('featured').default(false),
  ticketTiers: json('ticket_tiers').$type<any[]>().notNull(),
  tags: json('tags').$type<string[]>().notNull(),
  currency: text('currency').default('NGN'),
  country: text('country').default('Nigeria'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  eventId: text('event_id').notNull(),
  eventTitle: text('event_title').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  totalAmount: integer('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  purchaseDate: text('purchase_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tickets table
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketCode: text('ticket_code').notNull().unique(),
  orderId: text('order_id').notNull(),
  eventId: text('event_id').notNull(),
  eventTitle: text('event_title').notNull(),
  eventDate: text('event_date').notNull(),
  eventTime: text('event_time').notNull(),
  venueName: text('venue_name').notNull(),
  tierName: text('tier_name').notNull(),
  attendeeName: text('attendee_name').notNull(),
  attendeeEmail: text('attendee_email').notNull(),
  attendeePhone: text('attendee_phone'),
  pricePaid: integer('price_paid').notNull(),
  purchaseDate: text('purchase_date').notNull(),
  status: text('status').default('VALID'),
  checkedInAt: text('checked_in_at'),
  scannedByGate: text('scanned_by_gate'),
  gateNumber: text('gate_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  organizers: many(organizers),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
